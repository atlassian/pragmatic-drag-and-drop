import { fireEvent } from '@testing-library/dom';
import invariant from 'tiny-invariant';

import { combine } from '../../../../../src/entry-point/combine';
import {
	dropTargetForExternal,
	type ExternalEventBasePayload,
	monitorForExternal,
} from '../../../../../src/entry-point/external/adapter';
import { getText } from '../../../../../src/entry-point/external/text';
import { getURLs } from '../../../../../src/entry-point/external/url';
import { appendToBody, getBubbleOrderedTree, nativeDrag, reset } from '../../../_util';

afterEach(reset);

test('when dragging no urls, getURLs() should return []', () => {
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

	const items = [{ data: '<h1>Declan is a boss</h1>', type: 'text/html' }];
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
	expect(getURLs({ source: second.source })).toEqual([]);

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
		description: 'multiple urls',
		uriValue: 'https://atlassian.design/\r\nhttps://www.atlassian.com/',
		expectedGetURLValue: ['https://atlassian.design/', 'https://www.atlassian.com/'],
	},
	{
		description: 'single comment',
		uriValue: '# just a comment',
		expectedGetURLValue: [],
	},
	{
		description: 'comments and urls',
		uriValue:
			'#first\r\nhttps://atlassian.design/\r\n#second\r\nhttps://www.atlassian.com/\r\n#third',
		expectedGetURLValue: ['https://atlassian.design/', 'https://www.atlassian.com/'],
	},
	{
		description: 'urls with path segments (checking "#" in a url is okay)',
		uriValue: 'https://atlassian.design/components/avatar/examples#circle',
		expectedGetURLValue: ['https://atlassian.design/components/avatar/examples#circle'],
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

		const items = [{ data: scenario.uriValue, type: 'text/uri-list' }];
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
		expect(second.source.getStringData('text/uri-list')).toEqual(scenario.uriValue);
		// validating our helper works how I expect
		expect(getURLs({ source: second.source })).toEqual(scenario.expectedGetURLValue);

		cleanup();
	});
});

test('when dragging multiple types of native data (including urls), getURLs() should only return the urls', () => {
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
		{ data: 'https://atlassian.design/', type: 'text/uri-list' },
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
	expect(getURLs({ source: second.source })).toEqual(['https://atlassian.design/']);

	// checking the text is there too
	expect(getText({ source: second.source })).toEqual('Hello');

	cleanup();
});
