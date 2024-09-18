import { combine } from '../../../../src/entry-point/combine';
import { monitorForTextSelection } from '../../../../src/entry-point/text-selection/adapter';
import { appendToBody, getElements, getFirstTextNode, nativeDrag, reset } from '../../_util';

afterEach(reset);

test('standard - use provided text element', () => {
	const [paragraph] = getElements('p');
	paragraph.textContent = 'Text to be dragged';
	const ordered: Text[] = [];

	const cleanup = combine(
		appendToBody(paragraph),
		monitorForTextSelection({
			onDragStart: (args) => ordered.push(args.source.target),
		}),
	);

	nativeDrag.startTextSelectionDrag({
		element: paragraph,
	});

	expect(ordered).toEqual([document.createTextNode('Text to be dragged')]);

	cleanup();
});

it('should not start a drag if there is no text in the drag', () => {
	const [paragraph] = getElements('p');
	paragraph.textContent = 'Text to be dragged';
	const ordered: Text[] = [];

	const cleanup = combine(
		appendToBody(paragraph),
		monitorForTextSelection({
			onDragStart: (args) => ordered.push(args.source.target),
		}),
	);

	const text = getFirstTextNode(paragraph);

	const event = new DragEvent('dragstart', {
		cancelable: true,
		bubbles: true,
	});

	// not adding any text to the drag
	text.dispatchEvent(event);
	// @ts-expect-error
	requestAnimationFrame.step();

	expect(ordered).toEqual([]);

	cleanup();
});
