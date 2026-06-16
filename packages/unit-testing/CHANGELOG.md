# @atlaskit/pragmatic-drag-and-drop-unit-testing

## 2.0.0

### Major Changes

- [`f2dc9097319f0`](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/commits/f2dc9097319f0) - ###
  Dropped support for _legacy_ Typescript 4 types. **Typescript 5 is now the new minimum**.

  Removes the `typesVersions` property and `dist/types-ts4.5` directory from the dist.

  Types are now exclusively via the `"types": "dist/types/index.d.ts"` property.

  ```diff
  - "typesVersions": {
  -    ">=4.5 <4.9": {
  -        "*": [
  -            "dist/types-ts4.5/*",
  -            "dist/types-ts4.5/index.d.ts"
  -        ]
  -    }
  - },
  ```

## 1.1.1

### Patch Changes

- [`098cfbb01dc36`](https://bitbucket.org/atlassian/atlassian-frontend-monorepo/commits/098cfbb01dc36) -
  Add missing npmignore files to remove unnecessary files from published package

## 1.1.0

### Minor Changes

- [#123321](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/123321)
  [`d02023dd064df`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/d02023dd064df) -
  Adding a new polyfill for [`DOMRect`](https://developer.mozilla.org/en-US/docs/Web/API/DOMRect).
  This polyfill helpful for unit testing environments that don't implement `DOMRect`, such as
  `jsdom`.

  ```js
  import '@atlaskit/pragmatic-drag-and-drop/unit-testing/dom-rect-polyfill';
  ```

  Setup using jest:

  ```js
  // jest.config.js
  module.exports = {
  	setupFiles: ['./test/setup-dom-rect.js'],
  };

  // ./test/setup-dom-rect.js
  import '@atlaskit/pragmatic-drag-and-drop/unit-testing/dom-rect-polyfill';
  ```

## 1.0.0

### Major Changes

- [#100243](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/pull-requests/100243)
  [`104425cc2a07`](https://stash.atlassian.com/projects/CONFCLOUD/repos/confluence-frontend/commits/104425cc2a07) -
  Initial release of our unit testing package for Pragmatic drag and drop. This package originally
  only includes a polyfill for
  [DragEvent](https://developer.mozilla.org/en-US/docs/Web/API/DragEvent).
