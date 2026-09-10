import { wb, type WorkbenchExample } from '@atlassian/workbench';

import VerticalListExample from './00-vertical-list';
import BoardVrExample from './01-board.vr.ap';
import ReactWindowVrExample from './02-react-window.vr.ap';
import ReactVirtualizedVrExample from './03-react-virtualized.vr.ap';
import MultiContextExample from './04-multi-context';
import ScrollContainerVrExample from './05-scroll-container.vr.ap';

export const VerticalList: WorkbenchExample = wb(VerticalListExample);
export const BoardVr: WorkbenchExample = wb(BoardVrExample);
export const ReactWindowVr: WorkbenchExample = wb(ReactWindowVrExample);
export const ReactVirtualizedVr: WorkbenchExample = wb(ReactVirtualizedVrExample);
export const MultiContext: WorkbenchExample = wb(MultiContextExample);
export const ScrollContainerVr: WorkbenchExample = wb(ScrollContainerVrExample);
