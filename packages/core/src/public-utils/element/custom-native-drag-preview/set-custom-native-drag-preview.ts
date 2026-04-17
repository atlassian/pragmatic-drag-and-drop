import { type ElementEventPayloadMap, monitorForElements } from '../../../adapter/element-adapter';
import type { Position } from '../../../internal-types';
import { isSafari } from '../../../util/is-safari';
import { maxZIndex } from '../../../util/max-z-index';
import { popoverResetUserAgentStyles } from '../../../util/popover-reset-styles';
import { supportsPopover } from '../../../util/supports-popover';

import type { GetOffsetFn } from './types';

/** A function to remove the element that has been added to the `container`.
 * @example () => ReactDOM.unmountComponentAtNode(container)
 */
type CleanupFn = () => void;

/** A function that will render a preview element into a `container` `HTMLElement` */
type RenderFn = ({
	container,
}: {
	/** The `HTMLElement` that you need to render your preview element into.
  `container` will be appended to the `document.body` and will be removed
  after your `CleanupFn` is called
  */
	container: HTMLElement;
}) => CleanupFn | void;

/** By default we use the build in values for the native drag preview: {x: 0, y: 0} */
function defaultOffset(): Position {
	return { x: 0, y: 0 };
}

/** This function provides the ability to mount an element for it to be used as the native drag preview
 *
 * @example
 * draggable({
 *  onGenerateDragPreview: ({ nativeSetDragImage }) => {
 *    setCustomNativeDragPreview({
 *      render: ({ container }) => {
 *        ReactDOM.render(<Preview item={item} />, container);
 *        return () => ReactDOM.unmountComponentAtNode(container);
 *      },
 *      nativeSetDragImage,
 *    });
 *    },
 * });
 */
export function setCustomNativeDragPreview({
	render,
	nativeSetDragImage,
	getOffset = defaultOffset,
}: {
	getOffset?: GetOffsetFn;
	render: RenderFn;
	nativeSetDragImage: ElementEventPayloadMap['onGenerateDragPreview']['nativeSetDragImage'];
}): void {
	const container = document.createElement('div');

	// Using popover="manual" to place the element in the browser's top layer.
	// This ensures the drag preview container is visually on top of everything else,
	// including elements using z-index and other stacking contexts.
	// "manual" means no light dismiss — we manage the lifecycle ourselves.
	// This element is only created for a single frame for the browser to take a
	// photo of it, and then it is destroyed.
	// Falls back to position:fixed + maxZIndex when the popover API is not available.
	// Note: the popover attribute must be set before the element is in the DOM.
	// `.showPopover()` is called further below after the element is appended to the body.
	if (supportsPopover()) {
		container.setAttribute('popover', 'manual');
	}

	Object.assign(container.style, {
		// Ensuring we don't cause reflow when adding the element to the page
		// Using `position:fixed` rather than `position:absolute` so we are
		// positioned on the current viewport.
		// `position:fixed` also creates a new stacking context, so we don't need to do that here
		position: 'fixed',

		...(supportsPopover()
			? // needs to come first as it has 'inset: unset' which
				// needs to be overridden by our top / left values
				popoverResetUserAgentStyles
			: {
					// Fallback: using maximum possible z-index so that this element
					// will always be on top of other positioned content.
					zIndex: maxZIndex,
				}),

		// According to `mdn`, the element can be offscreen:
		// https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/setDragImage#imgelement
		//
		// However, that  information does not appear in the specs:
		// https://html.spec.whatwg.org/multipage/dnd.html#dom-datatransfer-setdragimage-dev
		//
		// If the element is _completely_ offscreen, Safari@17.1 will cancel the drag
		top: 0,
		left: 0,

		// Avoiding any additional events caused by the new element (being super safe)
		pointerEvents: 'none',
	});

	document.body.append(container);

	// `.showPopover()` must be called after the element is in the DOM.
	if (supportsPopover()) {
		container.showPopover();
	}

	const unmount = render({ container });

	/**
	 * Some frameworks (eg `react`) don't render into the container until the next microtask.
	 * - This will run before the browser takes it's picture of the element
	 * - This will run before the animation frame that removes `container`.
	 * */

	queueMicrotask(() => {
		const previewOffset: Position = getOffset({ container });

		/**
		 * **Problem**
		 * On `Safari@17.1` if a drag preview element has some opacity,
		 * Safari will include elements behind the drag preview element
		 * in the drag preview.
		 * Bug: https://bugs.webkit.org/show_bug.cgi?id=266025
		 *
		 * **Fix**
		 * We push the drag preview so it is _almost_ completely offscreen so that
		 * there won't be any elements behind the drag preview element.
		 * If the element is _completely_ offscreen, then the drag is cancelled by Safari.
		 *
		 * Using `-0.0001` so that any potential "see through" on the drag preview element
		 * is effectively invisible 👻
		 *
		 * **Unsuccessful alternatives**
		 * Setting a background color (eg "white") on the `container`
		 * → Wrecks the opacity of the drag preview element
		 *
		 * Adding a parent element of the `container` with a background color (eg "white")
		 * → Wrecks the opacity of the drag preview element
		 */
		/**
		 * Update: this bug fix is no longer needed in `Safari@26.4` (and maybe earlier)
		 * We can remove it in a future release
		 */
		if (isSafari()) {
			const rect = container.getBoundingClientRect();

			// We cannot apply this fix if nothing has been rendered into the `container`
			if (rect.width === 0) {
				return;
			}

			container.style.left = `-${rect.width - 0.0001}px`;
		}

		nativeSetDragImage?.(container, previewOffset.x, previewOffset.y);
	});

	function cleanup() {
		// No need to call `.hidePopover()`.
		// Removing the element from the DOM dismisses the popover
		unbindMonitor();
		unmount?.();
		document.body.removeChild(container);
	}

	const unbindMonitor = monitorForElements({
		// Remove portal in the dragstart event so that the user will never see it
		onDragStart: cleanup,
		// Backup: remove portal when the drop finishes (this would be an error case)
		onDrop: cleanup,
	});
}
