# @atlaskit/pragmatic-drag-and-drop-flourish

## 2.0.1

### Patch Changes

- Updated dependencies

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

## 1.2.2

### Patch Changes

- Updated dependencies

## 1.2.1

### Patch Changes

- Updated dependencies

## 1.2.0

### Minor Changes

- [#109060](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/109060)
  [`4660ec858a305`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/4660ec858a305) -
  Update `React` from v16 to v18

### Patch Changes

- Updated dependencies

## 1.1.3

### Patch Changes

- Updated dependencies

## 1.1.2

### Patch Changes

- Updated dependencies

## 1.1.1

### Patch Changes

- [#124164](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/124164)
  [`58941fa1d332a`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/58941fa1d332a) -
  All `react` unit tests will now run against `react@16` and `react@18` on CI.

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
  [`42e57ea65fee`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/42e57ea65fee) -
  This is our first `major` release (`1.0`) for all Pragmatic drag and drop packages.

  For a detailed explanation of these changes, and how to upgrade (automatically) to `1.0` please
  see our
  [1.0 upgrade guide](http://atlassian.design/components/pragmatic-drag-and-drop/core-package/upgrade-guides/upgrade-guide-for-1.0)

## 0.2.0

### Minor Changes

- [#40255](https://bitbucket.org/atlassian/atlassian-frontend/pull-requests/40255)
  [`6775eeedcb4`](https://bitbucket.org/atlassian/atlassian-frontend/commits/6775eeedcb4) - [ux]
  Increased the duration of the post drop flash animation, as a result of design review.
