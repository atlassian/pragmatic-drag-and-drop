// This file was copied from `react-beautiful-dnd` with some adjustments.
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/test/unit/view/droppable/inner-ref-validation.spec.js>

import React from 'react';

import { render } from '@testing-library/react';
import type { DroppableProvided } from 'react-beautiful-dnd';

import { DragDropContext, Droppable } from '../../../../../../src';

jest.spyOn(console, 'error').mockImplementation(() => {});

afterAll(() => {
	// @ts-expect-error
	// eslint-disable-next-line no-console
	console.error.mockReset();
});

it('should throw if consumer has not provided a ref', () => {
	const NoRef = ({ provided }: { provided: DroppableProvided }) => (
		<div {...provided.droppableProps}>Hello there {provided.placeholder}</div>
	);

	expect(() =>
		render(
			<DragDropContext onDragEnd={() => {}}>
				<Droppable droppableId="droppable">{(provided) => <NoRef provided={provided} />}</Droppable>
			</DragDropContext>,
		),
	).toThrow();
});

it('should throw if consumer has provided an SVGElement', () => {
	const WithSVG = ({ provided }: { provided: DroppableProvided }) => (
		// @ts-expect-error - TS is correctly stating this is not a HTMLElement
		<svg {...provided.droppableProps} ref={provided.innerRef}>
			Hello there {provided.placeholder}
		</svg>
	);

	expect(() =>
		render(
			<DragDropContext onDragEnd={() => {}}>
				<Droppable droppableId="droppable">
					{(provided) => <WithSVG provided={provided} />}
				</Droppable>
			</DragDropContext>,
		),
	).toThrow();
});
