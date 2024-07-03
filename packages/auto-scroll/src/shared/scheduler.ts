import { getElementFromPointWithoutHoneypot } from '@atlaskit/pragmatic-drag-and-drop/private/get-element-from-point-without-honey-pot';
import {
	type AllDragTypes,
	type BaseEventPayload,
	type CleanupFn,
	type MonitorArgs,
} from '@atlaskit/pragmatic-drag-and-drop/types';

import { clearEngagementHistory, clearUnusedEngagements } from './engagement-history';

type State<DragType extends AllDragTypes> =
	| {
			type: 'idle';
	  }
	| {
			// When the auto scroller first starts, we need to wait
			// for a single frame before we can start scrolling.
			// This is so that we can always have an accurate `timeSinceLastFrame`.
			// `timeSinceLastFrame` is used to dynamically change the max
			// scroll speed based on the frame rate.
			type: 'initializing';
			frameId: number;
			latestArgs: BaseEventPayload<DragType>;
	  }
	| {
			type: 'running';
			frameId: number;
			timeLastFrameFinished: DOMHighResTimeStamp;
			latestArgs: BaseEventPayload<DragType>;
	  };

type OnFrameFn<DragType extends AllDragTypes> = (args: {
	// This is a shared starting point between the
	// "overflow" and "over element auto scroller's.
	// This is important to ensure that there is a clean handover between the auto scroller's
	underUsersPointer: Element | null;
	latestArgs: BaseEventPayload<DragType>;
	timeSinceLastFrame: number;
}) => void;

type Scheduler<DragType extends AllDragTypes> = {
	onFrame: (fn: OnFrameFn<DragType>) => void;
};

// We keep this map so that "over element" scrolling and "overflow" scrolling
// can leverage the same scheduler.
// The 'monitor' is the key for looking up schedulers
const schedulers: Map<
	(args: MonitorArgs<AllDragTypes>) => CleanupFn,
	Scheduler<AllDragTypes>
> = new Map();

export function getScheduler<DragType extends AllDragTypes>(
	monitor: (args: MonitorArgs<DragType>) => CleanupFn,
): Scheduler<DragType> {
	const scheduler = schedulers.get(monitor);
	if (scheduler) {
		// @ts-expect-error: I don't know how to link the DragType generic between the key and the value when the
		// monitor itself is the key
		return scheduler;
	}
	const created = makeScheduler(monitor);
	schedulers.set(monitor, created);
	return created;
}

function makeScheduler<DragType extends AllDragTypes>(
	monitor: (args: MonitorArgs<DragType>) => CleanupFn,
): Scheduler<DragType> {
	let state: State<DragType> = { type: 'idle' };
	const callbacks: OnFrameFn<DragType>[] = [];

	function loop(timeLastFrameFinished: DOMHighResTimeStamp) {
		if (state.type !== 'running') {
			return;
		}
		const timeSinceLastFrame = timeLastFrameFinished - state.timeLastFrameFinished;

		const { latestArgs } = state;

		// A common starting lookup point for determining
		// which auto scroller should be used, and what should be scrolled.
		const underUsersPointer = getElementFromPointWithoutHoneypot({
			x: latestArgs.location.current.input.clientX,
			y: latestArgs.location.current.input.clientY,
		});

		clearUnusedEngagements(() => {
			callbacks.forEach((onFrame) =>
				onFrame({ underUsersPointer, latestArgs, timeSinceLastFrame }),
			);
		});

		state.timeLastFrameFinished = timeLastFrameFinished;
		state.frameId = requestAnimationFrame(loop);
	}

	function reset() {
		if (state.type === 'idle') {
			return;
		}
		cancelAnimationFrame(state.frameId);
		clearEngagementHistory();
		state = { type: 'idle' };
	}

	function start(args: BaseEventPayload<DragType>) {
		if (state.type !== 'idle') {
			return;
		}

		state = {
			// Waiting a frame so we can accurately determine `timeSinceLastFrame`.
			type: 'initializing',
			latestArgs: args,
			frameId: requestAnimationFrame((timeLastFrameFinished) => {
				if (state.type !== 'initializing') {
					return;
				}
				state = {
					type: 'running',
					timeLastFrameFinished,
					latestArgs: state.latestArgs,
					frameId: requestAnimationFrame(loop),
				};
			}),
		};
	}

	// this module might have been imported after a drag has started
	// We are starting the auto scroller if we get an update event and
	// the auto scroller has not started yet
	function update(args: BaseEventPayload<DragType>) {
		if (state.type === 'idle') {
			start(args);
			return;
		}
		state.latestArgs = args;
	}

	// Not exposing a way to stop listening
	monitor({
		onDragStart: start,
		onDropTargetChange: update,
		onDrag: update,
		onDrop: reset,
	});

	const api: Scheduler<DragType> = {
		onFrame(fn: OnFrameFn<DragType>) {
			callbacks.push(fn);
		},
	};
	return api;
}
