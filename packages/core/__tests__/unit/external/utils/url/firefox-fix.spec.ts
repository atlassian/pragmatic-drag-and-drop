import { fireEvent } from '@testing-library/dom';
import invariant from 'tiny-invariant';

import { combine } from '../../../../../src/entry-point/combine';
import {
	dropTargetForExternal,
	type ExternalEventBasePayload,
	monitorForExternal,
} from '../../../../../src/entry-point/external/adapter';
import { containsURLs, getURLs } from '../../../../../src/entry-point/external/url';
import { appendToBody, getBubbleOrderedTree, nativeDrag, reset } from '../../../_util';

/**
 * 🦊🐞
 * When dragging a URL from the Firefox address bar or bookmarks
 * they are currently not adding an entry for "text/uri-list".
 * They add "text/x-moz-url" data which contains the same information
 * in a different format.
 *
 * [Bug report](https://bugzilla.mozilla.org/show_bug.cgi?id=1912164)
 */

afterEach(reset);

test('getURL() should use "text/uri-list" before "text/x-moz-url"', () => {
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
		{ data: 'https://atlassian.design', type: 'text/x-moz-url' },
		{ data: 'https://atlassian.com', type: 'text/uri-list' },
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
	// validating the raw data is what we set
	expect(second.source.getStringData('text/uri-list')).toEqual('https://atlassian.com');
	expect(second.source.getStringData('text/x-moz-url')).toEqual('https://atlassian.design');

	// only returning text/uri-list data
	expect(getURLs({ source: second.source })).toEqual(['https://atlassian.com']);

	cleanup();
});

type Scenario = {
	description: string;
	uriValue: string;
	expectedGetURLValue: string[];
};
const scenarios: Scenario[] = [
	{
		description: 'single url',
		uriValue: 'https://atlassian.design/',
		expectedGetURLValue: ['https://atlassian.design/'],
	},
	{
		description: 'url with title',
		uriValue: 'https://atlassian.design/\nAtlassian',
		expectedGetURLValue: ['https://atlassian.design/'],
	},
	{
		description: 'multiple url with titles',
		uriValue: 'https://atlassian.design/\nAtlassian\nhttps://domevents.dev/\nDOM Events',
		expectedGetURLValue: ['https://atlassian.design/', 'https://domevents.dev/'],
	},
	{
		// not sure if this is possible, but just being safe
		description: 'url with title + url with no title',
		uriValue: 'https://atlassian.design/\nAtlassian\nhttps://domevents.dev/',
		expectedGetURLValue: ['https://atlassian.design/', 'https://domevents.dev/'],
	},
];

scenarios.forEach((scenario) => {
	test(`getURL() case: ${scenario.description}`, () => {
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

		const items = [{ data: scenario.uriValue, type: 'text/x-moz-url' }];
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
		// validating the raw data is what we set
		expect(second.source.getStringData('text/x-moz-url')).toEqual(scenario.uriValue);
		// validating our helper works how I expect
		expect(getURLs({ source: second.source })).toEqual(scenario.expectedGetURLValue);

		cleanup();
	});
});

test('containsURLs() should return true if "text/x-moz-url" data is being dragged', () => {
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

	const items = [{ data: 'https://atlassian.design/', type: 'text/x-moz-url' }];
	nativeDrag.startExternal({
		items,
	});

	// when starting a drag, no items are exposed
	expect(ordered).toEqual(['monitor:start']);
	expect(payloads.length).toBe(1);
	const first = payloads[0];
	invariant(first);
	expect(containsURLs({ source: first.source })).toEqual(true);
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
	expect(containsURLs({ source: second.source })).toEqual(true);

	// checking url is there
	expect(getURLs({ source: second.source })).toEqual(['https://atlassian.design/']);

	cleanup();
});
