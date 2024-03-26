import { useDragDropContext } from '../drag-drop-context/internal-context';

export function useKeyboardContext() {
  const { startKeyboardDrag } = useDragDropContext();
  return { startKeyboardDrag };
}
