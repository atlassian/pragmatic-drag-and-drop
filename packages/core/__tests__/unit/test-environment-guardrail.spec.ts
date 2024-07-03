import { combine } from '../../src/entry-point/combine';
import { draggable } from '../../src/entry-point/element/adapter';
import { monitorForExternal } from '../../src/entry-point/external/adapter';
import { monitorForTextSelection } from '../../src/entry-point/text-selection/adapter';

import { appendToBody, getElements, nativeDrag, reset, userEvent } from './_util';

const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

beforeEach(() => {
	warn.mockClear();
	reset();
});

it('should warn if a drag event is not setup correctly [element adapter]', () => {
	const [A] = getElements('div');
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: A,
			onGenerateDragPreview() {
				ordered.push('element:preview');
			},
			onDragStart() {
				ordered.push('element:start');
			},
		}),
	);
	expect(warn).not.toHaveBeenCalled();

	// Not using the DragEvent constructor
	A.dispatchEvent(new Event('dragstart', { cancelable: true, bubbles: true }));

	expect(warn).toHaveBeenCalled();
	// drag did not start
	expect(ordered).toEqual([]);

	// validating setup
	warn.mockClear();

	userEvent.lift(A);
	expect(ordered).toEqual(['element:preview', 'element:start']);
	expect(warn).not.toHaveBeenCalled();

	cleanup();
});

it('should warn if a drag event is not setup correctly [external adapter]', () => {
	const ordered: string[] = [];
	const cleanup = combine(
		monitorForExternal({
			onDragStart() {
				ordered.push('external:start');
			},
		}),
	);
	expect(warn).not.toHaveBeenCalled();

	// Not using the DragEvent constructor
	document.body.dispatchEvent(new Event('dragenter', { cancelable: true, bubbles: true }));

	expect(warn).toHaveBeenCalled();
	// drag did not start
	expect(ordered).toEqual([]);

	// validating setup
	warn.mockClear();

	nativeDrag.startExternal({
		items: [{ type: 'text/html', data: 'hello there' }],
	});

	expect(ordered).toEqual(['external:start']);
	expect(warn).not.toHaveBeenCalled();

	cleanup();
});

it('should warn if a drag event is not setup correctly [text selection adapter]', () => {
	const [paragraph] = getElements('p');
	paragraph.textContent = 'Hello';
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(paragraph),
		monitorForTextSelection({
			onDragStart() {
				ordered.push('text-selection:start');
			},
		}),
	);
	expect(warn).not.toHaveBeenCalled();

	// Not using the DragEvent constructor
	paragraph.dispatchEvent(new Event('dragstart', { cancelable: true, bubbles: true }));

	expect(warn).toHaveBeenCalled();
	// drag did not start
	expect(ordered).toEqual([]);

	// validating setup
	warn.mockClear();

	nativeDrag.startTextSelectionDrag({ element: paragraph });

	expect(ordered).toEqual(['text-selection:start']);
	expect(warn).not.toHaveBeenCalled();

	cleanup();
});
