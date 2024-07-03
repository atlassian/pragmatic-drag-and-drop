import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../src/entry-point/combine';
import { draggable, dropTargetForElements } from '../../../src/entry-point/element/adapter';
import { getElementFromPointWithoutHoneypot } from '../../../src/entry-point/private/get-element-from-point-without-honey-pot';
import {
	appendToBody,
	firePointer,
	getBubbleOrderedPath,
	getElements,
	reset,
	setElementFromPointWithPath,
} from '../_util';

import { findHoneyPot, getHoneyPot } from './_util';

afterEach(reset);

it('should return the second top most item if the top item is the honey pot', () => {
	const [element] = getElements('div');
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(element),
		dropTargetForElements({
			element,
			onGenerateDragPreview: () => ordered.push('dropTarget:preview'),
			onDragStart: () => ordered.push('dropTarget:start'),
			onDragEnter: () => ordered.push('dropTarget:enter'),
			onDragLeave: () => ordered.push('dropTarget:leave'),
			onDrop: () => ordered.push('dropTarget:drop'),
		}),
		draggable({
			element,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
			onDragStart: () => ordered.push('draggable:start'),
			onDropTargetChange: () => ordered.push('draggable:change'),
			onDrop: () => ordered.push('draggable:drop'),
		}),
	);

	firePointer.down(element, { clientX: 1, clientY: 1 });
	firePointer.move(element, { clientX: 2, clientY: 2 });
	fireEvent.dragStart(element);
	// being accurate
	firePointer.cancel(element, { clientX: 0, clientY: 0 });

	expect(findHoneyPot()).toBeFalsy();
	expect(ordered).toEqual(['draggable:preview', 'dropTarget:preview']);
	ordered.length = 0;

	// @ts-expect-error
	requestAnimationFrame.step();
	expect(ordered).toEqual(['draggable:start', 'dropTarget:start']);

	const honeyPot = getHoneyPot();

	const path = getBubbleOrderedPath([honeyPot, element]);
	setElementFromPointWithPath(getBubbleOrderedPath([honeyPot, element]));

	// actual test
	expect(getElementFromPointWithoutHoneypot({ x: 2, y: 2 })).toBe(element);
	// Enabling direct usage of `elementsFromPoint`
	// eslint-disable-next-line no-restricted-syntax
	expect(document.elementsFromPoint(2, 2)).toEqual(path);
	// Enabling direct usage of `elementFromPoint`
	// eslint-disable-next-line no-restricted-syntax
	expect(document.elementFromPoint(2, 2)).toBe(honeyPot);

	cleanup();
});
