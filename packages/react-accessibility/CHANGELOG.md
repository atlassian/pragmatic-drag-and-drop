# @atlaskit/pragmatic-drag-and-drop-react-accessibility

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
