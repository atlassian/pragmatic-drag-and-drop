import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../../src/entry-point/combine';
import { draggable, dropTargetForElements } from '../../../../src/entry-point/element/adapter';
import { appendToBody, getBubbleOrderedTree, getElements, reset, userEvent } from '../../_util';

afterEach(reset);

test('[A(sticky)] -> [] = [A]', () => {
	const [draggableEl, A] = getBubbleOrderedTree();
	A.id = 'A';
	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: draggableEl,
			onDragStart: () => ordered.push('draggable:start'),
			onDropTargetChange: () => ordered.push('draggable:update'),
		}),
		dropTargetForElements({
			element: A,
			getIsSticky: () => true,
			onDragStart: () => ordered.push('a:start'),
			onDropTargetChange: () => ordered.push('a:update'),
			onDragLeave: () => ordered.push('a:leave'),
			onDragEnter: () => ordered.push('a:enter'),
		}),
	);

	userEvent.lift(draggableEl);
	expect(ordered).toEqual(['draggable:start', 'a:start']);
	ordered.length = 0;

	fireEvent.dragEnter(document.body);

	// no 'leave' events fired
	expect(ordered).toEqual([]);

	cleanup();
});

test('[B(sticky), A(sticky)] -> [] = [B, A]', () => {
	const [draggableEl, B, A] = getBubbleOrderedTree();
	A.id = 'A';
	B.id = 'B';
	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: draggableEl,
			onDragStart: () => ordered.push('draggable:start'),
			onDropTargetChange: () => ordered.push('draggable:update'),
		}),
		dropTargetForElements({
			element: A,
			getIsSticky: () => true,
			onDragStart: () => ordered.push('a:start'),
			onDropTargetChange: () => ordered.push('a:update'),
			onDragLeave: () => ordered.push('a:leave'),
			onDragEnter: () => ordered.push('a:enter'),
		}),
		dropTargetForElements({
			element: B,
			getIsSticky: () => true,
			onDragStart: () => ordered.push('b:start'),
			onDropTargetChange: () => ordered.push('b:update'),
			onDragLeave: () => ordered.push('b:leave'),
			onDragEnter: () => ordered.push('b:enter'),
		}),
	);

	userEvent.lift(draggableEl);
	expect(ordered).toEqual(['draggable:start', 'b:start', 'a:start']);
	ordered.length = 0;

	fireEvent.dragEnter(document.body);

	expect(ordered).toEqual([]);

	cleanup();
});

test('[C, B(sticky), A(sticky)] -> [] = [B, A]', () => {
	const [draggableEl, C, B, A] = getBubbleOrderedTree();
	A.id = 'A';
	B.id = 'B';
	C.id = 'C';
	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: draggableEl,
			onDragStart: () => ordered.push('draggable:start'),
			onDropTargetChange: () => ordered.push('draggable:update'),
		}),
		dropTargetForElements({
			element: A,
			getIsSticky: () => true,
			onDragStart: () => ordered.push('a:start'),
			onDropTargetChange: () => ordered.push('a:update'),
			onDragLeave: () => ordered.push('a:leave'),
			onDragEnter: () => ordered.push('a:enter'),
		}),
		dropTargetForElements({
			element: B,
			getIsSticky: () => true,
			onDragStart: () => ordered.push('b:start'),
			onDropTargetChange: () => ordered.push('b:update'),
			onDragLeave: () => ordered.push('b:leave'),
			onDragEnter: () => ordered.push('b:enter'),
		}),
		dropTargetForElements({
			element: C,
			getIsSticky: () => false,
			onDragStart: () => ordered.push('c:start'),
			onDropTargetChange: () => ordered.push('c:update'),
			onDragLeave: () => ordered.push('c:leave'),
			onDragEnter: () => ordered.push('c:enter'),
		}),
	);

	userEvent.lift(draggableEl);
	expect(ordered).toEqual(['draggable:start', 'c:start', 'b:start', 'a:start']);
	ordered.length = 0;

	fireEvent.dragEnter(document.body);

	expect(ordered).toEqual([
		'draggable:update',
		'c:update',
		'c:leave',
		// not leaving b or a, but letting them know something changed
		'b:update',
		'a:update',
	]);

	cleanup();
});

test('[A(sticky)] -> [B] = [B]', () => {
	const [draggableEl, A] = getBubbleOrderedTree();
	const [B] = getElements('div');
	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(A, B),
		draggable({
			element: draggableEl,
			onDragStart: () => ordered.push('draggable:start'),
			onDropTargetChange: () => ordered.push('draggable:update'),
		}),
		dropTargetForElements({
			element: A,
			getIsSticky: () => true,
			onDragStart: () => ordered.push('a:start'),
			onDropTargetChange: () => ordered.push('a:update'),
			onDragLeave: () => ordered.push('a:leave'),
			onDragEnter: () => ordered.push('a:enter'),
		}),
		dropTargetForElements({
			element: B,
			onDragStart: () => ordered.push('b:start'),
			onDropTargetChange: () => ordered.push('b:update'),
			onDragLeave: () => ordered.push('b:leave'),
			onDragEnter: () => ordered.push('b:enter'),
		}),
	);

	userEvent.lift(draggableEl);
	expect(ordered).toEqual(['draggable:start', 'a:start']);
	ordered.length = 0;

	fireEvent.dragEnter(B);

	expect(ordered).toEqual(['draggable:update', 'a:update', 'a:leave', 'b:update', 'b:enter']);

	cleanup();
});

test('[B(sticky), A] -> [A] = [B, A]', () => {
	const [draggableEl, B, A] = getBubbleOrderedTree();
	A.id = 'A';
	B.id = 'B';
	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: draggableEl,
			onDragStart: () => ordered.push('draggable:start'),
			onDropTargetChange: () => ordered.push('draggable:update'),
		}),
		dropTargetForElements({
			element: A,
			onDragStart: () => ordered.push('a:start'),
			onDropTargetChange: () => ordered.push('a:update'),
			onDragLeave: () => ordered.push('a:leave'),
			onDragEnter: () => ordered.push('a:enter'),
		}),
		dropTargetForElements({
			element: B,
			getIsSticky: () => true,
			onDragStart: () => ordered.push('b:start'),
			onDropTargetChange: () => ordered.push('b:update'),
			onDragLeave: () => ordered.push('b:leave'),
			onDragEnter: () => ordered.push('b:enter'),
		}),
	);

	userEvent.lift(draggableEl);
	expect(ordered).toEqual(['draggable:start', 'b:start', 'a:start']);
	ordered.length = 0;

	fireEvent.dragEnter(A);

	expect(ordered).toEqual([]);

	cleanup();
});

test('[B, A(sticky)] -> [A] = [A]', () => {
	const [draggableEl, B, A] = getBubbleOrderedTree();
	A.id = 'A';
	B.id = 'B';
	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: draggableEl,
			onDragStart: () => ordered.push('draggable:start'),
			onDropTargetChange: () => ordered.push('draggable:update'),
		}),
		dropTargetForElements({
			element: A,
			getIsSticky: () => true,
			onDragStart: () => ordered.push('a:start'),
			onDropTargetChange: () => ordered.push('a:update'),
			onDragLeave: () => ordered.push('a:leave'),
			onDragEnter: () => ordered.push('a:enter'),
		}),
		dropTargetForElements({
			element: B,
			onDragStart: () => ordered.push('b:start'),
			onDropTargetChange: () => ordered.push('b:update'),
			onDragLeave: () => ordered.push('b:leave'),
			onDragEnter: () => ordered.push('b:enter'),
		}),
	);

	userEvent.lift(draggableEl);
	expect(ordered).toEqual(['draggable:start', 'b:start', 'a:start']);
	ordered.length = 0;

	fireEvent.dragEnter(A);

	expect(ordered).toEqual(['draggable:update', 'b:update', 'b:leave', 'a:update']);

	cleanup();
});

test('[B(sticky), A] -> [X] = [X]', () => {
	const [draggableEl, B, A] = getBubbleOrderedTree();
	const [X] = getElements('div');
	A.id = 'A';
	B.id = 'B';
	X.id = 'X';
	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(A, X),
		draggable({
			element: draggableEl,
			onDragStart: () => ordered.push('draggable:start'),
			onDropTargetChange: () => ordered.push('draggable:update'),
		}),
		dropTargetForElements({
			element: A,
			getIsSticky: () => true,
			onDragStart: () => ordered.push('a:start'),
			onDropTargetChange: () => ordered.push('a:update'),
			onDragLeave: () => ordered.push('a:leave'),
			onDragEnter: () => ordered.push('a:enter'),
		}),
		dropTargetForElements({
			element: B,
			getIsSticky: () => true,
			onDragStart: () => ordered.push('b:start'),
			onDropTargetChange: () => ordered.push('b:update'),
			onDragLeave: () => ordered.push('b:leave'),
			onDragEnter: () => ordered.push('b:enter'),
		}),
		dropTargetForElements({
			element: X,
			getIsSticky: () => false,
			onDragStart: () => ordered.push('x:start'),
			onDropTargetChange: () => ordered.push('x:update'),
			onDragLeave: () => ordered.push('x:leave'),
			onDragEnter: () => ordered.push('x:enter'),
		}),
	);

	userEvent.lift(draggableEl);
	expect(ordered).toEqual(['draggable:start', 'b:start', 'a:start']);
	ordered.length = 0;

	fireEvent.dragEnter(X);

	expect(ordered).toEqual([
		'draggable:update',
		'b:update',
		'b:leave',
		'a:update',
		'a:leave',
		'x:update',
		'x:enter',
	]);

	cleanup();
});

test('[B(sticky), A] -> [] = []', () => {
	const [draggableEl, B, A] = getBubbleOrderedTree();
	A.id = 'A';
	B.id = 'B';
	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: draggableEl,
			onDragStart: () => ordered.push('draggable:start'),
			onDropTargetChange: () => ordered.push('draggable:update'),
		}),
		dropTargetForElements({
			element: A,
			onDragStart: () => ordered.push('a:start'),
			onDropTargetChange: () => ordered.push('a:update'),
			onDragLeave: () => ordered.push('a:leave'),
			onDragEnter: () => ordered.push('a:enter'),
		}),
		dropTargetForElements({
			element: B,
			getIsSticky: () => true,
			onDragStart: () => ordered.push('b:start'),
			onDropTargetChange: () => ordered.push('b:update'),
			onDragLeave: () => ordered.push('b:leave'),
			onDragEnter: () => ordered.push('b:enter'),
		}),
	);

	userEvent.lift(draggableEl);
	expect(ordered).toEqual(['draggable:start', 'b:start', 'a:start']);
	ordered.length = 0;

	fireEvent.dragEnter(document.body);

	expect(ordered).toEqual(['draggable:update', 'b:update', 'b:leave', 'a:update', 'a:leave']);

	cleanup();
});

test('[B(sticky), A(sticky)] -> [X] = [X]', () => {
	const [draggableEl, B, A] = getBubbleOrderedTree();
	A.id = 'A';
	B.id = 'B';
	const [X] = getElements('div');
	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(A, X),
		draggable({
			element: draggableEl,
			onDragStart: () => ordered.push('draggable:start'),
			onDropTargetChange: () => ordered.push('draggable:update'),
		}),
		dropTargetForElements({
			element: A,
			onDragStart: () => ordered.push('a:start'),
			onDropTargetChange: () => ordered.push('a:update'),
			onDragLeave: () => ordered.push('a:leave'),
			onDragEnter: () => ordered.push('a:enter'),
		}),
		dropTargetForElements({
			element: B,
			getIsSticky: () => true,
			onDragStart: () => ordered.push('b:start'),
			onDropTargetChange: () => ordered.push('b:update'),
			onDragLeave: () => ordered.push('b:leave'),
			onDragEnter: () => ordered.push('b:enter'),
		}),
		dropTargetForElements({
			element: X,
			getIsSticky: () => true,
			onDragStart: () => ordered.push('x:start'),
			onDropTargetChange: () => ordered.push('x:update'),
			onDragLeave: () => ordered.push('x:leave'),
			onDragEnter: () => ordered.push('x:enter'),
		}),
	);

	userEvent.lift(draggableEl);
	expect(ordered).toEqual(['draggable:start', 'b:start', 'a:start']);
	ordered.length = 0;

	fireEvent.dragEnter(X);

	expect(ordered).toEqual([
		'draggable:update',
		'b:update',
		'b:leave',
		'a:update',
		'a:leave',
		'x:update',
		'x:enter',
	]);

	cleanup();
});

it('A(sticky) -> [] (+ A not sticky) => []', () => {
	const [draggableEl, A] = getBubbleOrderedTree();
	const ordered: string[] = [];
	let isASticky: boolean = true;

	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: draggableEl,
			onDragStart: () => ordered.push('draggable:start'),
			onDropTargetChange: () => ordered.push('draggable:update'),
		}),
		dropTargetForElements({
			element: A,
			getIsSticky: () => isASticky,
			onDragStart: () => ordered.push('a:start'),
			onDropTargetChange: () => ordered.push('a:update'),
			onDragLeave: () => ordered.push('a:leave'),
			onDragEnter: () => ordered.push('a:enter'),
		}),
	);

	userEvent.lift(draggableEl);
	expect(ordered).toEqual(['draggable:start', 'a:start']);
	ordered.length = 0;

	// first update: A is no longer sticky
	isASticky = false;
	fireEvent.dragEnter(document.body);
	expect(ordered).toEqual(['draggable:update', 'a:update', 'a:leave']);

	cleanup();
});

it('[B(sticky), A(sticky)] -> [] (+ B not sticky) => [A]', () => {
	const [draggableEl, B, A] = getBubbleOrderedTree();
	A.id = 'A';
	B.id = 'B';
	const ordered: string[] = [];
	let isBSticky: boolean = true;

	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: draggableEl,
			onDragStart: () => ordered.push('draggable:start'),
			onDropTargetChange: () => ordered.push('draggable:update'),
		}),
		dropTargetForElements({
			element: A,
			getIsSticky: () => true,
			onDragStart: () => ordered.push('a:start'),
			onDropTargetChange: () => ordered.push('a:update'),
			onDragLeave: () => ordered.push('a:leave'),
			onDragEnter: () => ordered.push('a:enter'),
		}),
		dropTargetForElements({
			element: B,
			getIsSticky: () => isBSticky,
			onDragStart: () => ordered.push('b:start'),
			onDropTargetChange: () => ordered.push('b:update'),
			onDragLeave: () => ordered.push('b:leave'),
			onDragEnter: () => ordered.push('b:enter'),
		}),
	);

	userEvent.lift(draggableEl);
	expect(ordered).toEqual(['draggable:start', 'b:start', 'a:start']);
	ordered.length = 0;

	// Marking B as no longer sticky
	isBSticky = false;

	fireEvent.dragEnter(document.body);

	expect(ordered).toEqual(['draggable:update', 'b:update', 'b:leave', 'a:update']);

	cleanup();
});

it('[B(sticky), A(sticky)] -> [] (+ A not sticky) => []', () => {
	const [draggableEl, B, A] = getBubbleOrderedTree();
	A.id = 'A';
	B.id = 'B';
	const ordered: string[] = [];
	let isASticky: boolean = true;

	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: draggableEl,
			onDragStart: () => ordered.push('draggable:start'),
			onDropTargetChange: () => ordered.push('draggable:update'),
		}),
		dropTargetForElements({
			element: A,
			getIsSticky: () => isASticky,
			onDragStart: () => ordered.push('a:start'),
			onDropTargetChange: () => ordered.push('a:update'),
			onDragLeave: () => ordered.push('a:leave'),
			onDragEnter: () => ordered.push('a:enter'),
		}),
		dropTargetForElements({
			element: B,
			getIsSticky: () => true,
			onDragStart: () => ordered.push('b:start'),
			onDropTargetChange: () => ordered.push('b:update'),
			onDragLeave: () => ordered.push('b:leave'),
			onDragEnter: () => ordered.push('b:enter'),
		}),
	);

	userEvent.lift(draggableEl);
	expect(ordered).toEqual(['draggable:start', 'b:start', 'a:start']);
	ordered.length = 0;

	// Marking A as no longer sticky
	isASticky = false;

	fireEvent.dragEnter(document.body);

	expect(ordered).toEqual(['draggable:update', 'b:update', 'b:leave', 'a:update', 'a:leave']);

	cleanup();
});

it('A(sticky) -> [] (+ A cannot drop) => []', () => {
	const [draggableEl, A] = getBubbleOrderedTree();
	const ordered: string[] = [];
	let canDropOnA: boolean = true;

	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: draggableEl,
			onDragStart: () => ordered.push('draggable:start'),
			onDropTargetChange: () => ordered.push('draggable:update'),
		}),
		dropTargetForElements({
			element: A,
			canDrop: () => canDropOnA,
			getIsSticky: () => true,
			onDragStart: () => ordered.push('a:start'),
			onDropTargetChange: () => ordered.push('a:update'),
			onDragLeave: () => ordered.push('a:leave'),
			onDragEnter: () => ordered.push('a:enter'),
		}),
	);

	userEvent.lift(draggableEl);
	expect(ordered).toEqual(['draggable:start', 'a:start']);
	ordered.length = 0;

	// first update: A can no longer be dropped on
	canDropOnA = false;
	fireEvent.dragEnter(document.body);
	expect(ordered).toEqual(['draggable:update', 'a:update', 'a:leave']);

	cleanup();
});

it('[B(sticky), A(sticky)] -> [] (+ B cannot drop) => [A]', () => {
	const [draggableEl, B, A] = getBubbleOrderedTree();
	A.id = 'A';
	B.id = 'B';
	const ordered: string[] = [];
	let canDropOnB: boolean = true;

	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: draggableEl,
			onDragStart: () => ordered.push('draggable:start'),
			onDropTargetChange: () => ordered.push('draggable:update'),
		}),
		dropTargetForElements({
			element: A,
			getIsSticky: () => true,
			onDragStart: () => ordered.push('a:start'),
			onDropTargetChange: () => ordered.push('a:update'),
			onDragLeave: () => ordered.push('a:leave'),
			onDragEnter: () => ordered.push('a:enter'),
		}),
		dropTargetForElements({
			element: B,
			getIsSticky: () => true,
			canDrop: () => canDropOnB,
			onDragStart: () => ordered.push('b:start'),
			onDropTargetChange: () => ordered.push('b:update'),
			onDragLeave: () => ordered.push('b:leave'),
			onDragEnter: () => ordered.push('b:enter'),
		}),
	);

	userEvent.lift(draggableEl);
	expect(ordered).toEqual(['draggable:start', 'b:start', 'a:start']);
	ordered.length = 0;

	// Can no longer drop on B
	canDropOnB = false;

	fireEvent.dragEnter(document.body);

	expect(ordered).toEqual(['draggable:update', 'b:update', 'b:leave', 'a:update']);

	cleanup();
});

it('[B(sticky), A(sticky)] -> [] (+ A cannot drop) => []', () => {
	const [draggableEl, B, A] = getBubbleOrderedTree();
	A.id = 'A';
	B.id = 'B';
	const ordered: string[] = [];
	let canDropOnA: boolean = true;

	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: draggableEl,
			onDragStart: () => ordered.push('draggable:start'),
			onDropTargetChange: () => ordered.push('draggable:update'),
		}),
		dropTargetForElements({
			element: A,
			getIsSticky: () => true,
			canDrop: () => canDropOnA,
			onDragStart: () => ordered.push('a:start'),
			onDropTargetChange: () => ordered.push('a:update'),
			onDragLeave: () => ordered.push('a:leave'),
			onDragEnter: () => ordered.push('a:enter'),
		}),
		dropTargetForElements({
			element: B,
			getIsSticky: () => true,
			onDragStart: () => ordered.push('b:start'),
			onDropTargetChange: () => ordered.push('b:update'),
			onDragLeave: () => ordered.push('b:leave'),
			onDragEnter: () => ordered.push('b:enter'),
		}),
	);

	userEvent.lift(draggableEl);
	expect(ordered).toEqual(['draggable:start', 'b:start', 'a:start']);
	ordered.length = 0;

	// Can no longer drop on A
	canDropOnA = false;

	fireEvent.dragEnter(document.body);

	expect(ordered).toEqual(['draggable:update', 'b:update', 'b:leave', 'a:update', 'a:leave']);

	cleanup();
});

it('A(sticky) -> [] (+ A unmounted) => []', () => {
	const [draggableEl, A] = getBubbleOrderedTree();
	const ordered: string[] = [];

	const cleanupA = combine(
		appendToBody(A),
		draggable({
			element: draggableEl,
			onDragStart: () => ordered.push('draggable:start'),
			onDropTargetChange: () => ordered.push('draggable:update'),
		}),
	);
	const cleanupDropTarget = dropTargetForElements({
		element: A,
		getIsSticky: () => true,
		onDragStart: () => ordered.push('a:start'),
		onDropTargetChange: () => ordered.push('a:update'),
		onDragLeave: () => ordered.push('a:leave'),
		onDragEnter: () => ordered.push('a:enter'),
	});

	userEvent.lift(draggableEl);
	expect(ordered).toEqual(['draggable:start', 'a:start']);
	ordered.length = 0;

	// A can no longer be dropped on

	cleanupDropTarget();

	// first update: leave A

	fireEvent.dragEnter(document.body);
	expect(ordered).toEqual(['draggable:update']);

	cleanupA();
});

it('[B(sticky), A(sticky)] -> [] (+ B unmounted) => [A]', () => {
	const [draggableEl, B, A] = getBubbleOrderedTree();
	A.id = 'A';
	B.id = 'B';
	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: draggableEl,
			onDragStart: () => ordered.push('draggable:start'),
			onDropTargetChange: () => ordered.push('draggable:update'),
		}),
		dropTargetForElements({
			element: A,
			getIsSticky: () => true,
			onDragStart: () => ordered.push('a:start'),
			onDropTargetChange: () => ordered.push('a:update'),
			onDragLeave: () => ordered.push('a:leave'),
			onDragEnter: () => ordered.push('a:enter'),
		}),
	);
	const cleanupBDropTarget = dropTargetForElements({
		element: B,
		getIsSticky: () => true,
		onDragStart: () => ordered.push('b:start'),
		onDropTargetChange: () => ordered.push('b:update'),
		onDragLeave: () => ordered.push('b:leave'),
		onDragEnter: () => ordered.push('b:enter'),
	});

	userEvent.lift(draggableEl);
	expect(ordered).toEqual(['draggable:start', 'b:start', 'a:start']);
	ordered.length = 0;

	// B is no longer a drop target
	cleanupBDropTarget();

	fireEvent.dragEnter(document.body);

	expect(ordered).toEqual(['draggable:update', 'a:update']);

	cleanup();
});

it('[B(sticky), A(sticky)] -> [] (+ A unmounted) => []', () => {
	const [draggableEl, B, A] = getBubbleOrderedTree();
	A.id = 'A';
	B.id = 'B';
	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: draggableEl,
			onDragStart: () => ordered.push('draggable:start'),
			onDropTargetChange: () => ordered.push('draggable:update'),
		}),
		dropTargetForElements({
			element: B,
			getIsSticky: () => true,
			onDragStart: () => ordered.push('b:start'),
			onDropTargetChange: () => ordered.push('b:update'),
			onDragLeave: () => ordered.push('b:leave'),
			onDragEnter: () => ordered.push('b:enter'),
		}),
	);
	const cleanupDropTargetA = dropTargetForElements({
		element: A,
		getIsSticky: () => true,
		onDragStart: () => ordered.push('a:start'),
		onDropTargetChange: () => ordered.push('a:update'),
		onDragLeave: () => ordered.push('a:leave'),
		onDragEnter: () => ordered.push('a:enter'),
	});

	userEvent.lift(draggableEl);
	expect(ordered).toEqual(['draggable:start', 'b:start', 'a:start']);
	ordered.length = 0;

	// B is no longer a drop target
	cleanupDropTargetA();

	fireEvent.dragEnter(document.body);

	expect(ordered).toEqual(['draggable:update', 'b:update', 'b:leave']);

	cleanup();
});

it('should not recalculate the latest data for sticky records', () => {
	const [draggableEl, A] = getBubbleOrderedTree();
	const ordered: string[] = [];
	let count: number = 0;

	const cleanupA = combine(
		appendToBody(A),
		draggable({
			element: draggableEl,
			onDragStart: () => ordered.push('draggable:start'),
			onDropTargetChange: () => ordered.push('draggable:update'),
		}),
		dropTargetForElements({
			element: A,
			getIsSticky: () => true,
			onDragStart: () => ordered.push('a:start'),
			getData: () => {
				ordered.push(`getData(${count++})`);
				return {};
			},
			onDropTargetChange: () => ordered.push('a:update'),
			onDragLeave: () => ordered.push('a:leave'),
			onDragEnter: () => ordered.push('a:enter'),
		}),
	);

	userEvent.lift(draggableEl);

	expect(ordered).toEqual(['getData(0)', 'draggable:start', 'a:start']);
	ordered.length = 0;

	// first update: leave A

	fireEvent.dragEnter(document.body);
	expect(ordered).toEqual([]);

	cleanupA();
});

it('should ensure drop target record has `isActiveDueToStickiness` set correctly', () => {
	const [draggableEl, A] = getBubbleOrderedTree();
	A.id = 'A';
	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: draggableEl,
			onDragStart: () => ordered.push('draggable:start'),
			onDropTargetChange: () => ordered.push('draggable:update'),
		}),
		dropTargetForElements({
			element: A,
			getIsSticky: () => true,
			onDragStart: (args) =>
				ordered.push(`a:start[isActiveDueToStickiness=${args.self.isActiveDueToStickiness}]`),
			onDropTargetChange: () => ordered.push('a:update'),
			onDrag: (args) =>
				ordered.push(`a:drag[isActiveDueToStickiness=${args.self.isActiveDueToStickiness}]`),
			onDragLeave: () => ordered.push('a:leave'),
			onDragEnter: () => ordered.push('a:enter'),
		}),
	);

	userEvent.lift(draggableEl);
	expect(ordered).toEqual(['draggable:start', 'a:start[isActiveDueToStickiness=false]']);
	ordered.length = 0;

	// leaving A
	fireEvent.dragEnter(document.body);

	// no 'leave' events fired
	expect(ordered).toEqual([]);

	// A drag outside of A
	fireEvent.dragOver(document.body);
	// @ts-ignore
	requestAnimationFrame.step();

	expect(ordered).toEqual(['a:drag[isActiveDueToStickiness=true]']);
	ordered.length = 0;

	// re-entering A
	fireEvent.dragEnter(A);
	// no 'enter' events fired - already in A before due to stickiness
	expect(ordered).toEqual([]);

	// A drag inside of A
	fireEvent.dragOver(A);
	// @ts-ignore
	requestAnimationFrame.step();
	expect(ordered).toEqual(['a:drag[isActiveDueToStickiness=false]']);

	cleanup();
});

it('should collect stickiness when needed', () => {
	const [draggableEl, A] = getBubbleOrderedTree();
	const [B] = getBubbleOrderedTree();
	const ordered: string[] = [];
	const getIsASticky = jest.fn(() => true);

	const cleanup = combine(
		appendToBody(A),
		appendToBody(B),
		draggable({
			element: draggableEl,
			onDragStart: () => ordered.push('draggable:start'),
			onDropTargetChange: () => ordered.push('draggable:update'),
		}),
		dropTargetForElements({
			element: A,
			getIsSticky: getIsASticky,
			onDragStart: () => ordered.push('a:start'),
			onDropTargetChange: () => ordered.push('a:update'),
			onDrag: () => ordered.push('a:drag'),
			onDragLeave: () => ordered.push('a:leave'),
			onDragEnter: () => ordered.push('a:enter'),
		}),
		dropTargetForElements({
			element: B,
			onDragStart: () => ordered.push('b:start'),
			onDropTargetChange: () => ordered.push('b:update'),
			onDrag: () => ordered.push('b:drag'),
			onDragLeave: () => ordered.push('b:leave'),
			onDragEnter: () => ordered.push('b:enter'),
		}),
	);

	userEvent.lift(draggableEl);
	expect(ordered).toEqual(['draggable:start', 'a:start']);
	// no need to check stickiness
	expect(getIsASticky).not.toHaveBeenCalled();
	ordered.length = 0;

	// continuing to drag over A

	fireEvent.dragOver(A);
	// @ts-expect-error
	requestAnimationFrame.step();

	expect(ordered).toEqual(['a:drag']);
	// no need to check stickiness
	expect(getIsASticky).not.toHaveBeenCalled();
	ordered.length = 0;

	// leaving A

	fireEvent.dragEnter(document.body);
	// no 'leave' events fired
	expect(ordered).toEqual([]);
	// stickiness needed to be checked
	expect(getIsASticky).toHaveBeenCalled();
	getIsASticky.mockClear();

	// continuing to be outside of A

	fireEvent.dragOver(document.body);
	// @ts-expect-error
	requestAnimationFrame.step();

	expect(ordered).toEqual(['a:drag']);
	// stickiness needed to be checked again
	expect(getIsASticky).toHaveBeenCalled();
	getIsASticky.mockClear();
	ordered.length = 0;

	// Moving over B

	fireEvent.dragOver(B);
	// already over
	expect(ordered).toEqual(['draggable:update', 'a:update', 'a:leave', 'b:update', 'b:enter']);

	// stickiness for A not needed to be checked again
	expect(getIsASticky).not.toHaveBeenCalled();
	getIsASticky.mockClear();

	cleanup();
});
