import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../../src/entry-point/combine';
import {
	dropTargetForExternal,
	monitorForExternal,
} from '../../../../src/entry-point/external/adapter';
import { appendToBody, getElements, nativeDrag, reset } from '../../_util';

afterEach(reset);

test('monitor adding during the "drop" event should get the original items (empty) for canMonitor() and not the populated items', () => {
	const [A] = getElements('div');
	const ordered: string[] = [];

	const cleanup1 = combine(
		appendToBody(A),
		monitorForExternal({
			onDragStart: () => ordered.push('monitor1:start'),
			onDrag: () => ordered.push('monitor1:drag'),
			onDropTargetChange: () => ordered.push('monitor1:change'),
			onDrop: () => ordered.push('monitor1:drop'),
		}),
		dropTargetForExternal({
			element: A,
			onDrag: () => ordered.push('a:drag'),
			onDragEnter: () => ordered.push('a:enter'),
			onDropTargetChange: () => ordered.push('a:change'),
			onDrop: () => ordered.push('a:drop'),
		}),
	);

	// entering body
	nativeDrag.startExternal({
		items: [{ data: 'Hello', type: 'text/plain' }],
	});
	expect(ordered).toEqual(['monitor1:start']);
	ordered.length = 0;

	// entering A
	fireEvent.dragEnter(A);
	expect(ordered).toEqual(['a:change', 'a:enter', 'monitor1:change']);
	ordered.length = 0;

	const itemsToCanMonitor: DataTransferItem[] = [];
	const actualDropItems: DataTransferItem[] = [];

	const cleanup2 = monitorForExternal({
		canMonitor: (args) => {
			itemsToCanMonitor.push(...args.source.items);
			return true;
		},
		onDrop: (args) => {
			ordered.push('monitor2:drop');
			actualDropItems.push(...args.source.items);
		},
	});

	// dropping
	nativeDrag.drop({
		items: [{ data: 'Hello', type: 'text/plain' }],
		target: A,
	});

	expect(ordered).toEqual(['a:drop', 'monitor1:drop', 'monitor2:drop']);
	expect(itemsToCanMonitor).toEqual([]);
	expect(actualDropItems.length).toBe(1);

	cleanup1();
	cleanup2();
});
