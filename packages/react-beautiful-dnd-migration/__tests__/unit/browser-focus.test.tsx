import React from 'react';

import { act, fireEvent, render } from '@testing-library/react';

import BoardExample from '../../examples/01-board';
import ReactWindowBoardExample from '../../examples/02-react-window';
import { customAttributes } from '../../src/utils/attributes';

import {
	keyboard,
	mouse,
} from './ported-from-react-beautiful-dnd/unit/integration/_utils/controls';
import { isDragging } from './ported-from-react-beautiful-dnd/unit/integration/_utils/helpers';

HTMLElement.prototype.scrollIntoView = jest.fn();
HTMLElement.prototype.scrollTo = jest.fn();

const controls = [
	{ controlId: 'mouse', control: mouse },
	{ controlId: 'keyboard', control: keyboard },
];

const modes = [
	{ mode: 'standard', Example: BoardExample },
	{ mode: 'virtual', Example: ReactWindowBoardExample },
] as const;

controls.forEach(({ controlId, control }) => {
	modes.forEach(({ mode, Example }) => {
		describe(`browser focus (mode: ${mode}) (control: ${controlId})`, () => {
			describe('when the drag handle is focused at drag start', () => {
				it('should focus the drag handle with matching id after the drag starts', async () => {
					const { getByTestId, unmount } = render(<Example />);

					const cardA0 = getByTestId('item-A0');

					cardA0.focus();
					control.lift(cardA0);

					if (mode === 'standard') {
						expect(document.activeElement).toBe(cardA0);
					}

					if (mode === 'virtual') {
						expect(document.activeElement).not.toBe(cardA0);
						expect(document.activeElement).toBe(getByTestId('item-A0'));
					}

					control.cancel(cardA0);
					unmount();
				});

				it('should focus the drag handle with matching id after the drag ends', async () => {
					const { getByTestId, unmount } = render(<BoardExample />);

					const cardA0 = getByTestId('item-A0');

					cardA0.focus();
					control.lift(cardA0);
					expect(isDragging(getByTestId('item-A0'))).toBe(true);

					/**
					 * Drag the item to column B
					 */
					if (control === mouse) {
						fireEvent.dragOver(getByTestId('item-B0'));
					}

					if (control === keyboard) {
						fireEvent.keyDown(getByTestId('item-A0'), { key: 'ArrowRight' });
					}

					/**
					 * Drop it in column B
					 */
					control.drop(document.body);
					expect(isDragging(getByTestId('item-A0'))).toBe(false);

					/**
					 * Check it's in column B
					 */
					const parentDroppableId = getByTestId('item-A0').getAttribute(
						customAttributes.draggable.droppableId,
					);
					expect(parentDroppableId).toBe('B');

					/**
					 * Focus restoration will occur after an animation frame.
					 */
					act(() => {
						// @ts-expect-error
						requestAnimationFrame.step();
					});

					expect(document.activeElement).toBe(getByTestId('item-A0'));

					unmount();
				});
			});
		});
	});
});
