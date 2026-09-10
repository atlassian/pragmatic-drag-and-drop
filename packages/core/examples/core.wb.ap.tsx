import { wb, type WorkbenchExample } from '@atlassian/workbench';

import DragPreviewWithTransparencyExample from './drag-preview-with-transparency';
import ElementAdapterExample from './element-adapter';
import FileExample from './file';
import IframeExample from './iframe';
import NativeExample from './native';
import PostDropBugFixExample from './post-drop-bug-fix';
import PostDropBugFixSimpleExample from './post-drop-bug-fix-simple';
import PreserveOffsetOnSourceExample from './preserve-offset-on-source';
import ScrollJustEnoughIntoViewExample from './scroll-just-enough-into-view';
import StickinessExample from './stickiness';
import TextSelectionExample from './text-selection';
import UrlExample from './url';

export const DragPreviewWithTransparency: WorkbenchExample = wb(DragPreviewWithTransparencyExample);
export const ElementAdapter: WorkbenchExample = wb(ElementAdapterExample);
export const File: WorkbenchExample = wb(FileExample);
export const Iframe: WorkbenchExample = wb(IframeExample);
export const Native: WorkbenchExample = wb(NativeExample);
export const PostDropBugFix: WorkbenchExample = wb(PostDropBugFixExample);
export const PostDropBugFixSimple: WorkbenchExample = wb(PostDropBugFixSimpleExample);
export const PreserveOffsetOnSource: WorkbenchExample = wb(PreserveOffsetOnSourceExample);
export const ScrollJustEnoughIntoView: WorkbenchExample = wb(ScrollJustEnoughIntoViewExample);
export const Stickiness: WorkbenchExample = wb(StickinessExample);
export const TextSelection: WorkbenchExample = wb(TextSelectionExample);
export const Url: WorkbenchExample = wb(UrlExample);
