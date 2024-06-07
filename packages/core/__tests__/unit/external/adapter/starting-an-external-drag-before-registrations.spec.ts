import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../../src/entry-point/combine';
import {
	dropTargetForExternal,
	monitorForExternal,
} from '../../../../src/entry-point/external/adapter';
import { type CleanupFn } from '../../../../src/entry-point/types';
import { appendToBody, getElements, nativeDrag, reset } from '../../_util';

afterEach(reset);

it('should notify monitors and drop targets that are mounted during a drag', () => {
	const cleanups: CleanupFn[] = [];
	const ordered: string[] = [];
	const [X, A] = getElements('div');

	cleanups.push(appendToBody(X, A));

	nativeDrag.startExternal({
		items: [{ type: 'text/plain', data: 'hello world' }],
	});

	fireEvent.dragEnter(A);
	expect(ordered).toEqual([]);

	cleanups.push(
		combine(
			dropTargetForExternal({
				element: A,
				onDragEnter: () => ordered.push('A:enter'),
				onDragLeave: () => ordered.push('A:leave'),
			}),
			dropTargetForExternal({
				element: X,
				onDragEnter: () => ordered.push('X:enter'),
				onDragLeave: () => ordered.push('X:leave'),
			}),
			monitorForExternal({
				onDropTargetChange: () => ordered.push('monitor:change'),
			}),
		),
	);
	expect(ordered).toEqual([]);

	// complete a little movement over A
	// now "over A" according to the system
	fireEvent.dragOver(A);
	// @ts-expect-error: raf types
	requestAnimationFrame.step();

	expect(ordered).toEqual(['A:enter', 'monitor:change']);
	ordered.length = 0;

	fireEvent.dragEnter(X);

	expect(ordered).toEqual(['A:leave', 'X:enter', 'monitor:change']);

	cleanups.forEach((fn) => fn());
});
