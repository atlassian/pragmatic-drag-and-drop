import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../src/entry-point/combine';
import { dropTargetForTextSelection } from '../../../src/entry-point/text-selection/adapter';
import { type Position } from '../../../src/entry-point/types';
import { appendToBody, firePointer, getBubbleOrderedTree, nativeDrag, reset } from '../_util';

import { findHoneyPot, getHoneyPot } from './_util';

// The text adapter behaviour should be exactly the same as the element
// adapter in all the other text files.This test just checks that the
// text adapter is wired up correctly, but doesn't test the full range
// of honey pot behaviors

afterEach(reset);

it('should work between multiple drag operations (success)', () => {
	const [child, parent] = getBubbleOrderedTree('div');
	child.textContent = 'Hello world';
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(parent),
		dropTargetForTextSelection({
			element: parent,
			onDragStart: () => ordered.push('dropTarget:start'),
			onDragEnter: () => ordered.push('dropTarget:enter'),
			onDragLeave: () => ordered.push('dropTarget:leave'),
			onDrop: () => ordered.push('dropTarget:drop'),
		}),
	);

	for (let i = 0; i < 5; i++) {
		const move: Position = {
			x: i + 3,
			y: i + 4,
		};
		firePointer.down(child, { clientX: i + 1, clientY: i + 2 });
		firePointer.move(child, { clientX: move.x, clientY: move.y });

		nativeDrag.startTextSelectionDrag({ element: child });

		expect(findHoneyPot()).toBeTruthy();
		expect(ordered).toEqual(['dropTarget:start']);
		ordered.length = 0;

		fireEvent.drop(parent);

		expect(ordered).toEqual(['dropTarget:drop']);
		const honeyPot = getHoneyPot();
		// pulled back 1px
		expect(honeyPot.style.left).toBe(`${move.x - 1}px`);
		expect(honeyPot.style.top).toBe(`${move.y - 1}px`);
		ordered.length = 0;
	}

	cleanup();
});
