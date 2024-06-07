import { notDraggingStyle } from '../../../src/draggable/get-draggable-provided-style';

import { defaultItems, renderApp } from './_utils';

describe('<Draggable> provided', () => {
	it('should match the expected value', () => {
		const { getProvided } = renderApp();

		defaultItems.forEach((item) => {
			const provided = getProvided(item.id);
			expect(provided[0]).toEqual({
				draggableProps: {
					'data-rbd-draggable-context-id': '0',
					'data-rbd-draggable-id': item.id,
					style: notDraggingStyle,
				},
				dragHandleProps: {
					role: 'button',
					'aria-describedby': 'rbd-lift-instruction-0',
					'data-rbd-drag-handle-context-id': '0',
					'data-rbd-drag-handle-draggable-id': item.id,
					tabIndex: 0,
					draggable: false,
					onDragStart: expect.any(Function),
				},
				innerRef: expect.any(Function),
			});
		});
	});
});
