import { fireEvent } from '@testing-library/dom';
import invariant from 'tiny-invariant';

import { dropTargetForExternal } from '../../../../src/adapter/drop-target-for-external';
import { type ExternalEventBasePayload } from '../../../../src/adapter/external-adapter-types';
import { monitorForExternal } from '../../../../src/adapter/monitor-for-external';
import { combine } from '../../../../src/public-utils/combine';
import { containsHTML } from '../../../../src/public-utils/external/contains-html';
import { containsText } from '../../../../src/public-utils/external/contains-text';
import { getHTML } from '../../../../src/public-utils/external/get-html';
import { getText } from '../../../../src/public-utils/external/get-text';
import { getURLs } from '../../../../src/public-utils/external/get-ur-ls';
import { some } from '../../../../src/public-utils/external/some';
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
