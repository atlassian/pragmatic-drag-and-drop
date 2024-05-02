# @atlaskit/pragmatic-drag-and-drop-auto-scroll

## 1.3.0

### Minor Changes

- [#95426](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/95426) [`a58266bf88e6`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/a58266bf88e6) - Adding axis locking functionality

  ```diff
  + // `getAllowedAxis` added to element, text selection and external auto scrollers

    autoScrollForElements({
      element: myElement,
  +    getAllowedAxis: (args: ElementGetFeedbackArgs<DragType>) =>  'horizontal' | 'vertical' | 'all',
    });

    autoScrollWindowForElements({
  +    getAllowedAxis: (args: WindowGetFeedbackArgs<DragType>) =>  'horizontal' | 'vertical' | 'all',
    });

    unsafeOverflowAutoScrollForElements({
  +    getAllowedAxis?: (args: ElementGetFeedbackArgs<DragType>) => AllowedAxis;
    })
  ```

## 1.2.0

### Minor Changes

> `1.2.0` is deprecated on `npm` and should not be used. Shortly after release we decided to change this API

- [#94103](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/94103) [`4e3fb63eb288`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/4e3fb63eb288) - Added axis locking functionality.

  ```diff
  autoScrollForElements({
    element: myElement,
    getConfiguration: () => ({
      maxScrollSpeed: 'fast' | 'standard',
  +    allowedAxis: 'horizontal' | 'vertical' | 'all',
    }),
  })
  ```

## 1.1.0

### Minor Changes

- [#94454](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/94454) [`4b40eb010074`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/4b40eb010074) - Exposing the unsafe overflow auto scroller for external drags (`unsafeOverflowAutoScrollForExternal()`). This already existed, but it was not exposed publicly 🤦‍♂️.

  ```diff
  import {unsafeOverflowAutoScrollForElements from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/unsafe-overflow/element';
  import {unsafeOverflowAutoScrollForTextSelection} from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/unsafe-overflow/text-selection';
  + import {unsafeOverflowAutoScrollForExternal} from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/unsafe-overflow/external';
  ```

## 1.0.4

### Patch Changes

- [#94316](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/94316) [`35fd5ed8e1d7`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/35fd5ed8e1d7) - Upgrading internal dependency `bind-event-listener` to `@^3.0.0`

## 1.0.3

### Patch Changes

- [#84398](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/84398) [`77694db987fc`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/77694db987fc) - Public release of Pragmatic drag and drop documentation

## 1.0.2

### Patch Changes

- [#83702](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/83702) [`4d9e25ab4eaa`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/4d9e25ab4eaa) - Updating the descriptions of Pragmatic drag and drop packages, so they each provide a consistent description to various consumers, and so they are consistently formed amongst each other.

  - `package.json` `description`
  - `README.md`
  - Website documentation

## 1.0.1

### Patch Changes

- [#83116](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/83116) [`8d4e99057fe0`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/8d4e99057fe0) - Upgrade Typescript from `4.9.5` to `5.4.2`

## 1.0.0

### Major Changes

- [#70616](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/70616) [`42e57ea65fee`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/42e57ea65fee) - This is our first `major` release (`1.0`) for all Pragmatic drag and drop packages.

  For a detailed explanation of these changes, and how to upgrade (automatically) to `1.0` please see our [1.0 upgrade guide](http://atlassian.design/components/pragmatic-drag-and-drop/core-package/upgrade-guides/upgrade-guide-for-1.0)

### Patch Changes

- Updated dependencies

## 0.8.1

### Patch Changes

- Updated dependencies

## 0.8.0

### Minor Changes

- [#57337](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/57337) [`4ad3fa749a5c`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/4ad3fa749a5c) - Adding the ability to increase the maximum automatic scroll speed.

  ```diff
  autoScrollForElements({
    element: myElement,
  +  getConfiguration: () => ({maxScrollSpeed: 'fast' | 'standard'}),
  })
  ```

  `getConfiguration()` is a new _optional_ argument be used with all auto scrolling registration functions:

  - `autoScrollForElements`
  - `autoScrollWindowForElements`
  - `autoScrollForFiles`
  - `autoScrollWindowForFiles`
  - `unsafeOverflowForElements`
  - `unsafeOverflowForFiles`

  ```ts
  autoScrollForElements({
    element: myElement,
    getConfiguration: () => ({ maxScrollSpeed : 'fast' })
  }),
  ```

  We recommend using the default `"standard"` max scroll speed for most experiences. However, on _some_ larger experiences, a faster max scroll speed (`"fast"`) can feel better.

## 0.7.0

### Minor Changes

- [#42774](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/42774) [`66d9475437e`](https://bitbucket.org/atlassian/atlassian-frontend/commits/66d9475437e) - Internal refactoring to improve clarity and safety

## 0.6.0

### Minor Changes

- [#42668](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/42668) [`0a4e3f44ba3`](https://bitbucket.org/atlassian/atlassian-frontend/commits/0a4e3f44ba3) - We have landed a few fixes for "overflow scrolling"

  - Fix: Time dampening could be incorrectly reset when transitioning from "over element" auto scrolling to "overflow" auto scrolling for certain element configurations.
  - Fix: Parent "overflow scrolling" registrations could prevent overflow scrolling on children elements, if the parent was registered first.
  - Fix: "overflow scrolling" `canScroll() => false` would incorrectly opt out of "overflow scrolling" for younger registrations.

## 0.5.0

### Minor Changes

- [#39935](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/39935) [`20a91012629`](https://bitbucket.org/atlassian/atlassian-frontend/commits/20a91012629) - First public release of this package. Please refer to documentation for usage and API information.

### Patch Changes

- Updated dependencies

## 0.4.0

### Minor Changes

- [#39303](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/39303) [`a6d9f3bb566`](https://bitbucket.org/atlassian/atlassian-frontend/commits/a6d9f3bb566) - Adding optional overflow scrolling API. API information shared directly with Trello

## 0.3.2

### Patch Changes

- Updated dependencies

## 0.3.1

### Patch Changes

- Updated dependencies

## 0.3.0

### Minor Changes

- [#38658](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/38658) [`7803a90e9c6`](https://bitbucket.org/atlassian/atlassian-frontend/commits/7803a90e9c6) - This change makes it so that distance dampening is based on the size of the hitbox and not the container. Now that we clamp the size of the hitbox, our distance dampening needs to be based on the size of the hitbox, and not the container.

## 0.2.0

### Minor Changes

- [#38630](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/38630) [`5c643ce004d`](https://bitbucket.org/atlassian/atlassian-frontend/commits/5c643ce004d) - Limiting the max size of auto scrolling hitboxes. This prevents large elements having giant auto scroll hitboxes

## 0.1.0

### Minor Changes

- [#38525](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/38525) [`693af8c5775`](https://bitbucket.org/atlassian/atlassian-frontend/commits/693af8c5775) - Early release of our new optional drag and drop package for Pragmatic drag and drop. Package release is only for early integration with Trello.

### Patch Changes

- Updated dependencies
