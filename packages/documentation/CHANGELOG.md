# @atlaskit/pragmatic-drag-and-drop-docs

## 1.3.0

### Minor Changes

- [#109060](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/109060)
  [`4660ec858a305`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/4660ec858a305) -
  Update `React` from v16 to v18

## 1.2.0

### Minor Changes

- [#150481](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/150481)
  [`e750fb3633f6e`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/e750fb3633f6e) -
  [ux] Enable new icons behind a feature flag.

## 1.1.3

### Patch Changes

- [#126649](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/126649)
  [`24092d9f293a1`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/24092d9f293a1) -
  Migrated usages of the Box primitive being cast as `<a>` tags to the new Anchor primitive. No
  changes are expected.

## 1.1.2

### Patch Changes

- [#124164](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/124164)
  [`58941fa1d332a`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/58941fa1d332a) -
  All `react` unit tests will now run against `react@16` and `react@18` on CI.

## 1.1.1

### Patch Changes

- [#123925](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/123925)
  [`d6234c59408c8`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/d6234c59408c8) -
  Internal change to typography component APIs resulting in very minor letter spacing changes.

## 1.1.0

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

## 1.0.12

### Patch Changes

- [#116025](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/116025)
  [`cd506a937e44f`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/cd506a937e44f) -
  Internal change to how typography is applied. There should be no visual change.

## 1.0.11

### Patch Changes

- [#112215](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/112215)
  [`19c101e4b4309`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/19c101e4b4309) -
  Fixes examples that were not working in CodeSandbox.

## 1.0.10

### Patch Changes

- [#94316](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/94316)
  [`35fd5ed8e1d7`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/35fd5ed8e1d7) -
  Upgrading internal dependency `bind-event-listener` to `@^3.0.0`

## 1.0.9

### Patch Changes

- [#92007](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/92007)
  [`85525725cb0d`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/85525725cb0d) -
  Migrated to the new button component

## 1.0.8

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

## 1.0.7

### Patch Changes

- [#88354](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/88354)
  [`4c87d9b4f0c2`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/4c87d9b4f0c2) -
  The internal composition of this component has changed. There is no expected change in behavior.

## 1.0.6

### Patch Changes

- [#84829](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/84829)
  [`a6299ec57bc3`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/a6299ec57bc3) -
  Internal change to replace hardcoded font fallback values with an exported constant. There is no
  expected visual difference.

## 1.0.5

### Patch Changes

- [#84398](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/84398)
  [`77694db987fc`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/77694db987fc) -
  Public release of Pragmatic drag and drop documentation

## 1.0.4

### Patch Changes

- [#83176](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/83176)
  [`5c64e4657ef3`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/5c64e4657ef3) -
  [ux] Minor changes to replace deprecated font tokens with new tokens. There may be some very
  slight differences in font size if the previous value was incorrectly applied, and slight
  differences in line height to match the new typography system.

## 1.0.3

### Patch Changes

- [#83702](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/83702)
  [`4d9e25ab4eaa`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/4d9e25ab4eaa) -
  Updating the descriptions of Pragmatic drag and drop packages, so they each provide a consistent
  description to various consumers, and so they are consistently formed amongst each other.

  - `package.json` `description`
  - `README.md`
  - Website documentation

## 1.0.2

### Patch Changes

- [#83116](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/83116)
  [`8d4e99057fe0`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/8d4e99057fe0) -
  Upgrade Typescript from `4.9.5` to `5.4.2`

## 1.0.1

### Patch Changes

- [#76341](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/76341)
  [`d30dab1f35c4`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/d30dab1f35c4) -
  Minor internal refactor to reduce duplication

## 1.0.0

### Major Changes

- [#70616](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/70616)
  [`42e57ea65fee`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/42e57ea65fee) -
  This is our first `major` release (`1.0`) for all Pragmatic drag and drop packages.

  For a detailed explanation of these changes, and how to upgrade (automatically) to `1.0` please
  see our
  [1.0 upgrade guide](http://atlassian.design/components/pragmatic-drag-and-drop/core-package/upgrade-guides/upgrade-guide-for-1.0)

## 0.6.0

### Minor Changes

- [#36269](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/36269)
  [`8ca10b64c7d`](https://bitbucket.org/atlassian/atlassian-frontend/commits/8ca10b64c7d) - Dev
  dependencies changed.

## 0.5.4

### Patch Changes

- [#36996](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/36996)
  [`d3fbfaa793e`](https://bitbucket.org/atlassian/atlassian-frontend/commits/d3fbfaa793e) - Updated
  board example

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

## 0.3.0

### Minor Changes

- [#33258](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/33258)
  [`56507598609`](https://bitbucket.org/atlassian/atlassian-frontend/commits/56507598609) - Skip
  minor dependency bump

## 0.2.2

### Patch Changes

- [#32424](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/32424)
  [`2e01c9c74b5`](https://bitbucket.org/atlassian/atlassian-frontend/commits/2e01c9c74b5) - DUMMY
  remove before merging to master; dupe adf-schema via adf-utils

## 0.2.1

### Patch Changes

- [#30726](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/30726)
  [`519765316c5`](https://bitbucket.org/atlassian/atlassian-frontend/commits/519765316c5) - [ux]
  Updated examples

## 0.2.0

### Minor Changes

- [#30953](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/30953)
  [`90901f5bbe0`](https://bitbucket.org/atlassian/atlassian-frontend/commits/90901f5bbe0) - Replace
  default entry point of `undefined` with `{}`.

  > **NOTE:** Importing from the default entry point isn't supported. _Please use individual entry
  > points in order to always obtain minimum kbs._

## 0.1.3

### Patch Changes

- [#28324](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/28324)
  [`6455cf006b3`](https://bitbucket.org/atlassian/atlassian-frontend/commits/6455cf006b3) - Builds
  for this package now pass through a tokens babel plugin, removing runtime invocations of the
  tokens() function and improving performance.

## 0.1.2

### Patch Changes

- [#24874](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/24874)
  [`8cc2f888c83`](https://bitbucket.org/atlassian/atlassian-frontend/commits/8cc2f888c83) - Upgrade
  Typescript from `4.3.5` to `4.5.5`

## 0.1.1

### Patch Changes

- [#24613](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/24613)
  [`e7d9e25b0b1`](https://bitbucket.org/atlassian/atlassian-frontend/commits/e7d9e25b0b1) - Updated
  examples to reflect naming and path changes of other drag and drop packages

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
