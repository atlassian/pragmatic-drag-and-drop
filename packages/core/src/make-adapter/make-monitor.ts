import {
	type AllDragTypes,
	type CleanupFn,
	type EventPayloadMap,
	type MonitorArgs,
	type MonitorGetFeedbackArgs,
} from '../internal-types';

type DraggingState<DragType extends AllDragTypes> = {
	canMonitorArgs: MonitorGetFeedbackArgs<DragType>;
	active: Set<MonitorArgs<DragType>>;
};

export function makeMonitor<DragType extends AllDragTypes>() {
	const registry = new Set<MonitorArgs<DragType>>();

	let dragging: DraggingState<DragType> | null = null;

	function tryAddToActive(monitor: MonitorArgs<DragType>) {
		if (!dragging) {
			return;
		}
		// Monitor is allowed to monitor events if:
		// 1. It has no `canMonitor` function (default is that a monitor can listen to everything)
		// 2. `canMonitor` returns true
		if (!monitor.canMonitor || monitor.canMonitor(dragging.canMonitorArgs)) {
			dragging.active.add(monitor);
		}
	}

	function monitorForConsumers(args: MonitorArgs<DragType>): CleanupFn {
		// We are giving each `args` a new reference so that you
		// can create multiple monitors with the same `args`.
		const entry: MonitorArgs<DragType> = { ...args };

		registry.add(entry);

		// if there is an active drag we need to see if this new monitor is relevant
		tryAddToActive(entry);

		return function cleanup() {
			registry.delete(entry);

			// We need to stop publishing events during a drag to this monitor!
			if (dragging) {
				dragging.active.delete(entry);
			}
		};
	}

	function dispatchEvent<EventName extends keyof EventPayloadMap<DragType>>({
		eventName,
		payload,
	}: {
		eventName: EventName;
		payload: EventPayloadMap<DragType>[EventName];
	}) {
		if (eventName === 'onGenerateDragPreview') {
			dragging = {
				canMonitorArgs: {
					initial: payload.location.initial,
					source: payload.source,
				},
				active: new Set(),
			};
			for (const monitor of registry) {
				tryAddToActive(monitor);
			}
		}

		// This should never happen.
		if (!dragging) {
			return;
		}

		// Creating an array from the set _before_ iterating
		// This is so that monitors added during the current event will not be called.
		// This behaviour matches native EventTargets where an event listener
		// cannot add another event listener during an active event to the same
		// event target in the same event (for us we have a single global event target)
		const active: MonitorArgs<DragType>[] = Array.from(dragging.active);
		for (const monitor of active) {
			// A monitor can be removed by another monitor during an event.
			// We need to check that the monitor is still registered before calling it
			if (dragging.active.has(monitor)) {
				// @ts-expect-error: I cannot get this type working!
				monitor[eventName]?.(payload);
			}
		}

		if (eventName === 'onDrop') {
			dragging.active.clear();
			dragging = null;
		}
	}

	return {
		dispatchEvent,
		monitorForConsumers,
	};
}
