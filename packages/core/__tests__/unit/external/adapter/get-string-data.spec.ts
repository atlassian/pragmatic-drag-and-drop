import { fireEvent } from '@testing-library/dom';
import invariant from 'tiny-invariant';

import { elementAdapterNativeDataKey } from '../../../../src/adapter/element-adapter-native-data-key';
import { combine } from '../../../../src/entry-point/combine';
import {
	dropTargetForExternal,
	type ExternalEventBasePayload,
	monitorForExternal,
} from '../../../../src/entry-point/external/adapter';
import { appendToBody, getBubbleOrderedTree, nativeDrag, reset } from '../../_util';

afterEach(reset);

// Using this little wrapper as TypeScript was
// incorrectly inferring that a local `drop` variable
// was never being set (even though it was being set in onDrop)
function getBucket() {
	let drop: ExternalEventBasePayload | null = null;

	return {
		setDrop(value: ExternalEventBasePayload) {
			drop = value;
		},
		getDrop(): ExternalEventBasePayload {
			invariant(drop, 'drop was not set');
			return drop;
		},
	};
}

test('getData() should return null when nothing of that type is dragging', () => {
	const [A] = getBubbleOrderedTree();
	const ordered: string[] = [];
	const bucket = getBucket();

	const cleanup = combine(
		appendToBody(A),
		dropTargetForExternal({
			element: A,
			onDragEnter: (args) => {
				ordered.push('A:enter');
			},
			onDrop: (args) => {
				ordered.push('A:drop');
				bucket.setDrop(args);
			},
		}),
		monitorForExternal({
			onDragStart: (args) => {
				ordered.push('monitor:start');
			},
			onDropTargetChange: (args) => {
				ordered.push('monitor:change');
			},
			onDrop: (args) => {
				ordered.push('monitor:drop');
			},
		}),
	);

	nativeDrag.startExternal({ items: [{ type: 'text/plain', data: 'hello' }] });

	fireEvent.dragEnter(A);
	nativeDrag.drop({
		target: A,
		items: [{ type: 'text/plain', data: 'hello' }],
	});
	expect(ordered).toEqual(['monitor:start', 'A:enter', 'monitor:change', 'A:drop', 'monitor:drop']);

	expect(bucket.getDrop().source.getStringData('text/html')).toBe(null);
	// validation
	expect(bucket.getDrop().source.getStringData('text/plain')).toBe('hello');

	cleanup();
});

test('getData() should return "" if "" is explicitly set', () => {
	const [A] = getBubbleOrderedTree();
	const ordered: string[] = [];
	const bucket = getBucket();

	const cleanup = combine(
		appendToBody(A),
		dropTargetForExternal({
			element: A,
			onDragEnter: (args) => {
				ordered.push('A:enter');
			},
			onDrop: (args) => {
				ordered.push('A:drop');
				bucket.setDrop(args);
			},
		}),
		monitorForExternal({
			onDragStart: (args) => {
				ordered.push('monitor:start');
			},
			onDropTargetChange: (args) => {
				ordered.push('monitor:change');
			},
			onDrop: (args) => {
				ordered.push('monitor:drop');
			},
		}),
	);

	nativeDrag.startExternal({ items: [{ type: 'text/plain', data: '' }] });

	fireEvent.dragEnter(A);
	nativeDrag.drop({
		target: A,
		items: [{ type: 'text/plain', data: '' }],
	});
	expect(ordered).toEqual(['monitor:start', 'A:enter', 'monitor:change', 'A:drop', 'monitor:drop']);

	expect(bucket.getDrop().source.getStringData('text/plain')).toBe('');

	cleanup();
});

test('getData() should return null if requesting the element adapter private key', () => {
	const [A] = getBubbleOrderedTree();
	const ordered: string[] = [];
	const bucket = getBucket();

	const cleanup = combine(
		appendToBody(A),
		dropTargetForExternal({
			element: A,
			onDragEnter: (args) => {
				ordered.push('A:enter');
			},
			onDrop: (args) => {
				ordered.push('A:drop');
				bucket.setDrop(args);
			},
		}),
		monitorForExternal({
			onDragStart: (args) => {
				ordered.push('monitor:start');
			},
			onDropTargetChange: (args) => {
				ordered.push('monitor:change');
			},
			onDrop: (args) => {
				ordered.push('monitor:drop');
			},
		}),
	);

	nativeDrag.startExternal({ items: [{ type: 'text/plain', data: '' }] });

	fireEvent.dragEnter(A);
	nativeDrag.drop({
		target: A,
		items: [{ type: 'text/plain', data: '' }],
	});
	expect(ordered).toEqual(['monitor:start', 'A:enter', 'monitor:change', 'A:drop', 'monitor:drop']);

	expect(bucket.getDrop().source.getStringData(elementAdapterNativeDataKey)).toBe(null);

	cleanup();
});
