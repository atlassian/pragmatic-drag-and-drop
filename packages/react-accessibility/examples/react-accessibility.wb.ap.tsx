import { wb, type WorkbenchExample } from '@atlassian/workbench';

import DragHandleButtonSmallVrExample from './drag-handle-button-small.vr.ap';
import DragHandleButtonVrExample from './drag-handle-button.vr.ap';
import DragHandleDropdownMenuExample from './drag-handle-dropdown-menu';

export const DragHandleButtonSmallVr: WorkbenchExample = wb(DragHandleButtonSmallVrExample);
export const DragHandleButtonVr: WorkbenchExample = wb(DragHandleButtonVrExample);
export const DragHandleDropdownMenu: WorkbenchExample = wb(DragHandleDropdownMenuExample);
