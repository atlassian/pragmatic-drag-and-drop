import { fireEvent } from '@testing-library/dom';
import invariant from 'tiny-invariant';

import { combine } from '../../../../src/entry-point/combine';
import { draggable, dropTargetForElements } from '../../../../src/entry-point/element/adapter';
import type { DropTargetAllowedDropEffect } from '../../../../src/entry-point/types';
import { appendToBody, getBubbleOrderedTree, getElements, reset } from '../../_util';

afterEach(reset);

test('[] -> none', () => {
	const [draggableEl] = getElements('div');
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(draggableEl),
		draggable({
			element: draggableEl,
			onGenerateDragPreview: () => ordered.push('preview'),
		}),
	);

	const event = new DragEvent('dragstart', { bubbles: true, cancelable: true });
	fireEvent(draggableEl, event);

	expect(ordered).toEqual(['preview']);

	expect(event.dataTransfer?.dropEffect).toEqual('none');

	cleanup();
});

test('[A(default: move)] -> move', () => {
	const [draggableEl, A] = getBubbleOrderedTree();
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: draggableEl,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
		}),
		dropTargetForElements({
			element: A,
			onGenerateDragPreview: () => ordered.push('a:preview'),
		}),
	);

	const event = new DragEvent('dragstart', { bubbles: true, cancelable: true });
	fireEvent(draggableEl, event);

	expect(ordered).toEqual(['draggable:preview', 'a:preview']);

	expect(event.dataTransfer?.dropEffect).toEqual('move');

	cleanup();
});

test('[A(copy)] -> copy', () => {
	const [draggableEl, A] = getBubbleOrderedTree();
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: draggableEl,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
		}),
		dropTargetForElements({
			element: A,
			onGenerateDragPreview: () => ordered.push('a:preview'),
			getDropEffect: () => 'copy',
		}),
	);

	const event = new DragEvent('dragstart', { bubbles: true, cancelable: true });
	fireEvent(draggableEl, event);

	expect(ordered).toEqual(['draggable:preview', 'a:preview']);

	expect(event.dataTransfer?.dropEffect).toEqual('copy');

	cleanup();
});

test('[B(link), A(copy)] -> link', () => {
	const [draggableEl, B, A] = getBubbleOrderedTree();
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: draggableEl,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
		}),
		dropTargetForElements({
			element: A,
			onGenerateDragPreview: () => ordered.push('a:preview'),
			getDropEffect: () => 'copy',
		}),
		dropTargetForElements({
			element: B,
			onGenerateDragPreview: () => ordered.push('b:preview'),
			getDropEffect: () => 'link',
		}),
	);

	const event = new DragEvent('dragstart', { bubbles: true, cancelable: true });
	fireEvent(draggableEl, event);

	expect(ordered).toEqual(['draggable:preview', 'b:preview', 'a:preview']);

	expect(event.dataTransfer?.dropEffect).toEqual('link');

	cleanup();
});

test('[B(default: move), A(copy)] -> move', () => {
	const [draggableEl, B, A] = getBubbleOrderedTree();
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: draggableEl,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
		}),
		dropTargetForElements({
			element: A,
			onGenerateDragPreview: () => ordered.push('a:preview'),
			getDropEffect: () => 'copy',
		}),
		dropTargetForElements({
			element: B,
			onGenerateDragPreview: () => ordered.push('b:preview'),
		}),
	);

	const event = new DragEvent('dragstart', { bubbles: true, cancelable: true });
	fireEvent(draggableEl, event);

	expect(ordered).toEqual(['draggable:preview', 'b:preview', 'a:preview']);

	expect(event.dataTransfer?.dropEffect).toEqual('move');

	cleanup();
});

function getChangingEffects(...effects: DropTargetAllowedDropEffect[]) {
	let index = 0;
	return function getDropEffect(): DropTargetAllowedDropEffect {
		const effect = effects[index];
		invariant(effect, `no effect for index found ${index}`);
		index++;
		return effect;
	};
}

it('[B(link), A(copy)] => C[copy] -> copy', () => {
	const [draggableEl, B, A] = getBubbleOrderedTree();
	const [C] = getElements('div');
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(A, C),
		draggable({
			element: draggableEl,
			onDragStart: () => ordered.push('draggable:start'),
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
			onDropTargetChange: () => ordered.push('draggable:update'),
		}),
		dropTargetForElements({
			element: A,
			onDragStart: () => ordered.push('a:start'),
			onGenerateDragPreview: () => ordered.push('a:preview'),
			getDropEffect: () => 'copy',
			onDropTargetChange: () => ordered.push('a:update'),
			onDragEnter: () => ordered.push('a:enter'),
			onDragLeave: () => ordered.push('a:leave'),
		}),
		dropTargetForElements({
			element: B,
			onDragStart: () => ordered.push('b:start'),
			onGenerateDragPreview: () => ordered.push('b:preview'),
			getDropEffect: getChangingEffects('link', 'copy'),
			onDropTargetChange: () => ordered.push('b:update'),
			onDragEnter: () => ordered.push('b:enter'),
			onDragLeave: () => ordered.push('b:leave'),
		}),
		dropTargetForElements({
			element: C,
			onDragStart: () => ordered.push('c:start'),
			onGenerateDragPreview: () => ordered.push('c:preview'),
			getDropEffect: () => 'copy',
			onDropTargetChange: () => ordered.push('c:update'),
			onDragEnter: () => ordered.push('c:enter'),
			onDragLeave: () => ordered.push('c:leave'),
		}),
	);

	const dragStart = new DragEvent('dragstart', {
		bubbles: true,
		cancelable: true,
	});
	fireEvent(draggableEl, dragStart);

	expect(ordered).toEqual(['draggable:preview', 'b:preview', 'a:preview']);
	ordered.length = 0;

	// initial 'B'
	expect(dragStart.dataTransfer?.dropEffect).toEqual('link');

	// finish lift
	// @ts-ignore
	requestAnimationFrame.step();
	expect(ordered).toEqual(['draggable:start', 'b:start', 'a:start']);
	ordered.length = 0;

	const dragEnter = new DragEvent('dragenter', {
		bubbles: true,
		cancelable: true,
	});
	fireEvent(C, dragEnter);

	// 'C' drop effect
	expect(dragEnter.dataTransfer?.dropEffect).toEqual('copy');

	expect(ordered).toEqual([
		'draggable:update',
		'b:update',
		'b:leave',
		'a:update',
		'a:leave',
		'c:update',
		'c:enter',
	]);

	cleanup();
});

it('[A(copy)] => A[link] -> link', () => {
	const [draggableEl, A] = getBubbleOrderedTree();
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: draggableEl,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
		}),
		dropTargetForElements({
			element: A,
			onGenerateDragPreview: () => ordered.push('a:preview'),
			getDropEffect: getChangingEffects('copy', 'link'),
		}),
	);

	const dragStart = new DragEvent('dragstart', {
		bubbles: true,
		cancelable: true,
	});
	fireEvent(draggableEl, dragStart);

	expect(ordered).toEqual(['draggable:preview', 'a:preview']);

	expect(dragStart.dataTransfer?.dropEffect).toEqual('copy');

	// finish lift
	// @ts-ignore
	requestAnimationFrame.step();

	const dragOver = new DragEvent('dragover', {
		bubbles: true,
		cancelable: true,
	});
	fireEvent(A, dragOver);

	expect(dragOver.dataTransfer?.dropEffect).toEqual('link');

	cleanup();
});

it('[B(link), A(copy)] => [B(copy), A(link)] -> copy', () => {
	const [draggableEl, B, A] = getBubbleOrderedTree();
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: draggableEl,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
		}),
		dropTargetForElements({
			element: A,
			onGenerateDragPreview: () => ordered.push('a:preview'),
			getDropEffect: () => 'move',
		}),
		dropTargetForElements({
			element: B,
			onGenerateDragPreview: () => ordered.push('b:preview'),
			getDropEffect: getChangingEffects('copy', 'link'),
		}),
	);

	const dragStart = new DragEvent('dragstart', {
		bubbles: true,
		cancelable: true,
	});
	fireEvent(draggableEl, dragStart);

	expect(ordered).toEqual(['draggable:preview', 'b:preview', 'a:preview']);

	// initial 'B'
	expect(dragStart.dataTransfer?.dropEffect).toEqual('copy');

	// finish lift
	// @ts-ignore
	requestAnimationFrame.step();

	const dragOver = new DragEvent('dragover', {
		bubbles: true,
		cancelable: true,
	});
	fireEvent(B, dragOver);

	// second 'B' drop effect
	expect(dragOver.dataTransfer?.dropEffect).toEqual('link');

	cleanup();
});

test('[B(default: move), A(copy)] => [B(default: move), A(link)] -> move', () => {
	const [draggableEl, B, A] = getBubbleOrderedTree();
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: draggableEl,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
		}),
		dropTargetForElements({
			element: A,
			onGenerateDragPreview: () => ordered.push('a:preview'),
			getDropEffect: getChangingEffects('copy', 'link'),
		}),
		dropTargetForElements({
			element: B,
			onGenerateDragPreview: () => ordered.push('b:preview'),
		}),
	);

	const event = new DragEvent('dragstart', { bubbles: true, cancelable: true });
	fireEvent(draggableEl, event);

	expect(ordered).toEqual(['draggable:preview', 'b:preview', 'a:preview']);

	expect(event.dataTransfer?.dropEffect).toEqual('move');

	const dragOver = new DragEvent('dragover', {
		bubbles: true,
		cancelable: true,
	});
	fireEvent(draggableEl, dragOver);

	expect(dragOver.dataTransfer?.dropEffect).toEqual('move');

	cleanup();
});

test('A[copy] => "dragover" -> copy', () => {
	const [draggableEl, A] = getBubbleOrderedTree();
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: draggableEl,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
			onDragStart: () => ordered.push('draggable:start'),
			onDropTargetChange: () => ordered.push('draggable:change'),
		}),
		dropTargetForElements({
			element: A,
			onGenerateDragPreview: () => ordered.push('a:preview'),
			onDragStart: () => ordered.push('a:start'),
			onDropTargetChange: () => ordered.push('a:change'),
			getDropEffect: () => 'copy',
		}),
	);

	const dragStart = new DragEvent('dragstart', {
		bubbles: true,
		cancelable: true,
	});
	fireEvent(draggableEl, dragStart);

	expect(dragStart.dataTransfer?.dropEffect).toEqual('copy');

	expect(ordered).toEqual(['draggable:preview', 'a:preview']);
	ordered.length = 0;

	// @ts-expect-error
	requestAnimationFrame.step();

	expect(ordered).toEqual(['draggable:start', 'a:start']);
	ordered.length = 0;

	const dragOver = new DragEvent('dragover', {
		bubbles: true,
		cancelable: true,
	});
	fireEvent(A, dragOver);

	expect(dragOver.dataTransfer?.dropEffect).toEqual('copy');
	expect(ordered).toEqual([]);

	cleanup();
});

test('A[copy] => "drop" -> copy', () => {
	const [draggableEl, A] = getBubbleOrderedTree();
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: draggableEl,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
			onDragStart: () => ordered.push('draggable:start'),
			onDropTargetChange: () => ordered.push('draggable:change'),
			onDrop: () => ordered.push('draggable:drop'),
		}),
		dropTargetForElements({
			element: A,
			onGenerateDragPreview: () => ordered.push('a:preview'),
			onDragStart: () => ordered.push('a:start'),
			onDropTargetChange: () => ordered.push('a:change'),
			onDrop: () => ordered.push('a:drop'),
			getDropEffect: () => 'copy',
		}),
	);

	const dragStart = new DragEvent('dragstart', {
		bubbles: true,
		cancelable: true,
	});
	fireEvent(draggableEl, dragStart);

	expect(dragStart.dataTransfer?.dropEffect).toEqual('copy');

	expect(ordered).toEqual(['draggable:preview', 'a:preview']);
	ordered.length = 0;

	// @ts-expect-error
	requestAnimationFrame.step();

	expect(ordered).toEqual(['draggable:start', 'a:start']);
	ordered.length = 0;

	// dropping on A
	const drop = new DragEvent('drop', {
		bubbles: true,
		cancelable: true,
	});
	fireEvent(A, drop);

	expect(drop.dataTransfer?.dropEffect).toEqual('copy');
	expect(ordered).toEqual(['draggable:drop', 'a:drop']);

	cleanup();
});
