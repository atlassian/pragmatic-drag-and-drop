import { bind } from 'bind-event-listener';

import {
	type AdapterAPI,
	type CleanupFn,
	type DropTargetArgs,
	type MonitorArgs,
	type TextSelectionDragPayload,
	type TextSelectionDragType,
} from '../internal-types';
import { makeAdapter } from '../make-adapter/make-adapter';
import { combine } from '../public-utils/combine';
import { HTMLMediaType } from '../util/media-types/html-media-type';
import { textMediaType } from '../util/media-types/text-media-type';

import { elementAdapterNativeDataKey } from './element-adapter-native-data-key';
import { findTextNode } from './find-text-node';
import { honeyPotFix } from './honey-pot-fix';

const adapter: {
	registerUsage: () => CleanupFn;
	dropTarget: (args: DropTargetArgs<TextSelectionDragType>) => CleanupFn;
	monitor: (args: MonitorArgs<TextSelectionDragType>) => CleanupFn;
} = makeAdapter<TextSelectionDragType>({
	typeKey: 'text-selection',
	// for text selection, we will usually be making a copy of the text
	defaultDropEffect: 'copy',
	mount(api: AdapterAPI<TextSelectionDragType>): CleanupFn {
		// Binding to the `window` so that the element adapter has a
		// chance to get in first on the `document`.
		// We are giving preference to the element adapter.
		return combine(
			honeyPotFix.bindEvents(),
			bind(window, {
				type: 'dragstart',
				listener(event: DragEvent) {
					// If the "dragstart" event is cancelled, then a drag won't start
					// There will be no further drag operation events (eg no "dragend" event)
					if (event.defaultPrevented) {
						return;
					}

					// Something has gone wrong with our drag event
					if (!event.dataTransfer) {
						// Including this code on "test" and "development" environments:
						// - Browser tests commonly run against "development" builds
						// - Unit tests commonly run in "test"
						if (process.env.NODE_ENV !== 'production') {
							// eslint-disable-next-line no-console
							console.warn(
								`
                It appears as though you have are not testing DragEvents correctly.

                - If you are unit testing, ensure you have polyfilled DragEvent.
                - If you are browser testing, ensure you are dispatching drag events correctly.

                Please see our testing guides for more information:
                https://atlassian.design/components/pragmatic-drag-and-drop/core-package/testing
              `.replace(/ {2}/g, ''),
							);
						}
						return;
					}

					// Drag is being handled by the element adapter
					if (event.dataTransfer.types.includes(elementAdapterNativeDataKey)) {
						return;
					}

					// Something else is handling this drag
					if (!api.canStart(event)) {
						return;
					}

					// no text being dragged
					if (!event.dataTransfer.types.includes(textMediaType)) {
						return;
					}

					const target: Text | null = findTextNode(event);

					// could not find `Text` node that is being dragged from
					if (!target) {
						return;
					}

					const payload: TextSelectionDragPayload = {
						// The `Text` node that is the `target` is the `Text` node
						// that the user started the drag from.
						// The full text being dragged can be looked up from the `dataTransfer`.
						target,
						plain: event.dataTransfer.getData(textMediaType),
						HTML: event.dataTransfer.getData(HTMLMediaType),
					};

					api.start({
						event,
						dragType: {
							type: 'text-selection',
							startedFrom: 'internal',
							payload,
						},
					});
				},
			}),
		);
	},
	onPostDispatch: honeyPotFix.getOnPostDispatch(),
});

(function register() {
	// server side rendering check
	if (typeof window === 'undefined') {
		return;
	}
	adapter.registerUsage();
})();

export { adapter };
