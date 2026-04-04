import { useDragDropContext } from '../drag-drop-context/internal-context';
import type { StartKeyboardDrag } from '../drag-drop-context/types';

export function useKeyboardContext(): {
	startKeyboardDrag: StartKeyboardDrag;
} {
	const { startKeyboardDrag } = useDragDropContext();
	return { startKeyboardDrag };
}
