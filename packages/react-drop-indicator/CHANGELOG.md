# @atlaskit/pragmatic-drag-and-drop-react-indicator

## 3.2.9

### Patch Changes

- Updated dependencies

## 3.2.8

### Patch Changes

- Updated dependencies

## 3.2.7

### Patch Changes

- [`5d0b8ba5e6f7f`](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/commits/5d0b8ba5e6f7f) -
  Internal changes to how borders are applied.
- Updated dependencies

## 3.2.6

### Patch Changes

- [`beaa6ee463aa8`](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/commits/beaa6ee463aa8) -
  Internal changes to how border radius is applied.
- Updated dependencies

## 3.2.5

### Patch Changes

- [`e8c312827c802`](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/commits/e8c312827c802) -
  Remove unnecessary files from published package

## 3.2.4

### Patch Changes

- [`5bed2aeb9093f`](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/commits/5bed2aeb9093f) -
  Internal refactoring of tests

## 3.2.3

### Patch Changes

- [`2b9d69f7eb7bd`](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/commits/2b9d69f7eb7bd) -
  Adding tests to ensure all outputs work with React suspense, and React strict mode.

## 3.2.2

### Patch Changes

- Updated dependencies

## 3.2.1

### Patch Changes

- Updated dependencies

## 3.2.0

### Minor Changes

- [#152796](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/pull-requests/152796)
  [`530aa01e75ebe`](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/commits/530aa01e75ebe) -
  Adding new drop indicators `border`, `group` and `list-item` to assist with more complex
  experiences. See documentation for API and usage information.

### Patch Changes

- Updated dependencies

## 3.1.0

### Minor Changes

- [#140214](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/pull-requests/140214)
  [`6903fb239a6ac`](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/commits/6903fb239a6ac) -
  Exposing a `<Border>` drop indicator component. Currently `Border` is not documented while we
  validate with internal usage.

## 3.0.2

### Patch Changes

- [#125534](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/pull-requests/125534)
  [`f135a8d1066c9`](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/commits/f135a8d1066c9) -
  Updates the `react` peer dependency range to include React 19. While we expect these packages to
  work with React 19, we do not test against and there is a small risk of issues. If you have any
  problems, please raise an issue on [Github](https://github.com/atlassian/pragmatic-drag-and-drop).

## 3.0.1

### Patch Changes

- [#129972](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/pull-requests/129972)
  [`b2d69a39e6687`](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/commits/b2d69a39e6687) -
  Update `@compiled/react` dependency for improved type checking support.

## 3.0.0

### Major Changes

- [#125185](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/pull-requests/125185)
  [`62f176ec5174c`](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/commits/62f176ec5174c) -
  `box-without-terminal` has been removed as it is now redundant. `box-without-terminal` can now be
  achieved with `box` by leveraging `type="no-terminal"`.

  ```diff
  - import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box-without-terminal';
  + import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';

  function Item() {
  -  return <DropIndicator edge="bottom" />
  +  return <DropIndicator edge="bottom" type="no-terminal" />
  }
  ```

- [#125185](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/pull-requests/125185)
  [`d2d78bed3e76f`](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/commits/d2d78bed3e76f) -
  This package is moving from `@emotion/react` to [Compiled](https://compiledcssinjs.com/) for
  styling.

  [Compiled](https://compiledcssinjs.com/) is a styling solution with a tiny runtime (`~260B`) that
  you can use along side your existing styling solution(s). As long as your bundler supports CSS
  imports (eg `import './styles.css'`) then you shouldn't need to do anything!
  [More information for if you run into any difficulties](https://community.developer.atlassian.com/t/rfc-73-migrating-our-components-to-compiled-css-in-js/85953).

  This change has been released as a `major`, as it would require changes for consumers who do not
  have a bundler with CSS imports enabled.

### Patch Changes

- Updated dependencies

## 2.2.0

### Minor Changes

- [#124834](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/pull-requests/124834)
  [`c6ef61f6b00d1`](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/commits/c6ef61f6b00d1) -
  **More out of the `box`**

  The API of our `box` drop indicator has been expanded to include `type` (more control over the
  terminal), `appearance` (color control) and `indent` (line shifting). See documentation for full
  usage explanation and examples.

  **`box-without-terminal` is deprecated**

  `box-without-terminal` has been deprecated as it is now redundant. `box-without-terminal` can now
  be achieved with `box` by leveraging `type="no-terminal"`.

  ```diff
  - import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box-without-terminal';
  + import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';

  function Item() {
  -  return <DropIndicator edge="bottom" />
  +  return <DropIndicator edge="bottom" type="no-terminal" />
  }
  ```

  We will remove `box-without-terminal` in the next `major` release.

## 2.1.0

### Minor Changes

- [#119914](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/pull-requests/119914)
  [`e77649a3345a0`](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/commits/e77649a3345a0) -
  **New: Right to left (rtl) support**

  All drop indicators now correctly support
  ["right to left" (`rtl`) rendering](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/dir).
  - `box` and `tree-item`: terminals (circles) on lines are now rendered on right hand side of the
    line for `rtl` rendering
  - `tree-item`: `indent` will now correctly respect `rtl` rendering.

  **Other**
  - All drop indicators that rendered lines now leverage the same underlying base component to help
    reduce bundle size for consumers leveraging multiple types of drop indicators.

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

## 1.2.0

### Minor Changes

- [#109060](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/109060)
  [`4660ec858a305`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/4660ec858a305) -
  Update `React` from v16 to v18

### Patch Changes

- Updated dependencies

## 1.1.4

### Patch Changes

- Updated dependencies

## 1.1.3

### Patch Changes

- Updated dependencies

## 1.1.2

### Patch Changes

- [#124164](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/124164)
  [`58941fa1d332a`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/58941fa1d332a) -
  All `react` unit tests will now run against `react@16` and `react@18` on CI.

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

## 1.1.0

### Minor Changes

- [#87853](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/87853)
  [`54e884fd8d96`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/54e884fd8d96) -
  Increasing `react` `peerDependency` range to include `react@17` and `react@18`.

## 1.0.4

### Patch Changes

- [#84398](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/84398)
  [`77694db987fc`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/77694db987fc) -
  Public release of Pragmatic drag and drop documentation

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
  [`8fbaead12358`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/8fbaead12358) -
  As a part of our `1.0` release of Pragmatic drag and drop, we have renamed
  `@atlaskit/pragmatic-drag-and-drop-react-indicator` to
  `@atlaskit/pragmatic-drag-and-drop-react-drop-indicator` to improve naming consistency.

  For a detailed explanation of these changes, and how to upgrade (automatically) to `1.0` please
  see our
  [1.0 upgrade guide](http://atlassian.design/components/pragmatic-drag-and-drop/core-package/upgrade-guides/upgrade-guide-for-1.0)

### Patch Changes

- Updated dependencies

## 0.18.0

### Minor Changes

- [#62704](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/62704)
  [`842b8e893c33`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/842b8e893c33) -
  [ux] Making small change so that the line and terminal have the same color
  (`"color.border.selected"`). Previously, the line (unintentionally) had a slightly different shade
  of blue.

## 0.17.1

### Patch Changes

- Updated dependencies

## 0.17.0

### Minor Changes

- [#42620](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/42620)
  [`0e076ee05b0`](https://bitbucket.org/atlassian/atlassian-frontend/commits/0e076ee05b0) - Moving
  our tree exports that are used in Confluence from `experimental` to `stable`.

  ```diff
  - @atlaskit/pragmatic-drag-and-drop-react-indicator/experimental/tree-item
  + @atlaskit/pragmatic-drag-and-drop-react-indicator/tree-item
  ```

### Patch Changes

- Updated dependencies

## 0.16.6

### Patch Changes

- Updated dependencies

## 0.16.5

### Patch Changes

- [#39749](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/39749)
  [`e6b69f455c3`](https://bitbucket.org/atlassian/atlassian-frontend/commits/e6b69f455c3) - Connect
  yarn changeset to packages, upgrade adf-schema

## 0.16.4

### Patch Changes

- Updated dependencies

## 0.16.3

### Patch Changes

- Updated dependencies

## 0.16.2

### Patch Changes

- Updated dependencies

## 0.16.1

### Patch Changes

- Updated dependencies

## 0.16.0

### Minor Changes

- [#37722](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/37722)
  [`3ccb90e7480`](https://bitbucket.org/atlassian/atlassian-frontend/commits/3ccb90e7480) - Changed
  folder structure of package. There should be no visible changes.

## 0.15.0

### Minor Changes

- [#37280](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/37280)
  [`975218de587`](https://bitbucket.org/atlassian/atlassian-frontend/commits/975218de587) - Adds a
  terminal to the `DropIndicator` in the `/box` entrypoint. We now recommend most consumers use
  lines with terminals.

  A new entrypoint `/box-without-terminal` has been added, which contains the old appearance.

## 0.14.4

### Patch Changes

- Updated dependencies

## 0.14.3

### Patch Changes

- [#34443](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/34443)
  [`61cb5313358`](https://bitbucket.org/atlassian/atlassian-frontend/commits/61cb5313358) - Removing
  unused dependencies and dev dependencies

## 0.14.2

### Patch Changes

- [#33793](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/33793)
  [`9d00501a414`](https://bitbucket.org/atlassian/atlassian-frontend/commits/9d00501a414) - Ensure
  legacy types are published for TS 4.5-4.8

## 0.14.1

### Patch Changes

- [#33649](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/33649)
  [`41fae2c6f68`](https://bitbucket.org/atlassian/atlassian-frontend/commits/41fae2c6f68) - Upgrade
  Typescript from `4.5.5` to `4.9.5`

## 0.14.0

### Minor Changes

- [#33344](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/33344)
  [`9fd8556db17`](https://bitbucket.org/atlassian/atlassian-frontend/commits/9fd8556db17) - Internal
  folder name structure change

### Patch Changes

- Updated dependencies

## 0.13.0

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

## 0.12.0

### Minor Changes

- [#33258](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/33258)
  [`56507598609`](https://bitbucket.org/atlassian/atlassian-frontend/commits/56507598609) - Skip
  minor dependency bump

### Patch Changes

- Updated dependencies

## 0.11.1

### Patch Changes

- [#32424](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/32424)
  [`2e01c9c74b5`](https://bitbucket.org/atlassian/atlassian-frontend/commits/2e01c9c74b5) - DUMMY
  remove before merging to master; dupe adf-schema via adf-utils

## 0.11.0

### Minor Changes

- [#32212](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/32212)
  [`e2a4f1aeab0`](https://bitbucket.org/atlassian/atlassian-frontend/commits/e2a4f1aeab0) - Changing
  experimental tree item border radius (`2px`) to match border radius of Confluence tree items
  (`3px`)

## 0.10.6

### Patch Changes

- Updated dependencies

## 0.10.5

### Patch Changes

- Updated dependencies

## 0.10.4

### Patch Changes

- Updated dependencies

## 0.10.3

### Patch Changes

- Updated dependencies

## 0.10.2

### Patch Changes

- Updated dependencies

## 0.10.1

### Patch Changes

- Updated dependencies

## 0.10.0

### Minor Changes

- [#30953](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/30953)
  [`90901f5bbe0`](https://bitbucket.org/atlassian/atlassian-frontend/commits/90901f5bbe0) - Replace
  default entry point of `undefined` with `{}`.

  > **NOTE:** Importing from the default entry point isn't supported. _Please use individual entry
  > points in order to always obtain minimum kbs._

### Patch Changes

- Updated dependencies

## 0.9.1

### Patch Changes

- Updated dependencies

## 0.9.0

### Minor Changes

- [#29945](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/29945)
  [`fe6772a3719`](https://bitbucket.org/atlassian/atlassian-frontend/commits/fe6772a3719) - Dramatic
  update to **experimental** tree-item outputs. These outputs should only be used right now by
  Confluence Page Tree. Changes are being communicated face to face with Confluence team members

### Patch Changes

- Updated dependencies

## 0.8.2

### Patch Changes

- Updated dependencies

## 0.8.1

### Patch Changes

- Updated dependencies

## 0.8.0

### Minor Changes

- [#29562](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/29562)
  [`2112070b91a`](https://bitbucket.org/atlassian/atlassian-frontend/commits/2112070b91a) - We have
  changed the API for our _experimental_ tree drop indicator. Consumers should not be using the
  _experimental_ tree drop indicator in production before speaking with the Design System team.

  This change makes the tree item drop indicator API and usage consistent with our stable box drop
  indicator

  ```diff
  + // The import path to the tree item drop indicator has changed
  - import { DropIndicator } from '@atlaskit/drag-and-drop-indicator/tree';
  + import { DropIndicator } from '@atlaskit/drag-and-drop-indicator/tree-item';

  - // Render prop API with className as public API
  - <DropIndicator edge={edge}>({className}) => <div className={className} />
  + // Conditional rendering of an element
  + <div style={{position: 'relative'}}>{edge ? <DropIndicator edge={edge} /></div>}
  ```

  The `hasTerminal` prop has also been removed from the tree drop indicator as for trees the current
  design is that all lines have a terminal on them.

## 0.7.4

### Patch Changes

- Updated dependencies

## 0.7.3

### Patch Changes

- [#28324](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/28324)
  [`6455cf006b3`](https://bitbucket.org/atlassian/atlassian-frontend/commits/6455cf006b3) - Builds
  for this package now pass through a tokens babel plugin, removing runtime invocations of the
  tokens() function and improving performance.

## 0.7.2

### Patch Changes

- Updated dependencies

## 0.7.1

### Patch Changes

- Updated dependencies

## 0.7.0

### Minor Changes

- [#27976](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/27976)
  [`ace261c5753`](https://bitbucket.org/atlassian/atlassian-frontend/commits/ace261c5753) - For the
  experimental tree drop indicator, we have changed the `gap` and `inset` from `number` to `string`
  to align with our `Box` line indicator.

  Note: consumers should not be using the _experimental_ tree drop indicator in production. We are
  exposing this work in progress component for internal experimentation purposes.

## 0.6.2

### Patch Changes

- Updated dependencies

## 0.6.1

### Patch Changes

- Updated dependencies

## 0.6.0

### Minor Changes

- [#26749](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/26749)
  [`9066b866ed1`](https://bitbucket.org/atlassian/atlassian-frontend/commits/9066b866ed1) - The
  `edge` prop on the box drop indicator `@atlaskit/drag-and-drop-indicator/box` was _previously_
  **optional** and is _now_ **required**.

  For the fastest possible applications, it is important that `<DropIndicator>` is only doing work
  when it needs to. Making `edge` **required** forces consumers to only render the `<DropIndicator>`
  when it is actually doing something. We are using the type system to ensure the fastest possible
  usage

  ```diff
  - <DropIndicator edge={closestEdge} />
  + { closestEdge && <DropIndicator edge={closestEdge} /> }
  ```

## 0.5.2

### Patch Changes

- Updated dependencies

## 0.5.1

### Patch Changes

- [#24874](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/24874)
  [`8cc2f888c83`](https://bitbucket.org/atlassian/atlassian-frontend/commits/8cc2f888c83) - Upgrade
  Typescript from `4.3.5` to `4.5.5`

## 0.5.0

### Minor Changes

- [#25485](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/25485)
  [`5b37b07dc94`](https://bitbucket.org/atlassian/atlassian-frontend/commits/5b37b07dc94) - Moving
  from `@emotion/core@10` to `@emotion/react@11` to line up `@emotion` usage with the rest of the
  Design System

## 0.4.2

### Patch Changes

- Updated dependencies

## 0.4.1

### Patch Changes

- Updated dependencies

## 0.4.0

### Minor Changes

- [#24920](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/24920)
  [`01232de241c`](https://bitbucket.org/atlassian/atlassian-frontend/commits/01232de241c) - The
  `gap` prop now takes a CSS string instead of a number.

## 0.3.0

### Minor Changes

- [#25007](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/25007)
  [`17950433a70`](https://bitbucket.org/atlassian/atlassian-frontend/commits/17950433a70) - Touching
  package to release re-release previous version. The previous (now deprecated) version did not have
  it's entry points built correctly

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
  [`e26c936c610`](https://bitbucket.org/atlassian/atlassian-frontend/commits/e26c936c610) - We have
  improved our naming consistency across our drag and drop packages.
  - The exports from `@atlaskit/drag-and-drop-indicator` have now been shifted over to
    `@atlaskit/drag-and-drop-indicator/box`. `@atlaskit/drag-and-drop-indicator` will no longer be
    useable from the root entry point

  ```diff
  - import { DropIndicator } from '@atlaskit/drag-and-drop-indicator';
  + import { DropIndicator } from '@atlaskit/drag-and-drop-indicator/box';
  ```

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
