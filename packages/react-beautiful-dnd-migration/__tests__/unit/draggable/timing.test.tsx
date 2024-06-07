import React from 'react';

import { render } from '@testing-library/react';

import { setElementFromPoint } from '../_util';
import App from '../ported-from-react-beautiful-dnd/unit/integration/_utils/app';
import {
	mouse,
	simpleLift,
} from '../ported-from-react-beautiful-dnd/unit/integration/_utils/controls';

function getRect({ x = 0, y = 0, width = 0, height = 0 }: DOMRectInit): DOMRect {
	// DOMRect.fromRect is not available in jest
	return {
		x,
		y,
		width,
		height,
		left: x,
		right: x + width,
		top: y,
		bottom: y + height,
		toJSON() {},
	};
}

jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
	this: HTMLElement,
) {
	return getRect({
		x: 0,
		y: 0,
		width: parseFloat(this.style.width),
		height: parseFloat(this.style.height),
	});
});

it('should use dimensions changed in onBeforeCapture', () => {
	const onBeforeCapture = jest.fn(({ draggableId }: { draggableId: string }) => {
		const element = getByTestId(draggableId);
		element.style.width = '200px';
		element.style.height = '200px';
	});

	const { getByTestId } = render(<App onBeforeCapture={onBeforeCapture} />);

	const before: HTMLElement = getByTestId('0');
	before.style.width = '100px';
	before.style.height = '100px';

	setElementFromPoint(before);
	simpleLift(mouse, before);

	expect(onBeforeCapture).toHaveBeenCalled();

	expect(before.style.width).toBe('200px');
	expect(before.style.height).toBe('200px');

	mouse.drop(before);
});

it('should not use dimensions changed in onBeforeDragStart', () => {
	const onBeforeDragStart = jest.fn(({ draggableId }: { draggableId: string }) => {
		const element = getByTestId(draggableId);
		element.style.width = '200px';
		element.style.height = '200px';
	});

	const { getByTestId } = render(<App onBeforeDragStart={onBeforeDragStart} />);

	const before: HTMLElement = getByTestId('0');
	before.style.width = '100px';
	before.style.height = '100px';

	setElementFromPoint(before);
	simpleLift(mouse, before);

	expect(onBeforeDragStart).toHaveBeenCalled();

	expect(before.style.width).toBe('100px');
	expect(before.style.height).toBe('100px');

	mouse.drop(before);
});
