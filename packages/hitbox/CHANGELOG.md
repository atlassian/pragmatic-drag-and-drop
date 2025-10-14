# @atlaskit/pragmatic-drag-and-drop-hitbox

## 1.1.0

### Minor Changes

- [#152796](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/pull-requests/152796)
  [`530aa01e75ebe`](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/commits/530aa01e75ebe) -
  Exposing new `list-item` hitbox which streamlines working with lists and nested structures. See
  documentation for API and usage information.

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

## 0.12.1

### Patch Changes

- Updated dependencies

## 0.12.0

### Minor Changes

- [#42620](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/42620)
  [`0b832b288e8`](https://bitbucket.org/atlassian/atlassian-frontend/commits/0b832b288e8) - Moving
  our tree exports that are used in Confluence from `experimental` to `stable`.

  ```diff
  - @atlaskit/pragmatic-drag-and-drop-hitbox/experimental/tree-item
  + @atlaskit/pragmatic-drag-and-drop-hitbox/tree-item
  ```

## 0.11.9

### Patch Changes

- Updated dependencies

## 0.11.8

### Patch Changes

- Updated dependencies

## 0.11.7

### Patch Changes

- Updated dependencies

## 0.11.6

### Patch Changes

- Updated dependencies

## 0.11.5

### Patch Changes

- Updated dependencies

## 0.11.4

### Patch Changes

- Updated dependencies

## 0.11.3

### Patch Changes

- [#34443](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/34443)
  [`61cb5313358`](https://bitbucket.org/atlassian/atlassian-frontend/commits/61cb5313358) - Removing
  unused dependencies and dev dependencies

## 0.11.2

### Patch Changes

- [#33793](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/33793)
  [`9d00501a414`](https://bitbucket.org/atlassian/atlassian-frontend/commits/9d00501a414) - Ensure
  legacy types are published for TS 4.5-4.8

## 0.11.1

### Patch Changes

- [#33649](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/33649)
  [`41fae2c6f68`](https://bitbucket.org/atlassian/atlassian-frontend/commits/41fae2c6f68) - Upgrade
  Typescript from `4.5.5` to `4.9.5`

## 0.11.0

### Minor Changes

- [#33344](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/33344)
  [`9fd8556db17`](https://bitbucket.org/atlassian/atlassian-frontend/commits/9fd8556db17) - Internal
  folder name structure change

### Patch Changes

- Updated dependencies

## 0.10.0

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

## 0.9.0

### Minor Changes

- [#33258](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/33258)
  [`56507598609`](https://bitbucket.org/atlassian/atlassian-frontend/commits/56507598609) - Skip
  minor dependency bump

### Patch Changes

- Updated dependencies

## 0.8.1

### Patch Changes

- [#32424](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/32424)
  [`2e01c9c74b5`](https://bitbucket.org/atlassian/atlassian-frontend/commits/2e01c9c74b5) - DUMMY
  remove before merging to master; dupe adf-schema via adf-utils

## 0.8.0

### Minor Changes

- [#32145](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/32145)
  [`a7dc73c0a57`](https://bitbucket.org/atlassian/atlassian-frontend/commits/a7dc73c0a57) - Internal
  refactor: implemented a cheaper mechanism to enable memoization of tree item data

## 0.7.0

### Minor Changes

- [#32051](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/32051)
  [`00434d087d7`](https://bitbucket.org/atlassian/atlassian-frontend/commits/00434d087d7) - Tree
  item hitbox data is now memoized. This is helpful to reduce work for consumers who may take
  actions based on object reference changes.

  If you are using `react` and putting tree item hitbox instructions into state, react will now only
  re-render when the content of the instruction changes.

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

- [#31289](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/31289)
  [`179d953be18`](https://bitbucket.org/atlassian/atlassian-frontend/commits/179d953be18) - [ux]
  Tweaking the hitbox of "expanded" tree items to improve the experience when expanding tree items
  during a drag. Note: our tree item hitbox is still _experimental_

## 0.5.0

### Minor Changes

- [#30953](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/30953)
  [`90901f5bbe0`](https://bitbucket.org/atlassian/atlassian-frontend/commits/90901f5bbe0) - Replace
  default entry point of `undefined` with `{}`.

  > **NOTE:** Importing from the default entry point isn't supported. _Please use individual entry
  > points in order to always obtain minimum kbs._

### Patch Changes

- Updated dependencies

## 0.4.1

### Patch Changes

- Updated dependencies

## 0.4.0

### Minor Changes

- [#29945](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/29945)
  [`fe6772a3719`](https://bitbucket.org/atlassian/atlassian-frontend/commits/fe6772a3719) - Dramatic
  update to **experimental** tree-item outputs. These outputs should only be used right now by
  Confluence Page Tree. Changes are being communicated face to face with Confluence team members

## 0.3.2

### Patch Changes

- Updated dependencies

## 0.3.1

### Patch Changes

- Updated dependencies

## 0.3.0

### Minor Changes

- [#26934](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/26934)
  [`f004dadb4fc`](https://bitbucket.org/atlassian/atlassian-frontend/commits/f004dadb4fc) -
  `reorderWithEdge` has changed API in order to more accurately reflect the values that are being
  passed in

  ```diff
  function reorderWithEdge<Value>(args: {
      list: Value[];
  -   edge: Edge | null;
  +   // the reorder operation is based on what the closest edge of the target is
  +   closestEdgeOfTarget: Edge | null;
      startIndex: number;
  -   finalIndex: number
  +   // we are reordering relative to the target
  +   indexOfTarget: number;
      axis: 'vertical' | 'horizontal';
  }): Value[];
  ```

  Adding new utility: `getReorderDestinationIndex`

  When you are rendering _drop indicators_ (eg lines) between items in a list, it can be difficult
  to know what the `index` the dropped item should go into. The final `index` will depend on what
  the closest `Edge` is. `getReorderDestinationIndex` can give you the final `index` for a
  reordering operation, taking into account which `Edge` is closest

  ```ts
  import { getReorderDestinationIndex } from '@atlaskit/drag-and-drop-hitbox/util/get-reorder-destination-index';

  // Dragging A on the left of B
  // A should stay in the same spot
  expect(
  	getReorderDestinationIndex({
  		// list: ['A', 'B', 'C'],
  		// move A to left of B
  		startIndex: 0,
  		indexOfTarget: 1,
  		closestEdgeOfTarget: 'left',
  		axis: 'horizontal',
  	}),
  	// results in no change: ['A', 'B', 'C']
  ).toEqual(0);

  // Dragging A on the right of B
  // A should go after B
  expect(
  	getReorderDestinationIndex({
  		// list: ['A', 'B', 'C'],
  		// move A to right of B
  		startIndex: 0,
  		indexOfTarget: 1,
  		closestEdgeOfTarget: 'right',
  		axis: 'horizontal',
  	}),
  	// A moved forward ['B', 'A', 'C']
  ).toEqual(1);
  ```

## 0.2.7

### Patch Changes

- Updated dependencies

## 0.2.6

### Patch Changes

- [#24874](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/24874)
  [`8cc2f888c83`](https://bitbucket.org/atlassian/atlassian-frontend/commits/8cc2f888c83) - Upgrade
  Typescript from `4.3.5` to `4.5.5`

## 0.2.5

### Patch Changes

- Updated dependencies

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

- [#24613](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/24613)
  [`dcebdf9404e`](https://bitbucket.org/atlassian/atlassian-frontend/commits/dcebdf9404e) - We have
  improved our naming consistency across our drag and drop packages.

  - `@atlaskit/drag-and-drop-hitbox/closest-edge` has been renamed to
    `@atlaskit/drag-and-drop-hitbox/addon/closest-edge`
  - `@atlaskit/drag-and-drop-hitbox/reorder-with-edge` has been renamed to
    `@atlaskit/drag-and-drop-hitbox/util/reorder-with-edge`

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
