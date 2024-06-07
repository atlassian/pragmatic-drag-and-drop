import { combine } from '../../../src/entry-point/combine';
import {
	draggable,
	dropTargetForElements,
	monitorForElements,
} from '../../../src/entry-point/element/adapter';
import { appendToBody, getBubbleOrderedTree, getElements, reset, userEvent } from '../_util';

afterEach(reset);

test('changing a drop target during a drop', () => {
	const [A] = getElements('div');
	const ordered: string[] = [];
	const removeFromBody = appendToBody(A);
	const cleanupDropTarget1 = dropTargetForElements({
		element: A,
		onDragStart: () => ordered.push('dropTarget1:start'),
		onDrop: () => ordered.push('dropTarget1:drop'),
	});
	const cleanupMonitor = monitorForElements({
		onDragStart: () => ordered.push('monitor:start'),
		onDrop: () => ordered.push('monitor:drop'),
	});
	let cleanupDropTarget2: () => void = () => {};
	const cleanupDraggable = draggable({
		element: A,
		onDragStart: () => ordered.push('draggable:start'),
		onDrop: () => {
			ordered.push('draggable:drop');
			ordered.push('changing drop target');
			cleanupDropTarget1();
			// This new drop target will be treated as the original drop target
			// as they are both created on the same element (the unique key)
			cleanupDropTarget2 = dropTargetForElements({
				element: A,
				onDragStart: () => ordered.push('dropTarget2:start'),
				onDrop: () => ordered.push('dropTarget2:drop'),
			});
		},
	});

	// start drag [A]
	userEvent.lift(A);

	expect(ordered).toEqual(['draggable:start', 'dropTarget1:start', 'monitor:start']);
	ordered.length = 0;

	userEvent.drop(A);

	expect(ordered).toEqual([
		'draggable:drop',
		'changing drop target',
		'dropTarget2:drop',
		'monitor:drop',
	]);

	cleanupDraggable();
	cleanupDropTarget1();
	cleanupDropTarget2();
	cleanupMonitor();
	removeFromBody();
});

test('removing a drop target during a drop', () => {
	const [A] = getElements('div');
	const ordered: string[] = [];
	const removeFromBody = appendToBody(A);
	const cleanupMonitor = monitorForElements({
		onDragStart: () => ordered.push('monitor:start'),
		onDrop: () => ordered.push('monitor:drop'),
	});
	const cleanupDraggable = draggable({
		element: A,
		onDragStart: () => ordered.push('draggable:start'),
		onDrop: () => {
			ordered.push('draggable:drop');
			cleanupDropTarget();
		},
	});
	const cleanupDropTarget = combine(
		dropTargetForElements({
			element: A,
			onDragStart: () => ordered.push('dropTarget:start'),
			onDrop: () => ordered.push('dropTarget:drop'),
		}),
		() => ordered.push('cleanup drop target'),
	);

	// start drag [A]
	userEvent.lift(A);

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start', 'monitor:start']);
	ordered.length = 0;

	userEvent.drop(A);

	expect(ordered).toEqual(['draggable:drop', 'cleanup drop target', 'monitor:drop']);

	cleanupDraggable();
	cleanupDropTarget();
	cleanupMonitor();
	removeFromBody();
});

test('changing a parent drop target during a drop', () => {
	const [draggableEl, A] = getBubbleOrderedTree();
	const ordered: string[] = [];
	const removeFromBody = appendToBody(A);
	const cleanupMonitor = monitorForElements({
		onDragStart: () => ordered.push('monitor:start'),
		onDrop: () => ordered.push('monitor:drop'),
	});
	const cleanupDropTarget1 = dropTargetForElements({
		element: A,
		onDragStart: () => ordered.push('dropTarget1:start'),
		onDrop: () => ordered.push('dropTarget1:drop'),
	});
	let cleanupDropTarget2: () => void = () => {};
	const cleanupDraggable = draggable({
		element: draggableEl,
		onDragStart: () => ordered.push('draggable:start'),
		onDrop: () => {
			ordered.push('draggable:drop');
			ordered.push('changing drop target');
			cleanupDropTarget1();
			// This new drop target will be treated as the original drop target
			// as they are both created on the same element (the unique key)
			cleanupDropTarget2 = dropTargetForElements({
				element: A,
				onDragStart: () => ordered.push('dropTarget2:start'),
				onDrop: () => ordered.push('dropTarget2:drop'),
			});
		},
	});

	// start drag in [A]
	userEvent.lift(draggableEl);

	expect(ordered).toEqual(['draggable:start', 'dropTarget1:start', 'monitor:start']);
	ordered.length = 0;

	userEvent.drop(A);

	expect(ordered).toEqual([
		'draggable:drop',
		'changing drop target',
		'dropTarget2:drop',
		'monitor:drop',
	]);

	cleanupDraggable();
	cleanupDropTarget1();
	cleanupDropTarget2();
	cleanupMonitor();
	removeFromBody();
});

test('removing a parent drop target during a drop', () => {
	const [draggableEl, A] = getBubbleOrderedTree();
	const ordered: string[] = [];
	const removeFromBody = appendToBody(A);
	const cleanupMonitor = monitorForElements({
		onDragStart: () => ordered.push('monitor:start'),
		onDrop: () => ordered.push('monitor:drop'),
	});
	const cleanupDraggable = draggable({
		element: draggableEl,
		onDragStart: () => ordered.push('draggable:start'),
		onDrop: () => {
			ordered.push('draggable:drop');
			cleanupDropTarget();
		},
	});
	const cleanupDropTarget = combine(
		dropTargetForElements({
			element: A,
			onDragStart: () => ordered.push('dropTarget:start'),
			onDrop: () => ordered.push('dropTarget:drop'),
		}),
		() => ordered.push('cleanup drop target'),
	);

	// start drag in [A]
	userEvent.lift(draggableEl);

	expect(ordered).toEqual(['draggable:start', 'dropTarget:start', 'monitor:start']);
	ordered.length = 0;

	userEvent.drop(A);

	expect(ordered).toEqual(['draggable:drop', 'cleanup drop target', 'monitor:drop']);

	cleanupDraggable();
	cleanupDropTarget();
	cleanupMonitor();
	removeFromBody();
});
