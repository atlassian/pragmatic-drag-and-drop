# @atlaskit/pragmatic-drag-and-drop-live-region

## 1.3.1

### Patch Changes

- [`e8c312827c802`](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/commits/e8c312827c802) -
  Remove unnecessary files from published package

## 1.3.0

### Minor Changes

- [#109060](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/109060)
  [`4660ec858a305`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/4660ec858a305) -
  Update `React` from v16 to v18

## 1.2.0

### Minor Changes

- [#168054](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/168054)
  [`f9b89a52cbad6`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/f9b89a52cbad6) -
  Changes announcement behavior to be delayed and polite instead of immediate and assertive. This
  helps issues with announcements sometimes being skipped or interrupted.

## 1.1.0

### Minor Changes

- [#150481](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/150481)
  [`e750fb3633f6e`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/e750fb3633f6e) -
  [ux] Enable new icons behind a feature flag.

### Patch Changes

- [#150464](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/150464)
  [`b813bd74ede6d`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/b813bd74ede6d) -
  Updates internal configuration files

## 1.0.7

### Patch Changes

- [#124164](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/124164)
  [`58941fa1d332a`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/58941fa1d332a) -
  All `react` unit tests will now run against `react@16` and `react@18` on CI.

## 1.0.6

### Patch Changes

- [#92007](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/92007)
  [`85525725cb0d`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/85525725cb0d) -
  Migrated to the new button component

## 1.0.5

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

## 1.0.4

### Patch Changes

- [#86309](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/86309)
  [`1827ac58bb32`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/1827ac58bb32) -
  There were some cases where our visually hidden styles could case the page to slightly increase in
  size. This has now been fixed.

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

- [#28324](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/28324)
  [`6455cf006b3`](https://bitbucket.org/atlassian/atlassian-frontend/commits/6455cf006b3) - Builds
  for this package now pass through a tokens babel plugin, removing runtime invocations of the
  tokens() function and improving performance.

## 0.2.1

### Patch Changes

- [#24874](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/24874)
  [`8cc2f888c83`](https://bitbucket.org/atlassian/atlassian-frontend/commits/8cc2f888c83) - Upgrade
  Typescript from `4.3.5` to `4.5.5`

## 0.2.0

### Minor Changes

- [#25485](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/25485)
  [`5b37b07dc94`](https://bitbucket.org/atlassian/atlassian-frontend/commits/5b37b07dc94) - Moving
  from `@emotion/core@10` to `@emotion/react@11` to line up `@emotion` usage with the rest of the
  Design System

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
