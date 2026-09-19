import { fireEvent } from '@testing-library/dom';
import invariant from 'tiny-invariant';

import { dropTargetForExternal } from '../../../../../src/adapter/drop-target-for-external';
import { type ExternalEventBasePayload } from '../../../../../src/adapter/external-adapter-types';
import { monitorForExternal } from '../../../../../src/adapter/monitor-for-external';
import { combine } from '../../../../../src/public-utils/combine';
import { getHTML } from '../../../../../src/public-utils/external/get-html';
import { appendToBody, getBubbleOrderedTree, nativeDrag, reset } from '../../../_util';

afterEach(reset);

test('when dragging no html, getHTML() should return null', () => {
	const [A] = getBubbleOrderedTree();
	const ordered: string[] = [];
	const payloads: ExternalEventBasePayload[] = [];
	const cleanup = combine(
		appendToBody(A),
		dropTargetForExternal({
			element: A,
			onDragEnter: () => ordered.push('A:enter'),
			onDrop: () => ordered.push('A:drop'),
		}),
		monitorForExternal({
			onDragStart: (args) => {
				ordered.push('monitor:start');
				payloads.push(args);
			},
			onDrop: (args) => {
				ordered.push('monitor:drop');
				payloads.push(args);
			},
		}),
	);

	nativeDrag.startExternal({
		items: [{ data: 'Hello', type: 'text/plain' }],
	});

	// when starting a drag, no items are exposed
	expect(ordered).toEqual(['monitor:start']);
	expect(payloads.length).toBe(1);
	const first = payloads[0];
	invariant(first);
	expect(getHTML({ source: first.source })).toEqual(null);
	ordered.length = 0;
	payloads.length = 0;

	fireEvent.dragEnter(A);

	expect(ordered).toEqual(['A:enter']);
	ordered.length = 0;

	nativeDrag.drop({
		items: [{ data: 'Hello', type: 'text/plain' }],
	});

	expect(ordered).toEqual(['A:drop', 'monitor:drop']);
	expect(payloads.length).toBe(1);
	const second = payloads[0];
	invariant(second);
	expect(getHTML({ source: second.source })).toEqual(null);

	cleanup();
});

test('when dragging html, getHTML() should return the html', () => {
	const [A] = getBubbleOrderedTree();
	const ordered: string[] = [];
	const payloads: ExternalEventBasePayload[] = [];
	const cleanup = combine(
		appendToBody(A),
		dropTargetForExternal({
			element: A,
			onDragEnter: () => ordered.push('A:enter'),
			onDrop: () => ordered.push('A:drop'),
		}),
		monitorForExternal({
			onDragStart: (args) => {
				ordered.push('monitor:start');
				payloads.push(args);
			},
			onDrop: (args) => {
				ordered.push('monitor:drop');
				payloads.push(args);
			},
		}),
	);

	nativeDrag.startExternal({
		items: [{ data: '<h1>hi there</h1>', type: 'text/html' }],
	});

	// when starting a drag, no items are exposed
	expect(ordered).toEqual(['monitor:start']);
	expect(payloads.length).toBe(1);
	const first = payloads[0];
	invariant(first);
	expect(getHTML({ source: first.source })).toEqual(null);
	ordered.length = 0;
	payloads.length = 0;

	fireEvent.dragEnter(A);

	expect(ordered).toEqual(['A:enter']);
	ordered.length = 0;

	nativeDrag.drop({
		items: [{ data: '<h1>hi there</h1>', type: 'text/html' }],
	});

	expect(ordered).toEqual(['A:drop', 'monitor:drop']);
	expect(payloads.length).toBe(1);
	const second = payloads[0];
	invariant(second);
	expect(getHTML({ source: second.source })).toEqual('<h1>hi there</h1>');

	cleanup();
});

test('when dragging multiple types of native data (including html), getHTML() should only return the html', () => {
	const [A] = getBubbleOrderedTree();
	const ordered: string[] = [];
	const payloads: ExternalEventBasePayload[] = [];
	const cleanup = combine(
		appendToBody(A),
		dropTargetForExternal({
			element: A,
			onDragEnter: () => ordered.push('A:enter'),
			onDrop: () => ordered.push('A:drop'),
		}),
		monitorForExternal({
			onDragStart: (args) => {
				ordered.push('monitor:start');
				payloads.push(args);
			},
			onDrop: (args) => {
				ordered.push('monitor:drop');
				payloads.push(args);
			},
		}),
	);

	const items = [
		{ data: 'Hello', type: 'text/plain' },
		{ data: '<h1>Hi</h1>', type: 'text/html' },
	];
	nativeDrag.startExternal({
		items,
	});

	// when starting a drag, no html are exposed
	expect(ordered).toEqual(['monitor:start']);
	expect(payloads.length).toBe(1);
	const first = payloads[0];
	invariant(first);
	expect(getHTML({ source: first.source })).toEqual(null);
	ordered.length = 0;
	payloads.length = 0;

	fireEvent.dragEnter(A);

	expect(ordered).toEqual(['A:enter']);
	ordered.length = 0;

	nativeDrag.drop({
		items,
	});

	expect(ordered).toEqual(['A:drop', 'monitor:drop']);
	expect(payloads.length).toBe(1);
	const second = payloads[0];
	invariant(second);
	expect(getHTML({ source: second.source })).toEqual('<h1>Hi</h1>');

	cleanup();
});
