import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../../src/entry-point/combine';
import {
	dropTargetForTextSelection,
	monitorForTextSelection,
} from '../../../../src/entry-point/text-selection/adapter';
import { appendToBody, getBubbleOrderedTree, getElements, nativeDrag, reset } from '../../_util';

afterEach(reset);

test('nested drop targets should be supported', () => {
	const [B, A] = getBubbleOrderedTree();
	const [paragraph] = getElements('p');
	paragraph.textContent = 'Hello world';
	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(A),
		appendToBody(paragraph),
		monitorForTextSelection({
			onDragStart: () => ordered.push('monitor:start'),
			onDropTargetChange: () => ordered.push('monitor:change'),
			onDrag: () => ordered.push('monitor:drag'),
		}),
		dropTargetForTextSelection({
			element: A,
			onDragStart: () => ordered.push('a:start'),
			onDropTargetChange: () => ordered.push('a:change'),
			onDragEnter: () => ordered.push('a:enter'),
			onDragLeave: () => ordered.push('a:leave'),
			onDrag: () => ordered.push('a:drag'),
		}),
		dropTargetForTextSelection({
			element: B,
			onDragStart: () => ordered.push('b:start'),
			onDropTargetChange: () => ordered.push('b:change'),
			onDragEnter: () => ordered.push('b:enter'),
			onDragLeave: () => ordered.push('b:leave'),
			onDrag: () => ordered.push('b:drag'),
		}),
	);

	nativeDrag.startTextSelectionDrag({
		element: paragraph,
	});

	expect(ordered).toEqual(['monitor:start']);
	ordered.length = 0;

	fireEvent.dragOver(B);

	expect(ordered).toEqual(['b:change', 'b:enter', 'a:change', 'a:enter', 'monitor:change']);
	ordered.length = 0;

	fireEvent.dragOver(A);

	expect(ordered).toEqual(['b:change', 'b:leave', 'a:change', 'monitor:change']);

	cleanup();
});
