# @atlaskit/pragmatic-drag-and-drop

## 1.5.0

### Minor Changes

- [#109060](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/109060)
  [`4660ec858a305`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/4660ec858a305) -
  Update `React` from v16 to v18

## 1.4.0

### Minor Changes

- [#145232](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/145232)
  [`04641b5e6ed55`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/04641b5e6ed55) -
  Adding new optional utility for element dragging: `blockDraggingToIFrames` which disables the
  ability for a user to drag into an `<iframe>` element.

  Scenarios where this can be helpful:

  - When you are shifting the interface around in reponse to a drag operation and you don't want the
    drag to enter into an `<iframe>` (for example - when resizing)
  - When you don't want the user to be able to drag into a `<iframe>` on the page (there could be
    lots of reasons why!)

  ```ts
  import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
  import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
  import { blockDraggingToIFrames } from '@atlaskit/pragmatic-drag-and-drop/element/block-dragging-to-iframes';

  const cleanup = combine(
  	blockDraggingToIFrames({ element }),
  	draggable({
  		element,
  	}),
  );
  ```

## 1.3.1

### Patch Changes

- [#141279](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/141279)
  [`a38f3af4bfc79`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/a38f3af4bfc79) -
  Minor refactor of internal helper.

## 1.3.0

### Minor Changes

- [#128458](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/128458)
  [`71c5224450c8a`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/71c5224450c8a) -
  Adding workaround for a [bug in Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1912164).
  The external adpater optional URL utilities `containsURLs` and `getURLs` will now correctly
  recognize URLs dragged from the Firefox address bar or bookmarks in to a Firefox `window`.

## 1.2.3

### Patch Changes

- [#123738](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/123738)
  [`abd0776a2a2d5`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/abd0776a2a2d5) -
  Improving `react@18` support for `setCustomNativeDragPreview`. Fixes a bug where
  `preserveOffsetOnSource` would always position the top left drag preview under the user's pointer.

  `getOffset` is now called in the next
  [`microtask`](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide) after
  `setCustomNativeDragPreview:render`. This helps ensure that the drag preview element has finished
  rendering into the `container` before `getOffset` is called. Some frameworks like `react@18` won't
  render the element to be used for the drag preview into the `container` until the next
  `microtask`.

## 1.2.2

### Patch Changes

- [#124164](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/124164)
  [`58941fa1d332a`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/58941fa1d332a) -
  All `react` unit tests will now run against `react@16` and `react@18` on CI.

## 1.2.1

### Patch Changes

- [#117296](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/117296)
  [`ef11f570968a2`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/ef11f570968a2) -
  Adding some browser tests for the honey pot fix

## 1.2.0

### Minor Changes

- [#116572](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/116572)
  [`98c65e7ff719c`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/98c65e7ff719c) -
  🍯 Introducing "the honey pot fix" which is an improved workaround for a
  [painful browser bug](https://issues.chromium.org/issues/41129937).

  **Background**

  The browser bug causes the browser to think the users pointer is continually depressed at the
  point that the user started a drag. This could lead to incorrect events being triggered, and
  incorrect styles being applied to elements that the user is not currently over during a drag.

  **Outcomes**

  - Elements will no longer receive `MouseEvent`s (eg `"mouseenter"` and `"mouseleave"`) during a
    drag (which is a violation of the
    [drag and drop specification](https://html.spec.whatwg.org/multipage/dnd.html#drag-and-drop-processing-model))
  - Elements will no longer apply `:hover` or `:active` styles during a drag. Previously consumers
    would need to disable these style rules during a drag to prevent these styles being applied.
  - Dramatically improved post drop performance. Our prior solution could require a noticeable delay
    due to a large style recalculation after a drop.

## 1.1.12

### Patch Changes

- [#109670](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/109670)
  [`8eb3fe4136d55`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/8eb3fe4136d55) -
  Internal consolidation of `once()` code

## 1.1.11

### Patch Changes

- [#107751](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/107751)
  [`ac9352b7e0ce`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/ac9352b7e0ce) -
  Fixing timing issue with `preventUnhandled()` introduced in the prior release.
  `preventUnhandled.stop()` called inside of `onDrop()` will now correctly cancel a native `"drop"`
  event.

## 1.1.10

### Patch Changes

- [#105574](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/105574)
  [`2f5d213b2613`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/2f5d213b2613) -
  These fixes only impact situations were you have native drag and drop code in addition to
  Pragmatic drag and drop running on your page.

  - Fix: if a `"drop"` is caused by non Pragmatic drag and drop code on the page, then we will no
    longer cancel the `"drop"` event.
  - Fix: No longer exposing external adapter data (`source.items`) in `onDrop` if not dropping on a
    Pragmatic drag and drop drop target. Previously, if some non Pragmatic drag and drop code
    accepted a drop then `source.items` would be populated. Now all unsuccessful (or un managed)
    drops are handled consistently.

## 1.1.9

### Patch Changes

- [#100243](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/100243)
  [`1ba7a4e942d4`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/1ba7a4e942d4) -
  Fixing typos in dev time warnings

## 1.1.8

### Patch Changes

- [#100196](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/100196)
  [`da322bbbe7f5`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/da322bbbe7f5) -
  Setting `sideEffects: true` in `package.json` as a few essential files in `core` have side
  effects. Unfortunately we require side effects to work around browser bugs and strangeness 😅.

## 1.1.7

### Patch Changes

- [#95385](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/95385)
  [`c8d2e32f5071`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/c8d2e32f5071) -
  Minor internal refactor of code concerning entering / leaving a window

## 1.1.6

### Patch Changes

- [#94759](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/94759)
  [`140fc0d20c02`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/140fc0d20c02) -
  Fixing our Safari workaround in `setCustomNativeDragPreview()` for a
  [Safari drag preview bug](https://bugs.webkit.org/show_bug.cgi?id=266025) so that it works
  correctly for `react@18+` usage.

## 1.1.5

### Patch Changes

- [#94316](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/94316)
  [`35fd5ed8e1d7`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/35fd5ed8e1d7) -
  Upgrading internal dependency `bind-event-listener` to `@^3.0.0`

## 1.1.4

### Patch Changes

- [#94302](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/94302)
  [`66ca9d1d1602`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/66ca9d1d1602) -
  Improving jsdoc for the drop target `canDrop` function

## 1.1.3

### Patch Changes

- [#84398](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/84398)
  [`77694db987fc`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/77694db987fc) -
  Public release of Pragmatic drag and drop documentation

## 1.1.2

### Patch Changes

- [#84047](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/84047)
  [`72a86ac4a940`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/72a86ac4a940) -
  Removing experimental `DropData` from `onDrop()`. Exposing the native `dropEffect` turned out to
  problematic, as you will always get a `"none"` drop effect if dropping externally if the original
  `draggable` was removed (a native `"dragend"` event is targetted at the original draggable). This
  made the weak signal of `dropEffect` for even weaker and more problematic. In order to not create
  footguns for folks, we have decided to remove this experimental API for now. We can explore adding
  the API back in the future if folks think it would be valuable.

## 1.1.1

### Patch Changes

- [#83702](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/83702)
  [`4d9e25ab4eaa`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/4d9e25ab4eaa) -
  Updating the descriptions of Pragmatic drag and drop packages, so they each provide a consistent
  description to various consumers, and so they are consistently formed amongst each other.

  - `package.json` `description`
  - `README.md`
  - Website documentation

## 1.1.0

### Minor Changes

- [#82653](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/82653)
  [`136d8da5542d`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/136d8da5542d) -
  _Experimental_: Adding additional information to `onDrop()` events to expose what the final
  `dropEffect` was for a drag operation (_now removed_)

  Fixing a bug where `preventUnhandled.start()` would prevent unhandled drag operations forever. It
  now only prevents unhandled drag operations for the current drag operation.
  `preventUnhandled.stop()` is now optional, as `preventUnhandled.start()` now tidies up itself. You
  can still leverage `preventUnhandled.stop()` to stop preventing unhandled drag operations during a
  drag.

  Tightening the `getDropEffect()` function on drop targets slightly so that `"none"` cannot be
  provided. Using `"none"` as the drop effect would break the expected behaviour for nested drop
  targets.

## 1.0.2

### Patch Changes

- [#83116](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/83116)
  [`8d4e99057fe0`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/8d4e99057fe0) -
  Upgrade Typescript from `4.9.5` to `5.4.2`

## 1.0.1

### Patch Changes

- [#76476](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/76476)
  [`35148e092790`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/35148e092790) -
  Adding warning for test environments to let people know if DragEvents have not been setup
  correctly.

## 1.0.0

### Major Changes

- [#70616](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/70616)
  [`42e57ea65fee`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/42e57ea65fee) -
  This is our first `major` release (`1.0`) for all Pragmatic drag and drop packages.

  For a detailed explanation of these changes, and how to upgrade (automatically) to `1.0` please
  see our
  [1.0 upgrade guide](http://atlassian.design/components/pragmatic-drag-and-drop/core-package/upgrade-guides/upgrade-guide-for-1.0)

## 0.25.0

### Minor Changes

- [#59458](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/59458)
  [`7d6a69cfa61c`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/7d6a69cfa61c) -
  Adding workaround for Safari bug.

  In Safari (and iOS) if the element used for generating a native drag preview has opacity applied,
  then the native drag preview can include elements underneath the drag preview element.

  Pragmatic drag and drop now includes a workaround for this Safari bug.

## 0.24.0

### Minor Changes

- [#39935](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/39935)
  [`03b91562fec`](https://bitbucket.org/atlassian/atlassian-frontend/commits/03b91562fec) - Exposing
  `AllDragTypes` type. This was previously an internal type, but it provided helpful to expose for
  our new auto scroller. `AllDragTypes` is helpful if you need a function to work with either
  `element` or `file` drag operations.

## 0.23.0

### Minor Changes

- [#38713](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/38713)
  [`3da89e29dfc`](https://bitbucket.org/atlassian/atlassian-frontend/commits/3da89e29dfc) - We have
  renamed and tweaked the recently added `setCustomNativeDragPreview` `getOffset` utility
  `preserveOffsetFromPointer` to be a bit easier to understand what it is doing.

  ```diff
  - import { preserveOffsetFromPointer } from '@atlaskit/pragmatic-drag-and-drop/util/preserve-offset-from-pointer';
  + import { preserveOffsetOnSource } from '@atlaskit/pragmatic-drag-and-drop/util/preserve-offset-on-source';

  draggable({
    element: myElement,
    onGenerateDragPreview: ({ nativeSetDragImage, location, source }) => {
      setCustomNativeDragPreview({
  -      getOffset: preserveOffsetFromPointer({
  +      'preserveOffsetOnSource' is a more accurate description of what is being achieved
  +      getOffset: preserveOffsetOnSource({
  -        sourceElement: source.element,
  +        // no longer including 'source' in argument name
  +        // as it is implied by the function name
  +        element: source.element,
          input: location.current.input,
        }),
        render: function render({ container }) {
          /* ... */
        },
        nativeSetDragImage,
      });
    },
  });
  ```

## 0.22.0

### Minor Changes

- [#38397](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/38397)
  [`d644a68ddf6`](https://bitbucket.org/atlassian/atlassian-frontend/commits/d644a68ddf6) - Added a
  new `setCustomNativeDragPreview` `getOffset` utility: `preserveOffsetFromPointer`.
  `preserveOffsetFromPointer` mimics the default behaviour for non custom drag previews when
  starting a drag: the initial cursor position offset is preserved for a seamless drag and drop
  experience.

  ```ts
  import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/util/set-custom-native-drag-preview';
  import { preserveOffsetFromPointer } from '@atlaskit/pragmatic-drag-and-drop/util/preserve-offset-from-pointer';

  draggable({
  	element: myElement,
  	onGenerateDragPreview: ({ nativeSetDragImage, location, source }) => {
  		setCustomNativeDragPreview({
  			getOffset: preserveOffsetFromPointer({
  				sourceElement: source.element,
  				input: location.current.input,
  			}),
  			render: function render({ container }) {
  				/* ... */
  			},
  			nativeSetDragImage,
  		});
  	},
  });
  ```

## 0.21.0

### Minor Changes

- [#38525](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/38525)
  [`de7463c7096`](https://bitbucket.org/atlassian/atlassian-frontend/commits/de7463c7096) - Exposing
  some additional TypeScript types. These can be helpful when creating helper packages.

  ```ts
  import type {
  	// These types are not needed for consumers
  	// They are mostly helpful for other packages
  	AllDragTypes,
  	MonitorArgs,
  	BaseEventPayload,
  } from '@atlaskit/pragmatic-drag-and-drop/types';
  ```

  - `AllDragTypes`: representation of all entities types in the system (eg element and file)
  - `MonitorArgs<DragType extends AllDragTypes>`: the arguments that can be passed to a monitor
  - `BaseEventPayload<DragType extends AllDragTypes>`: the shared properties in all events

## 0.20.0

### Minor Changes

- [#38453](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/38453)
  [`554a6d8cc34`](https://bitbucket.org/atlassian/atlassian-frontend/commits/554a6d8cc34) - ###
  Stickiness algorithm improvement

  We have made some improvements to the drop target stickiness algorithm to allow sticky drop
  targets that are no longer dragged over to cancel their stickiness.

  Stickiness is no longer maintained when a sticky drop target states it cannot be dropped on

  > Scenario: `[A(sticky)]` → `[]` + `A:canDrop()` returns `false` Result: `[]`

  Stickiness is no longer maintained when a sticky drop start states it is no longer sticky

  > Scenario: `[A(sticky)]` → `[]` + `A:getIsSticky()` returns `false` Result: `[]`

  Stickiness is no longer maintained when a sticky drop start is unmounted

  > Scenario: `[A(sticky)]` → `[]` + `A` is unmounted Result: `[]`

  To help facilitate this change:

  - `getIsSticky()` is now only called when an _drop target_ is a potential candidate for stickiness
    (previously it was called repeatedly)
  - `getIsSticky()` and `canDrop()` are called on _drop targets_ that are no longer being dragged
    over, but are candidates for stickiness

  ### Change to `DropTargetRecord` `type`

  Previously, the `DropTargetRecord` type had a property called `sticky` which would represent
  whether the _drop target_ was registering itself as sticky via `getIsSticky()`. Knowing `sticky`
  is not overly helpful given that we now regularly recompute stickiness and a _drop target_ can
  change disable stickiness after it is applied.

  What is helpful, is knowing whether a _drop target_ is active _because_ of stickiness. So we have
  removed `sticky` and added `isActiveDueToStickiness` to the `DropTargetRecord` type.

  ```diff
  type DropTargetRecord = {
    element: Element;
    data: Record<string | symbol, unknown>;
    dropEffect: DataTransfer['dropEffect'];
  -  sticky: boolean;
  +  isActiveDueToStickiness: boolean;
  };
  ```

## 0.19.0

### Minor Changes

- [#35574](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/35574)
  [`8c301a251e4`](https://bitbucket.org/atlassian/atlassian-frontend/commits/8c301a251e4) - We have
  changed the API of `setCustomNativeDragPreview()` to allow increased control and slightly lower
  bundles as well.

  We have removed the `placement` argument, and replaced it with `getOffset()`.

  ```diff
  - placement: { type: 'center' } | { type: 'offset-from-pointer'; x: CSSValue; y: CSSValue };
  + getOffset: (args: { container: HTMLElement }) => {x: number, y: number}
  ```

  `getOffset()` allows unlimited control over how to place the custom native drag preview relative
  to the users pointer. Please see our updated documentation for detailed information about the new
  `getOffset()` API. Our new `getOffset()` approach means that we also no longer need to bake in all
  `placement` options into the bundle - consumers now only pay for what they use!

  `placement: { type: 'offset-from-pointer' }` has been replaced by `offsetFromPointer()`

  ```diff
  import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/util/set-custom-native-drag-preview';
  + import { offsetFromPointer } from '@atlaskit/pragmatic-drag-and-drop/util/offset-from-pointer;

  draggable({
    element: myElement,
    onGenerateDragPreview: ({ nativeSetDragImage }) => {
      setCustomNativeDragPreview({
  -      placement: { type: 'offset-from-pointer', x: '16px', y: '8px' }
  +      getOffset: offsetFromPointer({x: '16px', y: '8px'}),
        render: function render({ container }) {
          ReactDOM.render(<Preview item={item} />, container);
          return function cleanup() {
            ReactDOM.unmountComponentAtNode(container);
          };
        },
        nativeSetDragImage,
      });
    },
  });
  ```

  `placement: { type: 'center' }` has been replaced by `centerUnderPointer()`

  ```diff
  import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/util/set-custom-native-drag-preview';
  + import { centerUnderPointer } from '@atlaskit/pragmatic-drag-and-drop/util/center-under-pointer-pointer;

  draggable({
    element: myElement,
    onGenerateDragPreview: ({ nativeSetDragImage }) => {
      setCustomNativeDragPreview({
  -      placement: { type: 'center' }
  +      getOffset: centerUnderPointer,
        render: function render({ container }) {
          ReactDOM.render(<Preview item={item} />, container);
          return function cleanup() {
            ReactDOM.unmountComponentAtNode(container);
          };
        },
        nativeSetDragImage,
      });
    },
  });
  ```

## 0.18.2

### Patch Changes

- [#33793](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/33793)
  [`9d00501a414`](https://bitbucket.org/atlassian/atlassian-frontend/commits/9d00501a414) - Ensure
  legacy types are published for TS 4.5-4.8

## 0.18.1

### Patch Changes

- [#33649](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/33649)
  [`41fae2c6f68`](https://bitbucket.org/atlassian/atlassian-frontend/commits/41fae2c6f68) - Upgrade
  Typescript from `4.5.5` to `4.9.5`

## 0.18.0

### Minor Changes

- [#33344](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/33344)
  [`9fd8556db17`](https://bitbucket.org/atlassian/atlassian-frontend/commits/9fd8556db17) - Internal
  folder name structure change

## 0.17.0

### Minor Changes

- [#33262](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/33262)
  [`34ed7b2ec63`](https://bitbucket.org/atlassian/atlassian-frontend/commits/34ed7b2ec63) - We have
  changed the name of our drag and drop packages to align on the single name of "Pragmatic drag and
  drop"

  ```diff
  - @atlaskit/drag-and-drop
  + @atlaskit/pragmatic-drag-and-drop

  - @atlaskit/drag-and-drop-autoscroll
  + @atlaskit/pragmatic-drag-and-drop-autoscroll

  - @atlaskit/drag-and-drop-hitbox
  + @atlaskit/pragmatic-drag-and-drop-hitbox

  - @atlaskit/drag-and-drop-indicator
  + @atlaskit/pragmatic-drag-and-drop-react-indicator
  # Note: `react` was added to this package name as our indicator package is designed for usage with `react`.

  - @atlaskit/drag-and-drop-live-region
  + @atlaskit/pragmatic-drag-and-drop-live-region

  - @atlaskit/drag-and-drop-react-beautiful-dnd-migration
  + @atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration

  - @atlaskit/drag-and-drop-docs
  + @atlaskit/pragmatic-drag-and-drop-docs
  ```

  The new `@atlaskit/pragmatic-drag-and-drop*` packages will start their initial versions from where
  the ``@atlaskit/drag-and-drop*` packages left off. Doing this will make it easier to look back on
  changelogs and see how the packages have progressed.

## 0.16.0

### Minor Changes

- [#33258](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/33258)
  [`56507598609`](https://bitbucket.org/atlassian/atlassian-frontend/commits/56507598609) - Skip
  minor dependency bump

## 0.15.1

### Patch Changes

- [#32424](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/32424)
  [`2e01c9c74b5`](https://bitbucket.org/atlassian/atlassian-frontend/commits/2e01c9c74b5) - DUMMY
  remove before merging to master; dupe adf-schema via adf-utils

## 0.15.0

### Minor Changes

- [#31909](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/31909)
  [`ed028658f13`](https://bitbucket.org/atlassian/atlassian-frontend/commits/ed028658f13) - Minor
  internal refactor and adding additional tests

## 0.14.0

### Minor Changes

- [#31794](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/31794)
  [`eab6d26451d`](https://bitbucket.org/atlassian/atlassian-frontend/commits/eab6d26451d) -
  Improving the resilience of our workaround for a
  [Browser bug](https://bugs.chromium.org/p/chromium/issues/detail?id=410328) where after a drag
  finishes, an unrelated element can be entered into.
- [`ba7ea570aee`](https://bitbucket.org/atlassian/atlassian-frontend/commits/ba7ea570aee) - > Both
  of these changes should not impact most consumers as they are targeted at edge cases.

  - **Fix**: We no longer extract user input (eg `clientX`) from native `"dragleave"` events due to
    a
    [Bug with Chrome we discovered](https://bugs.chromium.org/p/chromium/issues/detail?id=1429937).
    Due to this bug, it was possible for `location.current.input` to be incorrectly set in
    `onDropTargetChange` and `onDrop` when a user was cancelling a drag or dropping or no drop
    targets.

  - **Fix**: `location.previous.dropTargets` _should_ always point to the
    `location.current.dropTargets` value from the previous event (exception: `onGenerateDragPreview`
    and `onDragStart` have the same `location.previous` and `location.current` values). Previously,
    the `location.previous.dropTargets` value did not match the last events
    `location.current.dropTargets` value in `onDrop`. `onDrop()` would incorrectly use the
    `location.current` and `location.previous` values from the last event rather than creating a new
    `location.current` entry. Now, `onDrop()`, `location.previous.dropTargets` points to the
    `location.current.dropTargets` from the last event (same as all other events) and
    `location.current.dropTargets` points to what the previous drop target was as well (no change)

## 0.13.0

### Minor Changes

- [#30879](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/30879)
  [`2582df26509`](https://bitbucket.org/atlassian/atlassian-frontend/commits/2582df26509) - Fixing a
  browser bug where after a drag finishes, a unrelated element can be entered into by the browser

  - [Visual explanation of bug](https://twitter.com/alexandereardon/status/1633614212873465856)
  - [Chrome bug](https://bugs.chromium.org/p/chromium/issues/detail?id=410328)

## 0.12.0

### Minor Changes

- [#30953](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/30953)
  [`90901f5bbe0`](https://bitbucket.org/atlassian/atlassian-frontend/commits/90901f5bbe0) - Replace
  default entry point of `undefined` with `{}`.

  > **NOTE:** Importing from the default entry point isn't supported. _Please use individual entry
  > points in order to always obtain minimum kbs._

## 0.11.0

### Minor Changes

- [#30668](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/30668)
  [`1ecbb19d450`](https://bitbucket.org/atlassian/atlassian-frontend/commits/1ecbb19d450) - Adding a
  new function to make creating _custom_ native drag previews safe and easy:
  `setCustomNativeDragPreview`

  ```tsx
  import { setCustomNativeDragPreview } from '@atlaskit/drag-and-drop/util/set-custom-native-drag-preview';

  draggable({
  	element: myElement,
  	onGenerateDragPreview: ({ nativeSetDragImage }) => {
  		setCustomNativeDragPreview({
  			render: function render({ container }) {
  				ReactDOM.render(<Preview item={item} />, container);
  				return function cleanup() {
  					ReactDOM.unmountComponentAtNode(container);
  				};
  			},
  			nativeSetDragImage,
  		});
  	},
  });
  ```

  Please see our element adapter documentation for more detailed usage information

## 0.10.0

### Minor Changes

- [#29951](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/29951)
  [`9c0975e2fab`](https://bitbucket.org/atlassian/atlassian-frontend/commits/9c0975e2fab) - Bug fix:
  A _monitor_ should not be called after it is removed. Previously, if a _monitor_ (monitor 1)
  removed another _monitor_ (monitor 2) for the same event, then the second monitor (monitor 2)
  would still be called. This has been fixed

  ```ts
  const cleanupMonitor1 = monitorForElements({
  	onDragStart: () => {
  		cleanupMonitor2();
  	},
  });
  const cleanupMonitor2 = monitorForElements({
  	// Previously this `onDragStart` would have been called during `onDragStart` even though it was unbound by the first monitor
  	onDragStart: () => {},
  });
  ```

## 0.9.0

### Minor Changes

- [#29651](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/29651)
  [`03e0aa5ae85`](https://bitbucket.org/atlassian/atlassian-frontend/commits/03e0aa5ae85) -
  `@atlaskit/drag-and-drop` adds event listeners to the `window` during a drag operation. These drag
  operation event listeners were [`bubble` phase event listeners](https://domevents.dev/), but they
  are now `capture` phase event listeners to be more resliant against external code (incorrectly)
  stopping events.

  This does not impact the ability of a consumer to have their own `draggable`s on a page not
  controlled by `@atlaskit/drag-and-drop`

## 0.8.1

### Patch Changes

- [#28324](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/28324)
  [`6455cf006b3`](https://bitbucket.org/atlassian/atlassian-frontend/commits/6455cf006b3) - Builds
  for this package now pass through a tokens babel plugin, removing runtime invocations of the
  tokens() function and improving performance.

## 0.8.0

### Minor Changes

- [#26317](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/26317)
  [`1e3f9743e57`](https://bitbucket.org/atlassian/atlassian-frontend/commits/1e3f9743e57) - A
  _monitor_ that is added during an event (eg `onDragStart`) will no longer be called for the
  current event. This is to prevent the accidental creation of infinite loops. This behaviour
  matches native [`EventTargets`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)
  where an event listener cannot add another event listener during an active event to the same event
  target in the same event phase.

## 0.7.1

### Patch Changes

- [#24874](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/24874)
  [`8cc2f888c83`](https://bitbucket.org/atlassian/atlassian-frontend/commits/8cc2f888c83) - Upgrade
  Typescript from `4.3.5` to `4.5.5`

## 0.7.0

### Minor Changes

- [#25428](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/25428)
  [`f2a7931d609`](https://bitbucket.org/atlassian/atlassian-frontend/commits/f2a7931d609) - Adding
  jsdoc to DragLocation type for better autocomplete

## 0.6.0

### Minor Changes

- [#25002](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/25002)
  [`0f755214ee7`](https://bitbucket.org/atlassian/atlassian-frontend/commits/0f755214ee7) - Internal
  folder renaming. No API impact

## 0.5.0

### Minor Changes

- [#25007](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/25007)
  [`17950433a70`](https://bitbucket.org/atlassian/atlassian-frontend/commits/17950433a70) - Touching
  package to release re-release previous version. The previous (now deprecated) version did not have
  it's entry points built correctly

## 0.4.0

### Minor Changes

- [#24861](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/24861)
  [`4d739042b04`](https://bitbucket.org/atlassian/atlassian-frontend/commits/4d739042b04) -
  Improving jsdoc auto complete information for `GetFeedbackArgs`

## 0.3.0

### Minor Changes

- [#24810](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/24810)
  [`52403a2c11f`](https://bitbucket.org/atlassian/atlassian-frontend/commits/52403a2c11f) - Adding a
  `canMonitor()` function to _monitors_ to allow a _monitor_ to conditionally apply to a drag
  operation.

  ```ts
  monitorForElements({
  	canMonitor: ({ source }) => source.data.type === 'card',
  	onDragStart: () => console.log('I will only be activated when dragging a card!'),
  });
  ```

## 0.2.0

### Minor Changes

- [#24613](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/24613)
  [`1cf9e484b4b`](https://bitbucket.org/atlassian/atlassian-frontend/commits/1cf9e484b4b) - We have
  improved our naming consistency across our drag and drop packages.

  - `@atlaskit/drag-and-drop/util/cancel-unhandled` has been renamed to
    `@atlaskit/drag-and-drop/addon/cancel-unhandled`

## 0.1.0

### Minor Changes

- [#24532](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/24532)
  [`73427c38077`](https://bitbucket.org/atlassian/atlassian-frontend/commits/73427c38077) - Initial
  release of `@atlaskit/drag-and-drop` packages 🎉

## 0.0.1

### Patch Changes

- [#24492](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/24492)
  [`8d4228767b0`](https://bitbucket.org/atlassian/atlassian-frontend/commits/8d4228767b0) - Upgrade
  Typescript from `4.2.4` to `4.3.5`.
