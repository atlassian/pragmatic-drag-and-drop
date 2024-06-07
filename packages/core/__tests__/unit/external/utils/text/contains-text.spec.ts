import invariant from 'tiny-invariant';

import { combine } from '../../../../../src/entry-point/combine';
import {
	dropTargetForExternal,
	type ExternalEventBasePayload,
	monitorForExternal,
} from '../../../../../src/entry-point/external/adapter';
import { containsText } from '../../../../../src/entry-point/external/text';
import { appendToBody, getBubbleOrderedTree, nativeDrag, reset } from '../../../_util';

afterEach(reset);

test('when dragging no text, containsText() should return false', () => {
	const [A] = getBubbleOrderedTree();
	const ordered: string[] = [];
	const payloads: ExternalEventBasePayload[] = [];
	const cleanup = combine(
		appendToBody(A),
		dropTargetForExternal({
			element: A,
		}),
		monitorForExternal({
			onDragStart: (args) => {
				ordered.push('start');
				payloads.push(args);
			},
			onDrop: (args) => {
				ordered.push('drop');
				payloads.push(args);
			},
		}),
	);

	nativeDrag.startExternal({ items: [{ data: 'Hello', type: 'text/html' }] });

	expect(ordered).toEqual(['start']);
	expect(payloads.length).toBe(1);
	const first = payloads[0];
	invariant(first);
	expect(containsText(first)).toBe(false);
	ordered.length = 0;
	payloads.length = 0;

	// Okay, now let's drop
	nativeDrag.drop({ items: [{ data: 'Hello', type: 'text/html' }] });

	expect(ordered).toEqual(['drop']);
	expect(payloads.length).toBe(1);
	const second = payloads[0];
	invariant(second);
	expect(containsText(second)).toBe(false);

	cleanup();
});

test('when dragging text, containsText() should return true', () => {
	const [A] = getBubbleOrderedTree();
	const ordered: string[] = [];
	const payloads: ExternalEventBasePayload[] = [];
	const cleanup = combine(
		appendToBody(A),
		dropTargetForExternal({
			element: A,
		}),
		monitorForExternal({
			onDragStart: (args) => {
				ordered.push('start');
				payloads.push(args);
			},
			onDrop: (args) => {
				ordered.push('drop');
				payloads.push(args);
			},
		}),
	);

	const items = [{ data: 'Hi', type: 'text/plain' }];
	nativeDrag.startExternal({ items });

	expect(ordered).toEqual(['start']);
	expect(payloads.length).toBe(1);
	const first = payloads[0];
	invariant(first);
	expect(containsText(first)).toBe(true);
	ordered.length = 0;
	payloads.length = 0;

	// Okay, now let's drop
	nativeDrag.drop({ items });

	expect(ordered).toEqual(['drop']);
	expect(payloads.length).toBe(1);
	const second = payloads[0];
	invariant(second);
	expect(containsText(second)).toBe(true);

	cleanup();
});

test('when dragging multiple types of native data (including text), containsText() should return true', () => {
	const [A] = getBubbleOrderedTree();
	const ordered: string[] = [];
	const payloads: ExternalEventBasePayload[] = [];
	const cleanup = combine(
		appendToBody(A),
		dropTargetForExternal({
			element: A,
		}),
		monitorForExternal({
			onDragStart: (args) => {
				ordered.push('start');
				payloads.push(args);
			},
			onDrop: (args) => {
				ordered.push('drop');
				payloads.push(args);
			},
		}),
	);

	const items = [
		{ data: '<h1>Alex was here<h1>', type: 'text/html' },
		{ data: 'Hello', type: 'text/plain' },
	];
	nativeDrag.startExternal({
		items,
	});

	expect(ordered).toEqual(['start']);
	expect(payloads.length).toBe(1);
	const first = payloads[0];
	invariant(first);
	expect(containsText(first)).toBe(true);
	ordered.length = 0;
	payloads.length = 0;

	// Okay, now lets drop

	nativeDrag.drop({ items });

	expect(ordered).toEqual(['drop']);
	expect(payloads.length).toBe(1);
	const second = payloads[0];
	invariant(second);
	expect(containsText(second)).toBe(true);

	cleanup();
});
