import { fireEvent } from '@testing-library/dom';
import invariant from 'tiny-invariant';

import { combine } from '../../../../src/entry-point/combine';
import {
	dropTargetForExternal,
	type ExternalEventBasePayload,
	monitorForExternal,
} from '../../../../src/entry-point/external/adapter';
import { containsHTML, getHTML } from '../../../../src/entry-point/external/html';
import { some } from '../../../../src/entry-point/external/some';
import { containsText, getText } from '../../../../src/entry-point/external/text';
import { getURLs } from '../../../../src/entry-point/external/url';
import { appendToBody, getBubbleOrderedTree, nativeDrag, reset } from '../../_util';

afterEach(reset);

it('should pass when all drag types that match', () => {
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
			canMonitor: some(containsText, containsHTML),
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
		{ data: '<h1>Hello world</h1>', type: 'text/html' },
		{ data: 'Hello', type: 'text/plain' },
	];
	nativeDrag.startExternal({
		items,
	});

	// when starting a drag, no items are exposed
	expect(ordered).toEqual(['monitor:start']);
	expect(payloads.length).toBe(1);
	const first = payloads[0];
	invariant(first);
	expect(getURLs({ source: first.source })).toEqual([]);
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

	expect(getHTML({ source: second.source })).toEqual('<h1>Hello world</h1>');
	expect(getText({ source: second.source })).toBe('Hello');

	cleanup();
});

it('should pass when any drag type matches', () => {
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
			canMonitor: some(containsText, containsHTML),
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

	const items = [{ data: '<h1>Hello world</h1>', type: 'text/html' }];
	nativeDrag.startExternal({
		items,
	});

	// when starting a drag, no items are exposed
	expect(ordered).toEqual(['monitor:start']);
	expect(payloads.length).toBe(1);
	const first = payloads[0];
	invariant(first);
	expect(getURLs({ source: first.source })).toEqual([]);
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

	expect(getHTML({ source: second.source })).toEqual('<h1>Hello world</h1>');
	expect(containsText({ source: second.source })).toBe(false);

	cleanup();
});

it('should not pass when no drag type matches', () => {
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
			canMonitor: some(containsText, containsHTML),
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

	const items = [{ data: 'https://atlassian.design/', type: 'text/uri-list' }];
	nativeDrag.startExternal({
		items,
	});

	// monitor not called
	expect(ordered).toEqual([]);

	cleanup();
});
