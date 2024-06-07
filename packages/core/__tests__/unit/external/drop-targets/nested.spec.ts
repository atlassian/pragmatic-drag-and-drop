import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../../src/entry-point/combine';
import {
	dropTargetForExternal,
	monitorForExternal,
} from '../../../../src/entry-point/external/adapter';
import { appendToBody, getBubbleOrderedTree, nativeDrag, reset } from '../../_util';

afterEach(reset);

test('nested drop targets should be supported', () => {
	const [B, A] = getBubbleOrderedTree();
	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(A),
		monitorForExternal({
			onDragStart: () => ordered.push('monitor:start'),
			onDropTargetChange: () => ordered.push('monitor:change'),
			onDrag: () => ordered.push('monitor:drag'),
		}),
		dropTargetForExternal({
			element: A,
			onDropTargetChange: () => ordered.push('a:change'),
			onDragEnter: () => ordered.push('a:enter'),
			onDragLeave: () => ordered.push('a:leave'),
			onDrag: () => ordered.push('a:drag'),
		}),
		dropTargetForExternal({
			element: B,
			onDropTargetChange: () => ordered.push('b:change'),
			onDragEnter: () => ordered.push('b:enter'),
			onDragLeave: () => ordered.push('b:leave'),
			onDrag: () => ordered.push('b:drag'),
		}),
	);

	nativeDrag.startExternal({
		items: [{ type: 'text/plain', data: 'Hello world' }],
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
