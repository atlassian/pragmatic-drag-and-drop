import { fireEvent } from '@testing-library/dom';
import invariant from 'tiny-invariant';

import { combine } from '../../../../src/entry-point/combine';
import {
	draggable,
	type ElementEventPayloadMap,
} from '../../../../src/entry-point/element/adapter';
import { preserveOffsetOnSource } from '../../../../src/entry-point/element/preserve-offset-on-source';
import { setCustomNativeDragPreview } from '../../../../src/entry-point/element/set-custom-native-drag-preview';
import {
	appendToBody,
	getDefaultInput,
	getElements,
	getRect,
	reset,
	setBoundingClientRect,
} from '../../_util';

/**
 * Note: I have tested what I can about custom native drag previews in this file.
 * Ideally we would have VR tests that ensured the custom native drag preview
 * behaved how we expected in lots of scenarios. However, our VR testing today
 * does not capture native drag previews as drag previews are rendered outside of
 * the browser window on a separate native layer.
 */

afterEach(reset);

it('should preserve the cursor position offset on the custom drag preview', () => {
	const [A] = getElements('div');
	const ordered: string[] = [];
	let pointerToContainer: HTMLElement | null = null;
	// source element has a width of 200px and a height of 40px, with a top and right offset of 100px
	const sourceRect: DOMRect = getRect({
		top: 100,
		bottom: 140,
		left: 100,
		right: 300,
	});
	// preview element has a width of 200px and a height of 40px
	const previewRect: DOMRect = getRect({
		top: 0,
		bottom: 40,
		left: 0,
		right: 200,
	});
	const setImageMock = jest.fn();
	function makeMock(
		nativeSetDragImage: ElementEventPayloadMap['onGenerateDragPreview']['nativeSetDragImage'],
	) {
		invariant(nativeSetDragImage);
		return (...args: Parameters<typeof nativeSetDragImage>) => {
			setImageMock(...args);
			nativeSetDragImage(...args);
		};
	}
	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: A,
			onGenerateDragPreview: ({ nativeSetDragImage, location, source }) => {
				ordered.push('preview');
				setBoundingClientRect(source.element, sourceRect);
				setCustomNativeDragPreview({
					getOffset: preserveOffsetOnSource({
						element: source.element,
						// cursor is 75% to the right and 25% to the bottom of the source element
						input: getDefaultInput({ clientX: 250, clientY: 110 }),
					}),
					render({ container }) {
						pointerToContainer = container;
						setBoundingClientRect(container, previewRect);
						const preview = document.createElement('div');
						container.appendChild(preview);
					},
					nativeSetDragImage: makeMock(nativeSetDragImage),
				});
			},
			onDragStart: () => ordered.push('start'),
		}),
	);

	fireEvent.dragStart(A);

	expect(ordered).toEqual(['preview']);
	ordered.length = 0;
	expect(setImageMock).nthCalledWith(1, pointerToContainer, 150, 10);

	// @ts-expect-error
	requestAnimationFrame.step();
	expect(ordered).toEqual(['start']);

	cleanup();
});

it('should keep the cursor position inside the drag preview when the preview is smaller than the source element', () => {
	const [A] = getElements('div');
	const ordered: string[] = [];
	let pointerToContainer: HTMLElement | null = null;
	// source element has a width of 200px and a height of 40px, with a top and right offset of 100px
	const sourceRect: DOMRect = getRect({
		top: 100,
		bottom: 140,
		left: 100,
		right: 300,
	});
	// preview element has a width of 100px and a height of 20px (2 times smaller than the source element)
	const previewRect: DOMRect = getRect({
		top: 0,
		bottom: 20,
		left: 0,
		right: 100,
	});
	const setImageMock = jest.fn();
	function makeMock(
		nativeSetDragImage: ElementEventPayloadMap['onGenerateDragPreview']['nativeSetDragImage'],
	) {
		invariant(nativeSetDragImage);
		return (...args: Parameters<typeof nativeSetDragImage>) => {
			setImageMock(...args);
			nativeSetDragImage(...args);
		};
	}
	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: A,
			onGenerateDragPreview: ({ nativeSetDragImage, location, source }) => {
				ordered.push('preview');
				setBoundingClientRect(source.element, sourceRect);
				setCustomNativeDragPreview({
					getOffset: preserveOffsetOnSource({
						element: source.element,
						// cursor is 75% to the right and 75% to the bottom of the source element
						input: getDefaultInput({ clientX: 250, clientY: 130 }),
					}),
					render({ container }) {
						pointerToContainer = container;
						setBoundingClientRect(container, previewRect);
						const preview = document.createElement('div');
						container.appendChild(preview);
					},
					nativeSetDragImage: makeMock(nativeSetDragImage),
				});
			},
			onDragStart: () => ordered.push('start'),
		}),
	);

	fireEvent.dragStart(A);

	expect(ordered).toEqual(['preview']);
	ordered.length = 0;
	// assert that the offset will be the dimensions of the preview and not more
	expect(setImageMock).nthCalledWith(1, pointerToContainer, 100, 20);

	// @ts-expect-error
	requestAnimationFrame.step();
	expect(ordered).toEqual(['start']);

	cleanup();
});
