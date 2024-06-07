import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import type {
	AllDragTypes,
	BaseEventPayload,
	CleanupFn,
	MonitorArgs,
} from '@atlaskit/pragmatic-drag-and-drop/types';

import type { ElementAutoScrollArgs, WindowAutoScrollArgs } from '../internal-types';
import { getScheduler } from '../shared/scheduler';

import { addScrollableAttribute } from './data-attributes';
import { tryScroll } from './try-scroll';

export function makeApi<DragType extends AllDragTypes>({
	monitor,
}: {
	monitor: (args: MonitorArgs<DragType>) => CleanupFn;
}) {
	const elementRegistry: Map<Element, ElementAutoScrollArgs<DragType>> = new Map();
	const windowRegistry: Set<WindowAutoScrollArgs<DragType>> = new Set();

	function autoScroll(args: ElementAutoScrollArgs<DragType>): CleanupFn {
		// Warn during development if trying to add auto scroll to an element
		// that is not scrollable.
		// Note: this can produce a false positive when a scroll container is not
		// scrollable initially, but becomes scrollable during a drag.
		// I thought of adding the warning as I think it would be a more common pitfall
		// to accidentally register auto scrolling on the wrong element
		// If requested, we could provide a mechanism to opt out of this warning
		if (process.env.NODE_ENV !== 'production') {
			const { overflowX, overflowY }: CSSStyleDeclaration = window.getComputedStyle(args.element);
			const isScrollable =
				overflowX === 'auto' ||
				overflowX === 'scroll' ||
				overflowY === 'auto' ||
				overflowY === 'scroll';
			if (!isScrollable) {
				// eslint-disable-next-line no-console
				console.warn(
					'Auto scrolling has been attached to an element that appears not to be scrollable',
					{ element: args.element, overflowX, overflowY },
				);
			}
		}

		// Warn if there is an existing registration
		if (process.env.NODE_ENV !== 'production') {
			const existing = elementRegistry.get(args.element);
			if (existing) {
				// eslint-disable-next-line no-console
				console.warn('You have already registered autoScrolling on the same element', {
					existing,
					proposed: args,
				});
			}
		}

		elementRegistry.set(args.element, args);

		return combine(addScrollableAttribute(args.element), () =>
			elementRegistry.delete(args.element),
		);
	}

	function autoScrollWindow(args: WindowAutoScrollArgs<DragType> = {}): CleanupFn {
		// Putting `args` in a unique object so that
		// each call will create a unique entry, even if a consumer
		// shares the `args` object between calls.
		// Just being safe here.
		const unique = { ...args };
		windowRegistry.add(unique);
		return () => windowRegistry.delete(unique);
	}

	function findEntry(element: Element): ElementAutoScrollArgs<DragType> | null {
		return elementRegistry.get(element) ?? null;
	}

	function getWindowScrollEntries(): WindowAutoScrollArgs<DragType>[] {
		return Array.from(windowRegistry);
	}

	function onFrame({
		latestArgs,
		underUsersPointer,
		timeSinceLastFrame,
	}: {
		latestArgs: BaseEventPayload<DragType>;
		underUsersPointer: Element | null;
		timeSinceLastFrame: number;
	}) {
		tryScroll({
			input: latestArgs.location.current.input,
			source: latestArgs.source,
			findEntry,
			underUsersPointer,
			timeSinceLastFrame,
			getWindowScrollEntries,
		});
	}

	getScheduler(monitor).onFrame(onFrame);

	return {
		autoScroll,
		autoScrollWindow,
	};
}
