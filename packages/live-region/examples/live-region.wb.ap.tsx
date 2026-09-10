import { wb, type WorkbenchExample } from '@atlassian/workbench';

import BasicVrExample from './00-basic.vr.ap';
import ListWithInlineButtonsExample from './01-list-with-inline-buttons';

export const BasicVr: WorkbenchExample = wb(BasicVrExample);
export const ListWithInlineButtons: WorkbenchExample = wb(ListWithInlineButtonsExample);
