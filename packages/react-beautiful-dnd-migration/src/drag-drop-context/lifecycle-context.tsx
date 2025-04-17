/**
 * The lifecycle methods owned by this provided are used to align internal
 * timings with those of the rbd lifecycle.
 *
 * The events are intentionally distinct to those exposed by rbd to avoid
 * any confusion around whether events are fired internally or externally
 * first.
 */

import React, { createContext, type ReactNode, useCallback, useContext, useState } from 'react';

import type { DraggableId, DraggableLocation, DragStart, DragUpdate } from 'react-beautiful-dnd';

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';

import type { CleanupFn } from '../internal-types';
import { batchUpdatesForReact16 } from '../utils/batch-updates-for-react-16';

import type { DroppableRegistryEntry } from './droppable-registry';
import { rbdInvariant } from './rbd-invariant';

/**
 * The data associated with each type of lifecycle event.
 */
type DispatchData = {
	onPendingDragStart: {
		start: DragStart;
		droppable: DroppableRegistryEntry;
	};
	onPrePendingDragUpdate: {
		update: DragUpdate;
		targetLocation: DraggableLocation | null;
	};
	onPendingDragUpdate: DispatchData['onPrePendingDragUpdate'] & {
		droppable: DroppableRegistryEntry | null;
	};
	onBeforeDragEnd: {
		draggableId: DraggableId;
	};
};

type LifecycleResponders = {
	[Key in keyof DispatchData]: (args: DispatchData[Key]) => void;
};

type LifecycleEvent = keyof LifecycleResponders;

type Registry = {
	[Key in keyof LifecycleResponders]: LifecycleResponders[Key][];
};

type AddResponder = <Event extends LifecycleEvent>(
	event: Event,
	responder: LifecycleResponders[Event],
) => CleanupFn;

type Dispatch = <Event extends LifecycleEvent>(event: Event, data: DispatchData[Event]) => void;

type LifecycleManager = {
	addResponder: AddResponder;
	dispatch: Dispatch;
};

function createRegistry(): Registry {
	return {
		onPendingDragStart: [],
		onPrePendingDragUpdate: [],
		onPendingDragUpdate: [],
		onBeforeDragEnd: [],
	};
}

function createLifecycleManager(): LifecycleManager {
	const registry = createRegistry();

	const addResponder: AddResponder = (event, responder) => {
		registry[event].push(responder);

		return () => {
			// @ts-expect-error - type narrowing issues
			registry[event] = registry[event].filter((value) => value !== responder);
		};
	};

	const dispatch: Dispatch = (event, data) => {
		batchUpdatesForReact16(() => {
			for (const responder of registry[event]) {
				responder(data);
			}
		});
	};

	return { addResponder, dispatch };
}

/**
 * Creates a new lifecycle manager, returning methods for interfacing with it.
 */
export function useLifecycle(): LifecycleManager {
	const [lifecycleManager] = useState<LifecycleManager>(createLifecycleManager);

	return lifecycleManager;
}

type MonitorForLifecycle = (args: Partial<LifecycleResponders>) => CleanupFn;

const LifecycleContext = createContext<MonitorForLifecycle | null>(null);

export function LifecycleContextProvider({
	children,
	lifecycle,
}: {
	children: ReactNode;
	lifecycle: LifecycleManager;
}) {
	/**
	 * Allows for `<Draggable>` and `<Droppable>` instances to know about the
	 * lifecycle timings.
	 *
	 * Designed to have a similar API to the pdnd monitors.
	 */
	const monitorForLifecycle: MonitorForLifecycle = useCallback(
		(responders) => {
			const cleanupFns = [];

			for (const entry of Object.entries(responders)) {
				const [event, responder] = entry as [LifecycleEvent, LifecycleResponders[LifecycleEvent]];

				cleanupFns.push(lifecycle.addResponder(event, responder));
			}

			return combine(...cleanupFns);
		},
		[lifecycle],
	);

	return (
		<LifecycleContext.Provider value={monitorForLifecycle}>{children}</LifecycleContext.Provider>
	);
}

export function useMonitorForLifecycle(): MonitorForLifecycle {
	const monitorForLifecycle = useContext(LifecycleContext);
	rbdInvariant(
		monitorForLifecycle !== null,
		'useLifecycle() should only be called inside of a <DragDropContext />',
	);

	return monitorForLifecycle;
}
