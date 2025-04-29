import { fireEvent } from '@testing-library/dom';
import invariant from 'tiny-invariant';

import { combine } from '../../../../src/entry-point/combine';
import {
	draggable,
	type ElementEventPayloadMap,
} from '../../../../src/entry-point/element/adapter';
import { pointerOutsideOfPreview } from '../../../../src/entry-point/element/pointer-outside-of-preview';
import { setCustomNativeDragPreview } from '../../../../src/entry-point/element/set-custom-native-drag-preview';
import { appendToBody, getElements, getRect, reset, setBoundingClientRect } from '../../_util';

afterEach(reset);

it('should position shift the drag preview off the users pointer (ltr)', async () => {
	const [A] = getElements('div');
	const ordered: string[] = [];
	let pointerToContainer: HTMLElement | null = null;
	const rect: DOMRect = getRect({ top: 0, bottom: 100, left: 0, right: 20 });
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
			onGenerateDragPreview({ nativeSetDragImage }) {
				ordered.push('preview');
				setCustomNativeDragPreview({
					getOffset: pointerOutsideOfPreview({
						x: '10px',
						y: '20px',
					}),
					render({ container }) {
						pointerToContainer = container;
						setBoundingClientRect(container, rect);
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
	// position drag preview at default of top / left at 0 on the users pointer
	invariant(pointerToContainer);
	// setDragImage not called until the next microtask for framework compatibility
	await 'microtask';
	// position drag preview relative to the top left corner
	expect(setImageMock).toHaveBeenNthCalledWith(1, pointerToContainer, 0, 0);
	// use a transparent border to shift the drag preview
	expect((pointerToContainer as HTMLElement).style.borderInlineStart).toEqual(
		'10px solid transparent',
	);
	expect((pointerToContainer as HTMLElement).style.borderTop).toEqual('20px solid transparent');

	// @ts-expect-error
	requestAnimationFrame.step();
	expect(ordered).toEqual(['start']);

	cleanup();
});

it('should position shift the drag preview off the users pointer (rtl)', async () => {
	const cleanupWindow = (() => {
		const original = window.getComputedStyle;

		// JSDOM does not work well with `direction` + `getComputedStyle`
		window.getComputedStyle = (el: Element) => {
			const result = original(el);
			result.direction = 'rtl';
			return result;
		};
		return function cleanup() {
			window.getComputedStyle = original;
		};
	})();

	const [A] = getElements('div');

	const ordered: string[] = [];
	let pointerToContainer: HTMLElement | null = null;
	const rect: DOMRect = getRect({ top: 0, bottom: 100, left: 0, right: 20 });
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
			onGenerateDragPreview({ nativeSetDragImage }) {
				ordered.push('preview');
				setCustomNativeDragPreview({
					getOffset: pointerOutsideOfPreview({
						x: '10px',
						y: '20px',
					}),
					render({ container }) {
						pointerToContainer = container;
						setBoundingClientRect(container, rect);
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
	// position drag preview at default of top / left at 0 on the users pointer
	invariant(pointerToContainer);
	// setDragImage not called until the next microtask for framework compatibility
	await 'microtask';
	// position drag preview relative to the top right corner
	expect(setImageMock).toHaveBeenNthCalledWith(1, pointerToContainer, rect.width, 0);
	// use a transparent border to shift the drag preview
	expect((pointerToContainer as HTMLElement).style.borderInlineStart).toEqual(
		'10px solid transparent',
	);
	expect((pointerToContainer as HTMLElement).style.borderTop).toEqual('20px solid transparent');

	// @ts-expect-error
	requestAnimationFrame.step();
	expect(ordered).toEqual(['start']);

	cleanup();
	cleanupWindow();
});
