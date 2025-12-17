# @atlaskit/pragmatic-drag-and-drop-react-accessibility

## 2.1.7

### Patch Changes

- [`d14ea5f60b689`](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/commits/d14ea5f60b689) -
  chore: migrate platform UI & component libraries icon imports from migration paths to core

## 2.1.6

### Patch Changes

- Updated dependencies

## 2.1.5

### Patch Changes

- Updated dependencies

## 2.1.4

### Patch Changes

- Updated dependencies

## 2.1.3

### Patch Changes

- Updated dependencies

## 2.1.2

### Patch Changes

- Updated dependencies

## 2.1.1

### Patch Changes

- [`806cfe1c4e6b7`](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/commits/806cfe1c4e6b7) -
  Internal changes to how border radius is applied.

## 2.1.0

### Minor Changes

- [`3136f686a1929`](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/commits/3136f686a1929) -
  Updating `DragHandleButton` to use our new `DragHandleVerticalIcon`.

  Deprecating `DragHandleButtonSmall`.

  Rationale:
  - `DragHandleButtonSmall` uses a tiny icon size that is no longer supported by our icon system
    (the smallest icon size is now `12px` x `12px`)
  - Icons smaller than `12px` x `12px` are not good for visibility and accessibility
  - The small hitbox of `DragHandleButtonSmall` (`8px` x `16px`) is below our `24px` x `24px`
    minimum hit target size for accessibility.
    [More details](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

### Patch Changes

- Updated dependencies

## 2.0.8

### Patch Changes

- Updated dependencies

## 2.0.7

### Patch Changes

- Updated dependencies

## 2.0.6

### Patch Changes

- Updated dependencies

## 2.0.5

### Patch Changes

- Updated dependencies

## 2.0.4

### Patch Changes

- Updated dependencies

## 2.0.3

### Patch Changes

- [#125534](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/pull-requests/125534)
  [`f135a8d1066c9`](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/commits/f135a8d1066c9) -
  Updates the `react` peer dependency range to include React 19. While we expect these packages to
  work with React 19, we do not test against and there is a small risk of issues. If you have any
  problems, please raise an issue on [Github](https://github.com/atlassian/pragmatic-drag-and-drop).

## 2.0.2

### Patch Changes

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

## 1.3.1

### Patch Changes

- Updated dependencies

## 1.3.0

### Minor Changes

- [#109060](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/109060)
  [`4660ec858a305`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/4660ec858a305) -
  Update `React` from v16 to v18

### Patch Changes

- Updated dependencies

## 1.2.4

### Patch Changes

- Updated dependencies

## 1.2.3

### Patch Changes

- Updated dependencies

## 1.2.2

### Patch Changes

- Updated dependencies

## 1.2.1

### Patch Changes

- Updated dependencies

## 1.2.0

### Minor Changes

- [#150481](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/150481)
  [`e750fb3633f6e`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/e750fb3633f6e) -
  [ux] Enable new icons behind a feature flag.

## 1.1.13

### Patch Changes

- Updated dependencies

## 1.1.12

### Patch Changes

- [#134886](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/134886)
  [`d477c8582713a`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/d477c8582713a) -
  We are updating drag icon as part of visual refresh behind a feature gate.

## 1.1.11

### Patch Changes

- Updated dependencies

## 1.1.10

### Patch Changes

- [#124164](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/124164)
  [`58941fa1d332a`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/58941fa1d332a) -
  All `react` unit tests will now run against `react@16` and `react@18` on CI.

## 1.1.9

### Patch Changes

- Updated dependencies

## 1.1.8

### Patch Changes

- Updated dependencies

## 1.1.7

### Patch Changes

- Updated dependencies

## 1.1.6

### Patch Changes

- Updated dependencies

## 1.1.5

### Patch Changes

- Updated dependencies

## 1.1.4

### Patch Changes

- [#107125](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/107125)
  [`bba5df29ef98`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/bba5df29ef98) -
  ts-ignore css prop error to unblock local consumption in jira

## 1.1.3

### Patch Changes

- [#106643](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/106643)
  [`66e90d5874ad`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/66e90d5874ad) -
  Shifting icon color from `'color.icon.subtle'` (`Neutral700`) to `'color.text'` (`Neutral1000`) to
  match standard icon button appearance and for improved accessibility.

## 1.1.2

### Patch Changes

- Updated dependencies

## 1.1.1

### Patch Changes

- [#88354](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/88354)
  [`4c87d9b4f0c2`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/4c87d9b4f0c2) -
  The internal composition of this component has changed. There is no expected change in behavior.

## 1.1.0

### Minor Changes

- [#87853](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/87853)
  [`54e884fd8d96`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/54e884fd8d96) -
  Increasing `react` `peerDependency` range to include `react@17` and `react@18`.

## 1.0.7

### Patch Changes

- [#84398](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/84398)
  [`77694db987fc`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/77694db987fc) -
  Public release of Pragmatic drag and drop documentation

## 1.0.6

### Patch Changes

- [#84250](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/84250)
  [`a1cc31800621`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/a1cc31800621) -
  Internal refactor: now relying on automatic fallback insertion for `token()`. This change provides
  an improved experience for consumers who don't have Atlassian Design tokens enabled.

## 1.0.5

### Patch Changes

- [#83702](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/83702)
  [`4d9e25ab4eaa`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/4d9e25ab4eaa) -
  Updating the descriptions of Pragmatic drag and drop packages, so they each provide a consistent
  description to various consumers, and so they are consistently formed amongst each other.
  - `package.json` `description`
  - `README.md`
  - Website documentation

## 1.0.4

### Patch Changes

- [#83116](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/83116)
  [`8d4e99057fe0`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/8d4e99057fe0) -
  Upgrade Typescript from `4.9.5` to `5.4.2`

## 1.0.3

### Patch Changes

- Updated dependencies

## 1.0.2

### Patch Changes

- Updated dependencies

## 1.0.1

### Patch Changes

- Updated dependencies

## 1.0.0

### Major Changes

- [#70616](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/70616)
  [`42e57ea65fee`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/42e57ea65fee) -
  This is our first `major` release (`1.0`) for all Pragmatic drag and drop packages.

  For a detailed explanation of these changes, and how to upgrade (automatically) to `1.0` please
  see our
  [1.0 upgrade guide](http://atlassian.design/components/pragmatic-drag-and-drop/core-package/upgrade-guides/upgrade-guide-for-1.0)

## 0.5.1

### Patch Changes

- Updated dependencies

## 0.5.0

### Minor Changes

- [#59748](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/59748)
  [`70d293a2f8b8`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/70d293a2f8b8) -
  Removed the `DragHandleDropdownMenu` and `DragHandleDropdownMenuSmall` exports. Composition with
  `DropdownMenu` should be used instead.

  This decision was made to avoid the risk of mismatched versions of `@atlaskit/dropdown-menu`,
  which could occur when this package was bringing in a different version to the main one installed.
  It is also preferable to encourage composition, which allows for greater flexibility and control
  for consumers.

  **Before**

  ```tsx
  import { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
  import { DragHandleDropdownMenu } from '@atlaskit/pragmatic-drag-and-drop-react-accessibility/drag-handle-dropdown-menu';

  function MyComponent() {
  	const myRef = useRef<HTMLButtonElement>(null);
  	return (
  		<DragHandleDropdownMenu triggerRef={myRef} label="Reorder">
  			<DropdownItemGroup>
  				<DropdownItem>Move up</DropdownItem>
  				<DropdownItem>Move down</DropdownItem>
  			</DropdownItemGroup>
  		</DragHandleDropdownMenu>
  	);
  }
  ```

  **After**

  ```tsx
  import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
  import mergeRefs from '@atlaskit/ds-lib/merge-refs';
  import { DragHandleButton } from '@atlaskit/pragmatic-drag-and-drop-react-accessibility/drag-handle-button';

  function MyComponent() {
  	const myRef = useRef<HTMLButtonElement>(null);
  	return (
  		<DropdownMenu
  			trigger={({ triggerRef, ...triggerProps }) => (
  				<DragHandleButton
  					ref={mergeRefs([myRef, triggerRef])}
  					{...triggerProps}
  					label="Reorder"
  				/>
  			)}
  		>
  			<DropdownItemGroup>
  				<DropdownItem>Move up</DropdownItem>
  				<DropdownItem>Move down</DropdownItem>
  			</DropdownItemGroup>
  		</DropdownMenu>
  	);
  }
  ```

## 0.4.1

### Patch Changes

- Updated dependencies

## 0.4.0

### Minor Changes

- [#41296](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/41296)
  [`3e479ba1a4a`](https://bitbucket.org/atlassian/atlassian-frontend/commits/3e479ba1a4a) - [ux] The
  drag handle icon now uses the `color.icon.subtle` token.
- [#41296](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/41296)
  [`ac64412c674`](https://bitbucket.org/atlassian/atlassian-frontend/commits/ac64412c674) -
  Introduced small variants of the drag handle button and drag handle dropdown menu.

  These are intended for existing experiences with little space available to introduce a drag
  handle. They are not recommended for general use.

  These small variants can be accessed through the `/drag-handle-button-small` and
  `/drag-handle-dropdown-menu-small` entrypoints.

### Patch Changes

- Updated dependencies

## 0.3.1

### Patch Changes

- Updated dependencies

## 0.3.0

### Minor Changes

- [#38144](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/38144)
  [`ee9aa9b7300`](https://bitbucket.org/atlassian/atlassian-frontend/commits/ee9aa9b7300) - [ux] The
  button now has `display: flex`

## 0.2.0

### Minor Changes

- [#38115](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/38115)
  [`ffb3e727aaf`](https://bitbucket.org/atlassian/atlassian-frontend/commits/ffb3e727aaf) - The
  `type` of the `DragHandleButton` now defaults to `'button'` (instead of `'submit'`)
- [`9f5b56f5677`](https://bitbucket.org/atlassian/atlassian-frontend/commits/9f5b56f5677) - The
  `DragHandleButton` props now extend `ButtonHTMLAttributes` (instead of just `HTMLAttributes`)
