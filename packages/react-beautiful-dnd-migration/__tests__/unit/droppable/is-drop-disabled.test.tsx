import React, { type ReactNode, useState } from 'react';

import { act, fireEvent, render } from '@testing-library/react';
import { replaceRaf } from 'raf-stub';
import type {
	DraggableProvided,
	DragStart,
	DragUpdate,
	DroppableProvided,
	OnDragEndResponder,
	OnDragStartResponder,
	OnDragUpdateResponder,
} from 'react-beautiful-dnd';

import { DragDropContext, Draggable, Droppable } from '../../../src';
import { setElementFromPoint } from '../_util';
import {
	keyboard,
	mouse,
} from '../ported-from-react-beautiful-dnd/unit/integration/_utils/controls';

HTMLElement.prototype.scrollIntoView = jest.fn();

type AppProps = {
	onDragStart: OnDragStartResponder;
	onDragUpdate: OnDragUpdateResponder;
	onDragEnd: OnDragEndResponder;
};

function AppInner(droppableProvided: DroppableProvided) {
	return (
		<div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
			<Draggable draggableId="draggable" index={0}>
				{(draggableProvided: DraggableProvided) => (
					<div
						ref={draggableProvided.innerRef}
						data-testid="drag-handle"
						{...draggableProvided.draggableProps}
						{...draggableProvided.dragHandleProps}
					>
						Drag me!
					</div>
				)}
			</Draggable>
			{droppableProvided.placeholder}
		</div>
	);
}

function OuterDroppable({ children }: { children: ReactNode }) {
	return (
		<Droppable droppableId="outer">
			{(provided) => (
				<div ref={provided.innerRef} {...provided.droppableProps}>
					{children}
					{provided.placeholder}
				</div>
			)}
		</Droppable>
	);
}

function App({ onDragStart, onDragUpdate, onDragEnd }: AppProps) {
	return (
		<DragDropContext onDragStart={onDragStart} onDragUpdate={onDragUpdate} onDragEnd={onDragEnd}>
			<Droppable droppableId="droppable" isDropDisabled>
				{(droppableProvided: DroppableProvided) => (
					<div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
						<Draggable draggableId="draggable" index={0}>
							{(draggableProvided: DraggableProvided) => (
								<div
									ref={draggableProvided.innerRef}
									data-testid="drag-handle"
									{...draggableProvided.draggableProps}
									{...draggableProvided.dragHandleProps}
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

jest.useFakeTimers();

replaceRaf();

it('should allow the disabling of a droppable in onDragStart', () => {
	const responders = {
		onDragStart: jest.fn(),
		onDragUpdate: jest.fn(),
		onDragEnd: jest.fn(),
	};
	const { getByTestId } = render(<App {...responders} />);
	const handle: HTMLElement = getByTestId('drag-handle');

	setElementFromPoint(handle);

	act(() => {
		fireEvent.dragStart(handle);
		// @ts-expect-error
		requestAnimationFrame.step();
	});

	// flush responder
	act(() => {
		jest.runOnlyPendingTimers();
	});

	const start: DragStart = {
		draggableId: 'draggable',
		source: {
			droppableId: 'droppable',
			index: 0,
		},
		type: 'DEFAULT',
		mode: 'FLUID',
	};
	expect(responders.onDragStart).toHaveBeenCalledWith(start, expect.any(Object));

	// onDragUpdate will occur after setTimeout
	expect(responders.onDragUpdate).not.toHaveBeenCalled();

	act(() => {
		jest.runOnlyPendingTimers();
	});

	// an update should be fired as the home location has changed
	const update: DragUpdate = {
		...start,
		// no destination as it is now disabled
		destination: null,
		combine: null,
	};
	expect(responders.onDragUpdate).toHaveBeenCalledWith(update, expect.any(Object));
});

it('should not fire the DragUpdate twice', () => {
	const responders = {
		onDragStart: jest.fn(),
		onDragUpdate: jest.fn(),
		onDragEnd: jest.fn(),
	};
	const { getByTestId } = render(<App {...responders} />);
	const handle: HTMLElement = getByTestId('drag-handle');

	setElementFromPoint(handle);

	act(() => {
		fireEvent.dragStart(handle);
		// @ts-expect-error
		requestAnimationFrame.step();
	});

	act(() => {
		// flush onDragStart
		jest.runOnlyPendingTimers();

		// flush onDragUpdate
		jest.runOnlyPendingTimers();
	});

	// an update should be fired as the home location has changed
	const update: DragUpdate = {
		draggableId: 'draggable',
		source: {
			droppableId: 'droppable',
			index: 0,
		},
		type: 'DEFAULT',
		mode: 'FLUID',
		// no destination as it is now disabled
		destination: null,
		combine: null,
	};
	expect(responders.onDragUpdate).toHaveBeenCalledWith(update, expect.any(Object));

	expect(responders.onDragUpdate).toHaveBeenCalledTimes(1);
	act(() => {
		fireEvent.dragOver(document.body);
		// @ts-expect-error
		requestAnimationFrame.step();
	});
	expect(responders.onDragUpdate).toHaveBeenCalledTimes(1);
});

const cases = [
	{ id: 'keyboard', control: keyboard, mode: 'SNAP' },
	{ id: 'mouse', control: mouse, mode: 'FLUID' },
] as const;

cases.forEach(({ id, control, mode }) => {
	describe(`when the droppable starts disabled (${id})`, () => {
		it('should fire an update after drag start', () => {
			const onDragStart = jest.fn();
			const onDragUpdate = jest.fn();

			const App = () => {
				return (
					<DragDropContext
						onDragStart={onDragStart}
						onDragUpdate={onDragUpdate}
						onDragEnd={() => {}}
					>
						<Droppable droppableId="droppable" isDropDisabled>
							{AppInner}
						</Droppable>
					</DragDropContext>
				);
			};

			const { getByTestId } = render(<App />);
			const handle: HTMLElement = getByTestId('drag-handle');

			control.lift(handle);
			act(() => {
				jest.runOnlyPendingTimers();
			});

			const start: DragStart = {
				draggableId: 'draggable',
				source: {
					droppableId: 'droppable',
					index: 0,
				},
				type: 'DEFAULT',
				mode,
			};
			expect(onDragStart).toHaveBeenCalledWith(start, expect.any(Object));

			// onDragUpdate will occur after setTimeout
			expect(onDragUpdate).not.toHaveBeenCalled();

			act(() => {
				jest.runOnlyPendingTimers();
			});

			// an update should be fired as the home location has changed
			const update: DragUpdate = {
				...start,
				// no destination as it is now disabled
				destination: null,
				combine: null,
			};
			expect(onDragUpdate).toHaveBeenCalledWith(update, expect.any(Object));

			control.cancel(handle);
		});

		it('should respect nesting of droppables', () => {
			const onDragStart = jest.fn();
			const onDragUpdate = jest.fn();

			const App = () => {
				return (
					<DragDropContext
						onDragStart={onDragStart}
						onDragUpdate={onDragUpdate}
						onDragEnd={() => {}}
					>
						<OuterDroppable>
							<Droppable droppableId="droppable" isDropDisabled>
								{AppInner}
							</Droppable>
						</OuterDroppable>
					</DragDropContext>
				);
			};

			const { getByTestId } = render(<App />);
			const handle: HTMLElement = getByTestId('drag-handle');

			control.lift(handle);
			act(() => {
				jest.runOnlyPendingTimers();
			});

			const start: DragStart = {
				draggableId: 'draggable',
				source: {
					droppableId: 'droppable',
					index: 0,
				},
				type: 'DEFAULT',
				mode,
			};
			expect(onDragStart).toHaveBeenCalledWith(start, expect.any(Object));

			// onDragUpdate will occur after setTimeout
			expect(onDragUpdate).not.toHaveBeenCalled();

			act(() => {
				jest.runOnlyPendingTimers();
			});

			// an update should be fired as the home location has changed
			const update: DragUpdate = {
				...start,
				// destination is now outer droppable as inner is disabled
				destination: { droppableId: 'outer', index: 0 },
				combine: null,
			};
			expect(onDragUpdate).toHaveBeenCalledWith(update, expect.any(Object));

			control.cancel(handle);
		});
	});

	describe(`when the droppable becomes disabled during onDragStart (${id})`, () => {
		it('should fire an update after drag start', () => {
			const onDragStart = jest.fn();
			const onDragUpdate = jest.fn();

			const App = () => {
				const [isDropDisabled, setIsDropDisabled] = useState(false);

				return (
					<DragDropContext
						onDragStart={(...args) => {
							setIsDropDisabled(true);
							onDragStart(...args);
						}}
						onDragUpdate={onDragUpdate}
						onDragEnd={() => {
							setIsDropDisabled(false);
						}}
					>
						<Droppable droppableId="droppable" isDropDisabled={isDropDisabled}>
							{AppInner}
						</Droppable>
					</DragDropContext>
				);
			};

			const { getByTestId } = render(<App />);
			const handle: HTMLElement = getByTestId('drag-handle');

			control.lift(handle);
			act(() => {
				jest.runOnlyPendingTimers();
			});

			const start: DragStart = {
				draggableId: 'draggable',
				source: {
					droppableId: 'droppable',
					index: 0,
				},
				type: 'DEFAULT',
				mode,
			};
			expect(onDragStart).toHaveBeenCalledWith(start, expect.any(Object));

			// onDragUpdate will occur after setTimeout
			expect(onDragUpdate).not.toHaveBeenCalled();

			act(() => {
				jest.runOnlyPendingTimers();
			});

			// an update should be fired as the home location has changed
			const update: DragUpdate = {
				...start,
				// no destination as it is now disabled
				destination: null,
				combine: null,
			};
			expect(onDragUpdate).toHaveBeenCalledWith(update, expect.any(Object));

			control.cancel(handle);
		});

		it('should respect nesting of droppables', () => {
			const onDragStart = jest.fn();
			const onDragUpdate = jest.fn();

			const App = () => {
				const [isDropDisabled, setIsDropDisabled] = useState(false);

				return (
					<DragDropContext
						onDragStart={(...args) => {
							setIsDropDisabled(true);
							onDragStart(...args);
						}}
						onDragUpdate={onDragUpdate}
						onDragEnd={() => {
							setIsDropDisabled(false);
						}}
					>
						<OuterDroppable>
							<Droppable droppableId="droppable" isDropDisabled={isDropDisabled}>
								{AppInner}
							</Droppable>
						</OuterDroppable>
					</DragDropContext>
				);
			};

			const { getByTestId } = render(<App />);
			const handle: HTMLElement = getByTestId('drag-handle');

			control.lift(handle);
			act(() => {
				jest.runOnlyPendingTimers();
			});

			const start: DragStart = {
				draggableId: 'draggable',
				source: {
					droppableId: 'droppable',
					index: 0,
				},
				type: 'DEFAULT',
				mode,
			};
			expect(onDragStart).toHaveBeenCalledWith(start, expect.any(Object));

			// onDragUpdate will occur after setTimeout
			expect(onDragUpdate).not.toHaveBeenCalled();

			act(() => {
				jest.runOnlyPendingTimers();
			});

			// an update should be fired as the home location has changed
			const update: DragUpdate = {
				...start,
				// no destination as it is now disabled
				destination: { droppableId: 'outer', index: 0 },
				combine: null,
			};
			expect(onDragUpdate).toHaveBeenCalledWith(update, expect.any(Object));

			control.cancel(handle);
		});
	});

	describe(`when the droppable becomes disabled after a delay (${id})`, () => {
		it('should fire an update after drag start', () => {
			const onDragStart = jest.fn();
			const onDragUpdate = jest.fn();

			const setTimeoutDelay = 9999;

			const App = () => {
				const [isDropDisabled, setIsDropDisabled] = useState(false);

				return (
					<DragDropContext
						onDragStart={(...args) => {
							setTimeout(() => {
								setIsDropDisabled(true);
							}, setTimeoutDelay);
							onDragStart(...args);
						}}
						onDragUpdate={onDragUpdate}
						onDragEnd={() => {
							setIsDropDisabled(false);
						}}
					>
						<Droppable droppableId="droppable" isDropDisabled={isDropDisabled}>
							{AppInner}
						</Droppable>
					</DragDropContext>
				);
			};

			const { getByTestId } = render(<App />);
			const handle: HTMLElement = getByTestId('drag-handle');

			control.lift(handle);
			act(() => {
				jest.runOnlyPendingTimers();
			});

			const start: DragStart = {
				draggableId: 'draggable',
				source: {
					droppableId: 'droppable',
					index: 0,
				},
				type: 'DEFAULT',
				mode,
			};
			expect(onDragStart).toHaveBeenCalledWith(start, expect.any(Object));

			// onDragUpdate will occur after setTimeout
			expect(onDragUpdate).not.toHaveBeenCalled();

			// `setIsDropDisabled(true)` will be called after the `setTimeoutDelay`
			act(() => {
				jest.advanceTimersByTime(setTimeoutDelay);
			});
			// The update has been scheduled but not actually happened yet
			expect(onDragUpdate).not.toHaveBeenCalled();

			// Trigger the scheduled update, which is a `setTimeout(fn, 0)`
			act(() => {
				jest.advanceTimersByTime(0);
			});

			// an update should be fired as the home location has changed
			const update: DragUpdate = {
				...start,
				// no destination as it is now disabled
				destination: null,
				combine: null,
			};
			expect(onDragUpdate).toHaveBeenCalledWith(update, expect.any(Object));

			control.cancel(handle);
		});

		it('should respect nesting of droppables', () => {
			const onDragStart = jest.fn();
			const onDragUpdate = jest.fn();

			const setTimeoutDelay = 9999;

			const App = () => {
				const [isDropDisabled, setIsDropDisabled] = useState(false);

				return (
					<DragDropContext
						onDragStart={(...args) => {
							setTimeout(() => {
								setIsDropDisabled(true);
							}, setTimeoutDelay);
							onDragStart(...args);
						}}
						onDragUpdate={onDragUpdate}
						onDragEnd={() => {
							setIsDropDisabled(false);
						}}
					>
						<OuterDroppable>
							<Droppable droppableId="droppable" isDropDisabled={isDropDisabled}>
								{AppInner}
							</Droppable>
						</OuterDroppable>
					</DragDropContext>
				);
			};

			const { getByTestId } = render(<App />);
			const handle: HTMLElement = getByTestId('drag-handle');

			control.lift(handle);
			act(() => {
				jest.runOnlyPendingTimers();
			});

			const start: DragStart = {
				draggableId: 'draggable',
				source: {
					droppableId: 'droppable',
					index: 0,
				},
				type: 'DEFAULT',
				mode,
			};
			expect(onDragStart).toHaveBeenCalledWith(start, expect.any(Object));

			// onDragUpdate will occur after setTimeout
			expect(onDragUpdate).not.toHaveBeenCalled();

			// `setIsDropDisabled(true)` will be called after the `setTimeoutDelay`
			act(() => {
				jest.advanceTimersByTime(setTimeoutDelay);
			});
			// The update has been scheduled but not actually happened yet
			expect(onDragUpdate).not.toHaveBeenCalled();

			// Trigger the scheduled update, which is a `setTimeout(fn, 0)`
			act(() => {
				jest.advanceTimersByTime(0);
			});

			// an update should be fired as the home location has changed
			const update: DragUpdate = {
				...start,
				// no destination as it is now disabled
				destination: { droppableId: 'outer', index: 0 },
				combine: null,
			};
			expect(onDragUpdate).toHaveBeenCalledWith(update, expect.any(Object));

			control.cancel(handle);
		});
		if (id === 'mouse') {
			it('should capture and report a11y violations', async () => {
				const onDragStart = jest.fn();
				const onDragUpdate = jest.fn();
				const App = () => {
					return (
						<DragDropContext
							onDragStart={onDragStart}
							onDragUpdate={onDragUpdate}
							onDragEnd={() => {}}
						>
							<Droppable droppableId="droppable" isDropDisabled>
								{AppInner}
							</Droppable>
						</DragDropContext>
					);
				};
				const { container } = render(<App />);

				await expect(container).toBeAccessible();
			});
		}
	});
});
