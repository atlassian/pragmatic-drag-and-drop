import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../../src/entry-point/combine';
import {
	draggable,
	type ElementEventPayloadMap,
} from '../../../../src/entry-point/element/adapter';
import { appendToBody, getEmptyHistory, reset } from '../../_util';

afterEach(reset);

it('should be possible to modify the element during the "dragstart" event in order to customise the drag preview', () => {
	const element = document.createElement('div');
	const onGenerateDragPreview = jest.fn();
	const onDragStart = jest.fn();
	const cleanup = combine(
		appendToBody(element),
		draggable({
			element: element,
			onGenerateDragPreview,
			onDragStart,
		}),
	);

	// let's start this drag!
	fireEvent.dragStart(element);
	// onGenerateDragPreview called synchronously so we can impact the drag preview
	// https://twitter.com/alexandereardon/status/1510826920023248900
	{
		const expected: ElementEventPayloadMap['onGenerateDragPreview'] = {
			location: getEmptyHistory(),
			source: {
				data: {},
				dragHandle: null,
				// dragging element provided so that user can modify
				element: element,
			},
			nativeSetDragImage: expect.any(Function),
		};
		expect(onGenerateDragPreview).toHaveBeenCalledWith(expected);
		expect(onDragStart).not.toHaveBeenCalled();
	}

	// After a frame the `onDragStart` event will occur where consumers can cleanup their changes
	// @ts-ignore
	requestAnimationFrame.step();

	{
		const expected: ElementEventPayloadMap['onDragStart'] = {
			location: getEmptyHistory(),
			source: {
				data: {},
				dragHandle: null,
				// dragging element provided so that user can modify
				element: element,
			},
		};
		expect(onDragStart).toHaveBeenCalledWith(expected);
	}

	cleanup();
});

it('should be possible to use the native "setDragImage" function', () => {
	const element = document.createElement('div');
	const onGenerateDragPreview = jest.fn();
	const onDragStart = jest.fn();
	const nativeSetDragImageSpy = jest.spyOn(DataTransfer.prototype, 'setDragImage');

	const cleanup = combine(
		appendToBody(element),
		draggable({
			element: element,
			onGenerateDragPreview,
			onDragStart,
		}),
		() => nativeSetDragImageSpy.mockReset(),
	);

	// let's start this drag!
	fireEvent.dragStart(element);

	// onGenerateDragPreview called synchronously so we can impact the drag preview
	// https://twitter.com/alexandereardon/status/1510826920023248900
	const expected: ElementEventPayloadMap['onGenerateDragPreview'] = {
		location: getEmptyHistory(),
		source: {
			data: {},
			dragHandle: null,
			// dragging element provided so that user can modify
			element: element,
		},
		nativeSetDragImage: expect.any(Function),
	};
	expect(onGenerateDragPreview).toHaveBeenCalledWith(expected);

	// should be provided with the native set drag image
	expect(nativeSetDragImageSpy).not.toHaveBeenCalled();

	const args = [new Image(), 10, 15];
	onGenerateDragPreview.mock.calls[0][0].nativeSetDragImage(...args);
	expect(nativeSetDragImageSpy).toHaveBeenCalledWith(...args);

	cleanup();
});
