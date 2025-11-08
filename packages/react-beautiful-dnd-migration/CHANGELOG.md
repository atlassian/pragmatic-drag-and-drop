# @atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration

## 2.0.9

### Patch Changes

- Updated dependencies

## 2.0.8

### Patch Changes

- [`4891ea5a24e1b`](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/commits/4891ea5a24e1b) -
  Typescript changes.

## 2.0.7

### Patch Changes

- Updated dependencies

## 2.0.6

### Patch Changes

- [`e8c312827c802`](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/commits/e8c312827c802) -
  Remove unnecessary files from published package

## 2.0.5

### Patch Changes

- Updated dependencies

## 2.0.4

### Patch Changes

- Updated dependencies

## 2.0.3

### Patch Changes

- [#150219](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/pull-requests/150219)
  [`8f6e3a7613db0`](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/commits/8f6e3a7613db0) -
  Fixes invalid css comments in template literal styles

## 2.0.2

### Patch Changes

- [#127093](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/pull-requests/127093)
  [`1378ea7a99ce1`](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/commits/1378ea7a99ce1) -
  Upgrades `jscodeshift` to handle generics properly.
- Updated dependencies

## 2.0.1

### Patch Changes

- [#120533](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/pull-requests/120533)
  [`f1bec731e278f`](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/commits/f1bec731e278f) -
  Adds a `sideEffects` field to ensure this package does not have Compiled styles tree-shaken in the
  future to avoid an accidental regression.

  This is related to
  https://community.developer.atlassian.com/t/rfc-73-migrating-our-components-to-compiled-css-in-js/85953

## 2.0.0

### Major Changes

- [#117363](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/117363)
  [`10a0f7f6c2027`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/10a0f7f6c2027) -
  This package's `peerDependencies` have been adjusted for `react` and/or `react-dom` to reflect the
  status of only supporting React 18 going forward. No explicit breaking change to React support has
  been made in this release, but this is to signify going forward, breaking changes for React 16 or
  React 17 may come via non-major semver releases.

  Please refer this community post for more details:
  https://community.developer.atlassian.com/t/rfc-78-dropping-support-for-react-16-and-rendering-in-a-react-18-concurrent-root-in-jira-and-confluence/87026

### Patch Changes

- Updated dependencies

## 1.4.1

### Patch Changes

- [#113483](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/113483)
  [`e9c1247224a94`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/e9c1247224a94) -
  Internal refactor to Draggable to resolve issue with React 18 strict mode re-running effects in
  development mode.

## 1.4.0

### Minor Changes

- [#109060](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/109060)
  [`4660ec858a305`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/4660ec858a305) -
  Update `React` from v16 to v18

### Patch Changes

- Updated dependencies

## 1.3.1

### Patch Changes

- Updated dependencies

## 1.3.0

### Minor Changes

- [#168054](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/168054)
  [`6e5ded7326f80`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/6e5ded7326f80) -
  Removes dependency on @atlaskit/pragmatic-drag-and-drop-live-region and now maintains live region
  code internally.

## 1.2.4

### Patch Changes

- [#153912](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/153912)
  [`fb6d3603aa8df`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/fb6d3603aa8df) -
  Internal fix to batched updates check that determines if React 16 is being used. Previously it
  assumed the `version` export from `react-dom` was always defined, but it was only introduced in
  `react-dom@16.13.0`

## 1.2.3

### Patch Changes

- [#150464](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/150464)
  [`b813bd74ede6d`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/b813bd74ede6d) -
  Updates internal configuration files
- Updated dependencies

## 1.2.2

### Patch Changes

- Updated dependencies

## 1.2.1

### Patch Changes

- [#124164](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/124164)
  [`58941fa1d332a`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/58941fa1d332a) -
  All `react` unit tests will now run against `react@16` and `react@18` on CI.

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

### Patch Changes

- [#116984](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/116984)
  [`b13f5ee80ab4f`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/b13f5ee80ab4f) -
  Fixing event listener cleanup test
- Updated dependencies

## 1.1.3

### Patch Changes

- [#114764](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/114764)
  [`ae20dac6e31c4`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/ae20dac6e31c4) -
  Bump packages to use react-beautiful-dnd@12.2.0

## 1.1.2

### Patch Changes

- [#94316](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/94316)
  [`35fd5ed8e1d7`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/35fd5ed8e1d7) -
  Upgrading internal dependency `bind-event-listener` to `@^3.0.0`

## 1.1.1

### Patch Changes

- [#92913](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/92913)
  [`8f7e827e0978`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/8f7e827e0978) -
  Some Pragmatic drag and drop packages did not have `"author"` and or `"license"` attributes set in
  their `package.json` file. These missing attributes have now been added where required.

  ```diff
  + "author": "Atlassian Pty Ltd",
  + "license": "Apache-2.0",
  ```

  All Pragmatic drag and drop packages were already licensed under `Apache-2.0` (see `LICENSE`
  files), but the `"license"` attribute in some `package.json` files was missing.

- [#92913](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/92913)
  [`96a6f6a19a73`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/96a6f6a19a73) -
  Adding missing Apache 2.0 license file. This package has always been licensed under Apache 2.0
  (same as the other Pragmatic drag and drop packages).

## 1.1.0

### Minor Changes

- [#87853](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/87853)
  [`54e884fd8d96`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/54e884fd8d96) -
  Increasing `react` `peerDependency` range to include `react@17` and `react@18`.

### Patch Changes

- Updated dependencies

## 1.0.3

### Patch Changes

- [#84250](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/84250)
  [`a1cc31800621`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/a1cc31800621) -
  Internal refactor: now relying on automatic fallback insertion for `token()`. This change provides
  an improved experience for consumers who don't have Atlassian Design tokens enabled.

## 1.0.2

### Patch Changes

- [#83702](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/83702)
  [`4d9e25ab4eaa`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/4d9e25ab4eaa) -
  Updating the descriptions of Pragmatic drag and drop packages, so they each provide a consistent
  description to various consumers, and so they are consistently formed amongst each other.
  - `package.json` `description`
  - `README.md`
  - Website documentation

## 1.0.1

### Patch Changes

- [#83116](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/83116)
  [`8d4e99057fe0`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/8d4e99057fe0) -
  Upgrade Typescript from `4.9.5` to `5.4.2`

## 1.0.0

### Major Changes

- [#70616](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/70616)
  [`42e57ea65fee`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/42e57ea65fee) -
  This is our first `major` release (`1.0`) for all Pragmatic drag and drop packages.

  For a detailed explanation of these changes, and how to upgrade (automatically) to `1.0` please
  see our
  [1.0 upgrade guide](http://atlassian.design/components/pragmatic-drag-and-drop/core-package/upgrade-guides/upgrade-guide-for-1.0)

### Patch Changes

- Updated dependencies

## 0.17.7

### Patch Changes

- Updated dependencies

## 0.17.6

### Patch Changes

- Updated dependencies

## 0.17.5

### Patch Changes

- Updated dependencies

## 0.17.4

### Patch Changes

- Updated dependencies

## 0.17.3

### Patch Changes

- Updated dependencies

## 0.17.2

### Patch Changes

- Updated dependencies

## 0.17.1

### Patch Changes

- Updated dependencies

## 0.17.0

### Minor Changes

- [#37394](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/37394)
  [`006a7d12e9a`](https://bitbucket.org/atlassian/atlassian-frontend/commits/006a7d12e9a) - Internal
  folder name refactor

### Patch Changes

- Updated dependencies

## 0.16.0

### Minor Changes

- [#36716](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/36716)
  [`d25fd8a9056`](https://bitbucket.org/atlassian/atlassian-frontend/commits/d25fd8a9056) - React
  updates are now batched for React 16. Other optimizations have also been made to reduce the number
  of re-renders that occur.

## 0.15.0

### Minor Changes

- [#34585](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/34585)
  [`d71c9cef468`](https://bitbucket.org/atlassian/atlassian-frontend/commits/d71c9cef468) - [ux] The
  cross axis offset of keyboard drag previews is now a fixed value, instead of being
  percentage-based.

## 0.14.1

### Patch Changes

- Updated dependencies

## 0.14.0

### Minor Changes

- [#35198](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/35198)
  [`f32aef7bfed`](https://bitbucket.org/atlassian/atlassian-frontend/commits/f32aef7bfed) - [ux]
  Adds a grab cursor when hovering over draggable elements. Also adds other styles provided by the
  `react-beautiful-dnd` style marshal.

## 0.13.0

### Minor Changes

- [#35305](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/35305)
  [`5e58af07ce8`](https://bitbucket.org/atlassian/atlassian-frontend/commits/5e58af07ce8) - [ux]
  Entering a droppable from the start will now target the first index instead of the last.

## 0.12.0

### Minor Changes

- [#34561](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/34561)
  [`9909027b163`](https://bitbucket.org/atlassian/atlassian-frontend/commits/9909027b163) - It is
  now possible to unmount a `<Draggable/>` in a virtual list at any time during a drag operation,
  including while it is still visible.

## 0.11.0

### Minor Changes

- [#34694](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/34694)
  [`07779f6c5f7`](https://bitbucket.org/atlassian/atlassian-frontend/commits/07779f6c5f7) - Pointer
  drags are now blocked by interactive elements. This can be overriden using the
  `disableInteractiveElementBlocking` prop. This behavior is consistent with `react-beautiful-dnd`.

## 0.10.0

### Minor Changes

- [#34690](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/34690)
  [`245cc4ba6c3`](https://bitbucket.org/atlassian/atlassian-frontend/commits/245cc4ba6c3) - [ux]
  Drags will no longer start while holding down a modifier key. This change was done in order to
  match react-beautiful-dnd behaviour.

## 0.9.1

### Patch Changes

- [#34443](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/34443)
  [`61cb5313358`](https://bitbucket.org/atlassian/atlassian-frontend/commits/61cb5313358) - Removing
  unused dependencies and dev dependencies

## 0.9.0

### Minor Changes

- [#34199](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/34199)
  [`541c0511010`](https://bitbucket.org/atlassian/atlassian-frontend/commits/541c0511010) - [ux]
  Dragging elements are now slightly transparent, to allow better visibility of drop indicators.
  This also better aligns with native browser drag previews.

## 0.8.0

### Minor Changes

- [#34030](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/34030)
  [`1af8b676f81`](https://bitbucket.org/atlassian/atlassian-frontend/commits/1af8b676f81) - When
  starting a keyboard drag, key bindings are now added synchronously. Previously, they were added in
  a `requestAnimationFrame()` callback.

## 0.7.0

### Minor Changes

- [#33945](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/33945)
  [`a12da51e227`](https://bitbucket.org/atlassian/atlassian-frontend/commits/a12da51e227) - Makes
  `react-dom` a peer dependency instead of a direct dependency.

## 0.6.0

### Minor Changes

- [#33797](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/33797)
  [`b560a09202a`](https://bitbucket.org/atlassian/atlassian-frontend/commits/b560a09202a) - Fixes a
  memoization issue, significantly improving rerender performance.

## 0.5.0

### Minor Changes

- [#33590](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/33590)
  [`69c2501037c`](https://bitbucket.org/atlassian/atlassian-frontend/commits/69c2501037c) - Fixes a
  bug that caused parent scroll containers to jump to the top when returning to the source location
  during a keyboard drag.

### Patch Changes

- [#33793](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/33793)
  [`9d00501a414`](https://bitbucket.org/atlassian/atlassian-frontend/commits/9d00501a414) - Ensure
  legacy types are published for TS 4.5-4.8

## 0.4.2

### Patch Changes

- [#33649](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/33649)
  [`41fae2c6f68`](https://bitbucket.org/atlassian/atlassian-frontend/commits/41fae2c6f68) - Upgrade
  Typescript from `4.5.5` to `4.9.5`

## 0.4.1

### Patch Changes

- [#33561](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/33561)
  [`be8246510ed`](https://bitbucket.org/atlassian/atlassian-frontend/commits/be8246510ed) - Ensures
  that keyboard drag event bindings are properly cleaned up when a drag is cancelled because of an
  unhandled error on the window.

## 0.4.0

### Minor Changes

- [#33344](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/33344)
  [`9fd8556db17`](https://bitbucket.org/atlassian/atlassian-frontend/commits/9fd8556db17) - Internal
  folder name structure change

### Patch Changes

- Updated dependencies

## 0.3.0

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

### Patch Changes

- Updated dependencies

## 0.2.1

### Patch Changes

- [#33263](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/33263)
  [`16a901a9476`](https://bitbucket.org/atlassian/atlassian-frontend/commits/16a901a9476) - - Fixes
  a bug that could lead to invalid syntax when inserting comments before a `JSXExpressionContainer`
  node. Comments will now be wrapped in a new `JSXExpressionContainer` node.
  - Adds a file filter to the codemod transformers, so that only files which import either
    `react-beautiful-dnd` or `react-beautiful-dnd-next` will be processed.

## 0.2.0

### Minor Changes

- [#33258](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/33258)
  [`56507598609`](https://bitbucket.org/atlassian/atlassian-frontend/commits/56507598609) - Skip
  minor dependency bump

### Patch Changes

- Updated dependencies

## 0.1.0

### Minor Changes

- [#32921](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/32921)
  [`6be2b5508a9`](https://bitbucket.org/atlassian/atlassian-frontend/commits/6be2b5508a9) - Initial
  release
