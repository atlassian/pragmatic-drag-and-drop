# @atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-autoscroll

## 2.0.1

### Patch Changes

- [#125534](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/pull-requests/125534)
  [`56084060884c6`](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/commits/56084060884c6) -
  Removes React from the declared dependencies as they do not actually use it.
- [#125534](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/pull-requests/125534)
  [`ae44d864ac2ba`](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/commits/ae44d864ac2ba) -
  Removes `react` as a peer dependency as it is not actually used.

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

- Updated dependencies

## 1.1.0

### Minor Changes

- [#87853](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/87853)
  [`54e884fd8d96`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/54e884fd8d96) -
  Increasing `react` `peerDependency` range to include `react@17` and `react@18`.

## 1.0.3

### Patch Changes

- [#84398](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/84398)
  [`77694db987fc`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/77694db987fc) -
  Public release of Pragmatic drag and drop documentation

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

## 0.6.6

### Patch Changes

- Updated dependencies

## 0.6.5

### Patch Changes

- [#39935](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/39935)
  [`d9e36079257`](https://bitbucket.org/atlassian/atlassian-frontend/commits/d9e36079257) - Updating
  package information. No API or behaviour changes.
- Updated dependencies

## 0.6.4

### Patch Changes

- Updated dependencies

## 0.6.3

### Patch Changes

- Updated dependencies

## 0.6.2

### Patch Changes

- Updated dependencies

## 0.6.1

### Patch Changes

- Updated dependencies

## 0.6.0

### Minor Changes

- [#37394](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/37394)
  [`75f89536e12`](https://bitbucket.org/atlassian/atlassian-frontend/commits/75f89536e12) - Renaming
  this package from `@atlaskit/pragmatic-drag-and-drop-autoscroll` to
  `@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-autoscroll`.

  This package is a port of the existing `react-beautiful-dnd` auto scroller that we will continue
  to have as a separate package for usage with our `react-beautiful-dnd` → Pragmatic drag and drop
  migration layer (`@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration`).

  We are creating a new, more feature rich auto scroller which will soon be published as
  `@atlaskit/pragmatic-drag-and-drop-autoscroll`

## 0.5.4

### Patch Changes

- Updated dependencies

## 0.5.3

### Patch Changes

- [#34443](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/34443)
  [`61cb5313358`](https://bitbucket.org/atlassian/atlassian-frontend/commits/61cb5313358) - Removing
  unused dependencies and dev dependencies

## 0.5.2

### Patch Changes

- [#33793](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/33793)
  [`9d00501a414`](https://bitbucket.org/atlassian/atlassian-frontend/commits/9d00501a414) - Ensure
  legacy types are published for TS 4.5-4.8

## 0.5.1

### Patch Changes

- [#33649](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/33649)
  [`41fae2c6f68`](https://bitbucket.org/atlassian/atlassian-frontend/commits/41fae2c6f68) - Upgrade
  Typescript from `4.5.5` to `4.9.5`

## 0.5.0

### Minor Changes

- [#33344](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/33344)
  [`9fd8556db17`](https://bitbucket.org/atlassian/atlassian-frontend/commits/9fd8556db17) - Internal
  folder name structure change

### Patch Changes

- Updated dependencies

## 0.4.0

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

## 0.3.0

### Minor Changes

- [#33258](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/33258)
  [`56507598609`](https://bitbucket.org/atlassian/atlassian-frontend/commits/56507598609) - Skip
  minor dependency bump

### Patch Changes

- Updated dependencies

## 0.2.5

### Patch Changes

- [#32424](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/32424)
  [`2e01c9c74b5`](https://bitbucket.org/atlassian/atlassian-frontend/commits/2e01c9c74b5) - DUMMY
  remove before merging to master; dupe adf-schema via adf-utils

## 0.2.4

### Patch Changes

- Updated dependencies

## 0.2.3

### Patch Changes

- Updated dependencies

## 0.2.2

### Patch Changes

- Updated dependencies

## 0.2.1

### Patch Changes

- Updated dependencies

## 0.2.0

### Minor Changes

- [#30756](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/30756)
  [`1bfcde9828c`](https://bitbucket.org/atlassian/atlassian-frontend/commits/1bfcde9828c) - Adds a
  `behavior` option to the auto scroller. This allows for finer control over window and container
  scrolling precedence.

  ```ts
  type ScrollBehavior =
  	| 'window-then-container'
  	| 'container-then-window'
  	| 'window-only'
  	| 'container-only';
  ```

  - `window-then-container`: Attempt to scroll the window, then attempt to scroll the container if
    window scroll not possible
  - `container-then-window`: Attempt to scroll the container, then attempt to scroll the window if
    container scroll not possible
  - `container-only`: Only attempt to scroll the window
  - `window-only`: Only attempt to scroll the window

  Example:

  ```ts
  autoScroller.start({
    input: /* ... */,
    scrollBehavior: 'container-then-window'
  });
  ```

## 0.1.13

### Patch Changes

- Updated dependencies

## 0.1.12

### Patch Changes

- Updated dependencies

## 0.1.11

### Patch Changes

- Updated dependencies

## 0.1.10

### Patch Changes

- [#28324](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/28324)
  [`6455cf006b3`](https://bitbucket.org/atlassian/atlassian-frontend/commits/6455cf006b3) - Builds
  for this package now pass through a tokens babel plugin, removing runtime invocations of the
  tokens() function and improving performance.

## 0.1.9

### Patch Changes

- Updated dependencies

## 0.1.8

### Patch Changes

- [#24874](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/24874)
  [`8cc2f888c83`](https://bitbucket.org/atlassian/atlassian-frontend/commits/8cc2f888c83) - Upgrade
  Typescript from `4.3.5` to `4.5.5`

## 0.1.7

### Patch Changes

- [#25485](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/25485)
  [`32d7630d1aa`](https://bitbucket.org/atlassian/atlassian-frontend/commits/32d7630d1aa) - Updating
  @emotion dev dependency

## 0.1.6

### Patch Changes

- Updated dependencies

## 0.1.5

### Patch Changes

- Updated dependencies

## 0.1.4

### Patch Changes

- Updated dependencies

## 0.1.3

### Patch Changes

- Updated dependencies

## 0.1.2

### Patch Changes

- Updated dependencies

## 0.1.1

### Patch Changes

- Updated dependencies

## 0.1.0

### Minor Changes

- [#24532](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/24532)
  [`73427c38077`](https://bitbucket.org/atlassian/atlassian-frontend/commits/73427c38077) - Initial
  release of `@atlaskit/drag-and-drop` packages 🎉

### Patch Changes

- Updated dependencies

## 0.0.1

### Patch Changes

- [#24492](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/24492)
  [`8d4228767b0`](https://bitbucket.org/atlassian/atlassian-frontend/commits/8d4228767b0) - Upgrade
  Typescript from `4.2.4` to `4.3.5`.
- Updated dependencies
