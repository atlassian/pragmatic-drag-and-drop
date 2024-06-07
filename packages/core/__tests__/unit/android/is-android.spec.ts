import { fireEvent } from '@testing-library/dom';
import { bind } from 'bind-event-listener';
import invariant from 'tiny-invariant';

import { elementAdapterNativeDataKey } from '../../../src/adapter/element-adapter-native-data-key';
import { combine } from '../../../src/entry-point/combine';
import { draggable } from '../../../src/entry-point/element/adapter';
import {
	dropTargetForExternal,
	monitorForExternal,
} from '../../../src/entry-point/external/adapter';
import type { CleanupFn } from '../../../src/entry-point/types';
import { getHTML } from '../../../src/public-utils/external/html';
import { androidFallbackText } from '../../../src/util/android';
import { textMediaType } from '../../../src/util/media-types/text-media-type';
import { appendToBody, getElements, nativeDrag, reset, userEvent } from '../_util';

function setAndroidUserAgent(): CleanupFn {
	const original = navigator.userAgent;

	Object.defineProperty(navigator, 'userAgent', {
		value:
			'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.43 Mobile Safari/537.36',
		writable: true,
	});

	return function cleanup() {
		Object.defineProperty(navigator, 'userAgent', {
			value: original,
			writable: true,
		});
	};
}

const resetUserAgent = setAndroidUserAgent();
afterAll(resetUserAgent);
afterEach(reset);

it('should add fallback "text/plain" data if none is already added by an draggable', () => {
	const [element] = getElements('div');
	const ordered: string[] = [];
	let transfer: DataTransfer = new DataTransfer();

	const cleanup = combine(
		appendToBody(element),
		draggable({
			element,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
			onDragStart: () => ordered.push('draggable:start'),
		}),
		bind(window, {
			type: 'dragstart',
			listener(event) {
				invariant(event.dataTransfer);
				ordered.push('native:start');
				transfer = event.dataTransfer;
			},
			// want to come in after the external adapter
			options: { capture: false },
		}),
	);

	userEvent.lift(element);

	expect(ordered).toEqual(['draggable:preview', 'native:start', 'draggable:start']);
	invariant(transfer);

	expect(transfer.types).toEqual([elementAdapterNativeDataKey, 'text/plain']);
	expect(transfer.getData('text/plain')).toEqual(androidFallbackText);

	cleanup();
});

it('should not add fallback "text/plain" data if "text/plain" is already added by an draggable', () => {
	const [element] = getElements('div');
	const ordered: string[] = [];
	let transfer: DataTransfer = new DataTransfer();

	const cleanup = combine(
		appendToBody(element),
		draggable({
			element,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
			onDragStart: () => ordered.push('draggable:start'),
			getInitialDataForExternal: () => ({ 'text/plain': 'Hello' }),
		}),
		bind(window, {
			type: 'dragstart',
			listener(event) {
				invariant(event.dataTransfer);
				ordered.push('native:start');
				transfer = event.dataTransfer;
			},
			// want to come in after the external adapter
			options: { capture: false },
		}),
	);

	userEvent.lift(element);

	expect(ordered).toEqual(['draggable:preview', 'native:start', 'draggable:start']);
	invariant(transfer);

	expect(transfer.types).toEqual([elementAdapterNativeDataKey, 'text/plain']);
	expect(transfer.getData('text/plain')).toEqual('Hello');

	cleanup();
});

it('should not add fallback "text/plain" data if "text/uri-list" is already added by an draggable', () => {
	const [element] = getElements('div');
	const ordered: string[] = [];
	let nativeDataTransfer: DataTransfer = new DataTransfer();

	const cleanup = combine(
		appendToBody(element),
		draggable({
			element,
			onGenerateDragPreview: () => ordered.push('draggable:preview'),
			onDragStart: () => ordered.push('draggable:start'),
			getInitialDataForExternal: () => ({
				'text/uri-list': 'https://atlassian.design',
			}),
		}),
		bind(window, {
			type: 'dragstart',
			listener(event) {
				invariant(event.dataTransfer);
				ordered.push('native:start');
				nativeDataTransfer = event.dataTransfer;
			},
			// want to come in after the external adapter
			options: { capture: false },
		}),
	);

	// firing "dragstart", but not doing a full lift
	// (which comes after an animation frame)
	fireEvent.dragStart(element);

	expect(ordered).toEqual(['draggable:preview', 'native:start']);
	invariant(nativeDataTransfer);

	expect(nativeDataTransfer.types).toEqual([
		elementAdapterNativeDataKey,
		'text/uri-list',
		// text/plain not included
	]);
	// the native data transfer returns "" when no data is set,
	// or if the empty string is explicitly set.
	expect(nativeDataTransfer.getData('text/plain')).toBe('');

	cleanup();
});

it('should not start a external drag if the only data is the android fallback "text/plain" data', () => {
	const [element] = getElements('div');
	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(element),
		monitorForExternal({
			onDragStart: () => ordered.push('monitor:start'),
		}),
	);

	nativeDrag.startExternal({
		items: [
			{ type: elementAdapterNativeDataKey, data: '' },
			{ type: textMediaType, data: androidFallbackText },
		],
	});

	// drag not started
	expect(ordered).toEqual([]);

	cleanup();
});

it('should not expose a "text/plain" type (or item) to the external adapter if the data is the fake android data', () => {
	const ordered: string[] = [];
	const [A] = getElements('div');

	const cleanup = combine(
		appendToBody(A),
		dropTargetForExternal({
			element: A,
			onDragEnter: () => ordered.push('A:enter'),
			onDrop: () => ordered.push('A:drop'),
		}),
		monitorForExternal({
			onDragStart: ({ source }) => {
				ordered.push('monitor:start');
				// Android fallback is removed, and we only get html
				expect(source.types).toEqual(['text/html']);

				// items not exposed until drop
				expect(source.items).toEqual([]);
			},
			onDrop({ source }) {
				ordered.push('monitor:drop');

				// Android fallback is removed, and we only get html
				expect(source.types).toEqual(['text/html']);

				expect(source.items.length).toBe(1);
				expect(getHTML({ source })).toBe('<strong>Hello</strong>');
				expect(source.getStringData('text/plain')).toBe(null);
			},
		}),
	);

	nativeDrag.startExternal({
		items: [
			{ type: textMediaType, data: androidFallbackText },
			{ type: 'text/html', data: '<strong>Hello</strong>' },
		],
	});

	// drag not started
	expect(ordered).toEqual(['monitor:start']);
	ordered.length = 0;

	fireEvent.dragEnter(A);
	expect(ordered).toEqual(['A:enter']);
	ordered.length = 0;

	nativeDrag.drop({
		items: [
			{ type: textMediaType, data: androidFallbackText },
			{ type: 'text/html', data: '<strong>Hello</strong>' },
		],
	});

	expect(ordered).toEqual(['A:drop', 'monitor:drop']);

	cleanup();
});
