import { wb, type WorkbenchExample } from '@atlassian/workbench';

import TreeExample from '../tree.vr.ap';

export const Tree: WorkbenchExample<typeof TreeExample> = wb(TreeExample);
