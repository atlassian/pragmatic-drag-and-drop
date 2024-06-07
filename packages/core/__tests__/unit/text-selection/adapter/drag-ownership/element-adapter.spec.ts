import { combine } from '../../../../../src/entry-point/combine';
import { draggable, monitorForElements } from '../../../../../src/entry-point/element/adapter';
import { monitorForTextSelection } from '../../../../../src/entry-point/text-selection/adapter';
import { appendToBody, getBubbleOrderedTree, nativeDrag, reset } from '../../../_util';

afterEach(reset);

test('a text selection drag should not trigger the element adapter', () => {
	const [element] = getBubbleOrderedTree();
	element.textContent = 'Hello world';
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(element),
		draggable({
			element,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
		}),
		monitorForElements({
			onGenerateDragPreview: () => ordered.push('element-monitor:preview'),
		}),
		monitorForTextSelection({
			onDragStart: () => ordered.push('text-monitor:preview'),
		}),
	);

	nativeDrag.startTextSelectionDrag({ element });

	expect(ordered).toEqual(['text-monitor:preview']);

	cleanup();
});
