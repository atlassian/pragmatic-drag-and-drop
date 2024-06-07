// This file was copied from `react-beautiful-dnd` with some adjustments.
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/test/unit/integration/draggable/validation.spec.js>

import React from 'react';

import { render } from '@testing-library/react';
import type { DraggableProvided, DroppableProvided } from 'react-beautiful-dnd';

import { DragDropContext, Draggable, Droppable } from '../../../../../../src';

const noop = () => {};

const error = jest.spyOn(console, 'error').mockImplementation(noop);
const warn = jest.spyOn(console, 'warn').mockImplementation(noop);

afterEach(() => {
	error.mockClear();
	warn.mockClear();
});

it('should throw if innerRef is not provided', () => {
	function App() {
		return (
			<DragDropContext onDragEnd={() => {}}>
				<Droppable droppableId="droppable">
					{(droppableProvided: DroppableProvided) => (
						<div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
							<Draggable draggableId="draggable" index={0}>
								{(provided: DraggableProvided) => (
									<div
										/* not providing a ref */
										/* ref={provided.innerRef} */
										{...provided.draggableProps}
										{...provided.dragHandleProps}
									>
										Drag me!
									</div>
								)}
							</Draggable>
							{droppableProvided.placeholder}
						</div>
					)}
				</Droppable>
			</DragDropContext>
		);
	}

	expect(() => render(<App />)).toThrow();
});

it('should throw if innerRef is an SVG', () => {
	function App() {
		return (
			<DragDropContext onDragEnd={() => {}}>
				<Droppable droppableId="droppable">
					{(droppableProvided: DroppableProvided) => (
						<div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
							<Draggable draggableId="draggable" index={0}>
								{(provided: DraggableProvided) => (
									<svg
										// @ts-expect-error - invalid ref type
										ref={provided.innerRef}
										{...provided.draggableProps}
										{...provided.dragHandleProps}
									>
										Drag me!
									</svg>
								)}
							</Draggable>
							{droppableProvided.placeholder}
						</div>
					)}
				</Droppable>
			</DragDropContext>
		);
	}

	expect(() => render(<App />)).toThrow();
});

it('should throw if no drag handle props are applied', () => {
	function App() {
		return (
			<DragDropContext onDragEnd={() => {}}>
				<Droppable droppableId="droppable">
					{(droppableProvided: DroppableProvided) => (
						<div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
							<Draggable draggableId="draggable" index={0}>
								{(provided: DraggableProvided) => (
									<div
										ref={provided.innerRef}
										{...provided.draggableProps}
										/* not being applied */
										/* {...dragProvided.dragHandleProps} */
									>
										Drag me!
									</div>
								)}
							</Draggable>
							{droppableProvided.placeholder}
						</div>
					)}
				</Droppable>
			</DragDropContext>
		);
	}

	expect(() => render(<App />)).toThrow();
});

it('should not throw if the draggable is disabled as there will be no drag handle', () => {
	function App() {
		return (
			<DragDropContext onDragEnd={() => {}}>
				<Droppable droppableId="droppable">
					{(droppableProvided: DroppableProvided) => (
						<div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
							<Draggable draggableId="draggable" index={0} isDragDisabled>
								{(provided: DraggableProvided) => (
									<div
										ref={provided.innerRef}
										{...provided.draggableProps}
										{...provided.dragHandleProps}
									>
										Drag me!
									</div>
								)}
							</Draggable>
							{droppableProvided.placeholder}
						</div>
					)}
				</Droppable>
			</DragDropContext>
		);
	}

	expect(() => render(<App />)).not.toThrow();
});
