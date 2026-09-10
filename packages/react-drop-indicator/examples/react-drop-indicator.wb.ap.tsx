import { wb, type WorkbenchExample } from '@atlassian/workbench';

import ClosestEdgeVrExample from './00-closest-edge.vr.ap';
import GapVrExample from './01-gap.vr.ap';
import LineVrExample from './line.vr.ap';
import OutlineVrExample from './outline.vr.ap';

export const ClosestEdgeVr: WorkbenchExample = wb(ClosestEdgeVrExample);
export const GapVr: WorkbenchExample = wb(GapVrExample);
export const LineVr: WorkbenchExample = wb(LineVrExample);
export const OutlineVr: WorkbenchExample = wb(OutlineVrExample);
