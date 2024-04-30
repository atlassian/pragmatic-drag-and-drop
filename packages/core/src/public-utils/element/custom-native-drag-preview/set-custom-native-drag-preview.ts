import {
  ElementEventPayloadMap,
  monitorForElements,
} from '../../../adapter/element-adapter';
import type { Position } from '../../../internal-types';
import { isSafari } from '../../../util/is-safari';

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
}) {
  const container = document.createElement('div');

  Object.assign(container.style, {
    // Ensuring we don't cause reflow when adding the element to the page
    // Using `position:fixed` rather than `position:absolute` so we are
    // positioned on the current viewport.
    // `position:fixed` also creates a new stacking context, so we don't need to do that here
    position: 'fixed',

    // According to `mdn`, the element can be offscreen:
    // https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/setDragImage#imgelement
    //
    // However, that  information does not appear in the specs:
    // https://html.spec.whatwg.org/multipage/dnd.html#dom-datatransfer-setdragimage-dev
    //
    // If the element is _completely_ offscreen, Safari@17.1 will cancel the drag
    top: 0,
    left: 0,
    // Using maximum possible z-index so that this element will always be on top
    // https://stackoverflow.com/questions/491052/minimum-and-maximum-value-of-z-index
    // Did not use `layers` in `@atlaskit/theme` because:
    // 1. This element is not a 'layer' in the conventional sense, as this element
    //    is only created for a single frame for the browser to take a photo of it,
    //    and then it is destroyed
    // 2. Did not want to add a dependency onto `@atlaskit/theme`
    // 3. Want to always be on top of product UI which might have higher z-index's
    zIndex: 2147483647,
    // Avoiding any additional events caused by the new element (being super safe)
    pointerEvents: 'none',
  });
  document.body.append(container);
  const unmount = render({ container });

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
  if (isSafari()) {
    /**
     *  For some frameworks (eg `react@18+` with `ReactDOM.createRoot().render()`) the rendering
     *  inside the `container` does not occur until after a microtask.
     *
     *  Notes:
     *    - This will run before the browser takes it's picture of the element
     *    - This will run before the animation frame that removes `container`.
     **/
    queueMicrotask(() => {
      const rect = container.getBoundingClientRect();

      // We cannot apply this fix if nothing has been rendered into the `container`
      if (rect.width === 0) {
        return;
      }

      container.style.left = `-${rect.width - 0.0001}px`;
    });
  }

  nativeSetDragImage?.(container, previewOffset.x, previewOffset.y);

  function cleanup() {
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
