import rafSchd from 'raf-schd';

import {
	type AllDragTypes,
	type DragLocation,
	type DragLocationHistory,
	type EventPayloadMap,
} from '../internal-types';

const scheduleOnDrag = rafSchd((fn: () => void) => fn());

const dragStart = (() => {
	let scheduled: { frameId: number; fn: () => void } | null = null;

	function schedule(fn: () => void) {
		const frameId = requestAnimationFrame(() => {
			scheduled = null;
			fn();
		});
		scheduled = {
			frameId: frameId,
			fn,
		};
	}
	function flush() {
		if (scheduled) {
			cancelAnimationFrame(scheduled.frameId);
			scheduled.fn();
			scheduled = null;
		}
	}

	return { schedule, flush };
})();

export function makeDispatch<DragType extends AllDragTypes>({
	source,
	initial,
	dispatchEvent,
}: {
	source: DragType['payload'];
	initial: DragLocation;
	dispatchEvent: <EventName extends keyof EventPayloadMap<DragType>>(args: {
		eventName: EventName;
		payload: EventPayloadMap<DragType>[EventName];
	}) => void;
}) {
	let previous: DragLocationHistory['previous'] = { dropTargets: [] };

	function safeDispatch(args: Parameters<typeof dispatchEvent>[0]) {
		dispatchEvent(args);
		previous = { dropTargets: args.payload.location.current.dropTargets };
	}

	const dispatch = {
		start({ nativeSetDragImage }: { nativeSetDragImage: DataTransfer['setDragImage'] | null }) {
			// Ensuring that both `onGenerateDragPreview` and `onDragStart` get the same location.
			// We do this so that `previous` is`[]` in `onDragStart` (which is logical)
			const location = {
				current: initial,
				previous,
				initial,
			};
			// a `onGenerateDragPreview` does _not_ add another entry for `previous`
			// onDragPreview
			safeDispatch({
				eventName: 'onGenerateDragPreview',
				payload: {
					source,
					location,
					nativeSetDragImage,
				},
			});
			dragStart.schedule(() => {
				safeDispatch({
					eventName: 'onDragStart',
					payload: {
						source,
						location,
					},
				});
			});
		},
		dragUpdate({ current }: { current: DragLocation }) {
			dragStart.flush();
			scheduleOnDrag.cancel();
			safeDispatch({
				eventName: 'onDropTargetChange',
				payload: {
					source,
					location: {
						initial,
						previous,
						current,
					},
				},
			});
		},
		drag({ current }: { current: DragLocation }) {
			scheduleOnDrag(() => {
				dragStart.flush();
				const location = {
					initial,
					previous,
					current,
				};
				safeDispatch({
					eventName: 'onDrag',
					payload: {
						source,
						location,
					},
				});
			});
		},
		drop({
			current,
			updatedSourcePayload,
		}: {
			current: DragLocation;
			/** When dragging from an external source, we need to collect the
          drag source information again as it is often only available during
          the "drop" event */
			updatedSourcePayload: DragType['payload'] | null;
		}) {
			dragStart.flush();
			scheduleOnDrag.cancel();
			safeDispatch({
				eventName: 'onDrop',
				payload: {
					source: updatedSourcePayload ?? source,
					location: {
						current,
						previous,
						initial,
					},
				},
			});
		},
	};
	return dispatch;
}
