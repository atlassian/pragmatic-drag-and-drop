/**
 * 🦊🐞
 * When dragging a URL from the Firefox address bar or bookmarks
 * they are currently not adding an entry for "text/uri-list".
 * They add "text/x-moz-url" data which contains the same information
 * in a different format.
 *
 * [Bug report](https://bugzilla.mozilla.org/show_bug.cgi?id=1912164)
 */
export const firefoxURLType = 'text/x-moz-url';
