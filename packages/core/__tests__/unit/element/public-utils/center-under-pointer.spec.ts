import { fireEvent } from '@testing-library/dom';
import invariant from 'tiny-invariant';

import { combine } from '../../../../src/entry-point/combine';
import {
	draggable,
	type ElementEventPayloadMap,
} from '../../../../src/entry-point/element/adapter';
import { centerUnderPointer } from '../../../../src/entry-point/element/center-under-pointer';
import { setCustomNativeDragPreview } from '../../../../src/entry-point/element/set-custom-native-drag-preview';
import { appendToBody, getElements, getRect, reset, setBoundingClientRect } from '../../_util';

/**
 * Note: I have tested what I can about custom native drag previews in this file.
 * Ideally we would have VR tests that ensured the custom native drag preview
 * behaved how we expected in lots of scenarios. However, our VR testing today
 * does not capture native drag previews as drag previews are rendered outside of
 * the browser window on a separate native layer.
 */

afterEach(reset);

it('should position the center of the drag preview user the users pointer', async () => {
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
					getOffset: centerUnderPointer,
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
	// setDragImage not called until the next microtask for framework compatibility
	await 'microtask';
	expect(setImageMock).nthCalledWith(1, pointerToContainer, rect.width / 2, rect.height / 2);

	// @ts-expect-error
	requestAnimationFrame.step();
	expect(ordered).toEqual(['start']);

	cleanup();
});
