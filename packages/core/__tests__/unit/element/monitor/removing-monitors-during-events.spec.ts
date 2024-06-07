import { combine } from '../../../../src/entry-point/combine';
import {
	draggable,
	dropTargetForElements,
	monitorForElements,
} from '../../../../src/entry-point/element/adapter';
import { appendToBody, getElements, reset, userEvent } from '../../_util';

afterEach(reset);

it('should not call a monitor that is removed during an event (draggable removing monitor)', () => {
	const ordered: string[] = [];
	const [A] = getElements('div');

	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: A,
			onDragStart: () => {
				ordered.push('draggable:start');
				cleanupMonitor();
			},
		}),
	);
	const cleanupMonitor = combine(
		() => ordered.push('monitor:cleanup'),
		monitorForElements({
			onDragStart: () => ordered.push('monitor:start'),
		}),
	);

	userEvent.lift(A);

	expect(ordered).toEqual(['draggable:start', 'monitor:cleanup']);
	ordered.length = 0;

	cleanup();
});

it('should not call a monitor that is removed during an event (drop target removing monitor)', () => {
	const ordered: string[] = [];
	const [A] = getElements('div');

	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: A,
			onDragStart: () => {
				ordered.push('draggable:start');
			},
		}),
		dropTargetForElements({
			element: A,
			onDragStart: () => {
				ordered.push('A:start');
				cleanupMonitor();
			},
		}),
	);
	const cleanupMonitor = combine(
		() => ordered.push('monitor:cleanup'),
		monitorForElements({
			onDragStart: () => ordered.push('monitor:start'),
		}),
	);

	userEvent.lift(A);

	expect(ordered).toEqual(['draggable:start', 'A:start', 'monitor:cleanup']);
	ordered.length = 0;

	cleanup();
});

it('should not call a monitor that is removed during an event (monitor removing monitor)', () => {
	const ordered: string[] = [];
	const [A] = getElements('div');

	const cleanupMonitor1 = combine(
		() => ordered.push('monitor1:cleanup'),
		monitorForElements({
			onDragStart: () => {
				ordered.push('monitor1:start');
				cleanupMonitor2();
			},
		}),
	);
	const cleanupMonitor2 = combine(
		() => ordered.push('monitor2:cleanup'),
		monitorForElements({
			onDragStart: () => ordered.push('monitor2:start'),
		}),
	);
	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: A,
			onDragStart: () => {
				ordered.push('draggable:start');
			},
		}),
	);

	userEvent.lift(A);

	expect(ordered).toEqual(['draggable:start', 'monitor1:start', 'monitor2:cleanup']);
	ordered.length = 0;

	cleanup();
	cleanupMonitor1();
	cleanupMonitor2();
});
