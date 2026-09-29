import { wb, type WorkbenchExample } from '@atlassian/workbench';

import PostDropBugFixSimpleExample from '../post-drop-bug-fix-simple';

export const PostDropBugFixSimple: WorkbenchExample<typeof PostDropBugFixSimpleExample> = wb(
	PostDropBugFixSimpleExample,
);
