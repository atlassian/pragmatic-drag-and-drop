import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../../src/entry-point/combine';
import {
	draggable,
	dropTargetForElements,
	type ElementEventPayloadMap,
	monitorForElements,
} from '../../../../src/entry-point/element/adapter';
import { type DragLocation, type Input } from '../../../../src/entry-point/types';
import { appendToBody, getBubbleOrderedTree, getDefaultInput, reset, userEvent } from '../../_util';

afterEach(reset);

test('scenario: [A] -> [A] -> [] -> cancel', () => {
	const [draggableEl, A] = getBubbleOrderedTree();
	const monitorOnGenerateDragPreview = jest.fn();
	const monitorOnDragStart = jest.fn();
	const monitorOnDrag = jest.fn();
	const monitorOnDropTargetChange = jest.fn();
	const monitorOnDrop = jest.fn();
	const dropTargetOnGenerateDragPreview = jest.fn();
	const dropTargetOnDragStart = jest.fn();
	const dropTargetOnDrag = jest.fn();
	const dropTargetOnDropTargetChange = jest.fn();
	const dropTargetOnDrop = jest.fn();
	const draggableOnGenerateDragPreview = jest.fn();
	const draggableOnDragStart = jest.fn();
	const draggableOnDrag = jest.fn();
	const draggableOnDropTargetChange = jest.fn();
	const draggableOnDrop = jest.fn();
	const draggableData = { name: 'Alex' };
	const getInitialData = () => draggableData;
	const dropTargetData = { type: 'Person' };
	const getData = () => dropTargetData;

	const firstInput: Input = {
		...getDefaultInput(),
		pageX: 5,
	};
	const cleanup = combine(
		appendToBody(A),
		dropTargetForElements({
			element: A,
			getData,
			onGenerateDragPreview: dropTargetOnGenerateDragPreview,
			onDragStart: dropTargetOnDragStart,
			onDrag: dropTargetOnDrag,
			onDropTargetChange: dropTargetOnDropTargetChange,
			onDrop: dropTargetOnDrop,
		}),
		monitorForElements({
			onGenerateDragPreview: monitorOnGenerateDragPreview,
			onDragStart: monitorOnDragStart,
			onDrag: monitorOnDrag,
			onDropTargetChange: monitorOnDropTargetChange,
			onDrop: monitorOnDrop,
		}),
		draggable({
			element: draggableEl,
			getInitialData,
			onGenerateDragPreview: draggableOnGenerateDragPreview,
			onDragStart: draggableOnDragStart,
			onDrag: draggableOnDrag,
			onDropTargetChange: draggableOnDropTargetChange,
			onDrop: draggableOnDrop,
		}),
	);

	fireEvent.dragStart(draggableEl, firstInput);

	const initial: DragLocation = {
		input: firstInput,
		dropTargets: [
			{
				element: A,
				data: dropTargetData,
				isActiveDueToStickiness: false,
				dropEffect: 'move',
			},
		],
	};

	{
		const expected: ElementEventPayloadMap['onGenerateDragPreview'] = {
			location: {
				initial,
				previous: {
					dropTargets: [],
				},
				current: initial,
			},
			source: {
				data: draggableData,
				dragHandle: null,
				element: draggableEl,
			},
			nativeSetDragImage: expect.any(Function),
		};
		expect(draggableOnGenerateDragPreview).toHaveBeenCalledWith(expected);
		expect(dropTargetOnGenerateDragPreview).toHaveBeenCalledWith({
			...expected,
			self: initial.dropTargets[0],
		});
		expect(monitorOnGenerateDragPreview).toHaveBeenCalledWith(expected);
	}

	// @ts-ignore
	requestAnimationFrame.step();

	{
		const expected: ElementEventPayloadMap['onDragStart'] = {
			location: {
				initial,
				previous: {
					dropTargets: [],
				},
				current: initial,
			},
			source: {
				data: draggableData,
				dragHandle: null,
				element: draggableEl,
			},
		};
		expect(draggableOnDragStart).toHaveBeenCalledWith(expected);
		expect(dropTargetOnDragStart).toHaveBeenCalledWith({
			...expected,
			self: initial.dropTargets[0],
		});
		expect(monitorOnDragStart).toHaveBeenCalledWith(expected);
	}

	const secondInput: Input = {
		...firstInput,
		pageX: 10,
	};
	fireEvent.dragOver(A, secondInput);
	// not called until the next frame
	expect(draggableOnDrag).not.toHaveBeenCalled();
	expect(dropTargetOnDrag).not.toHaveBeenCalled();
	expect(monitorOnDrag).not.toHaveBeenCalled();
	// @ts-expect-error
	requestAnimationFrame.step();

	{
		const expected: ElementEventPayloadMap['onDrag'] = {
			location: {
				initial,
				previous: {
					dropTargets: initial.dropTargets,
				},
				current: {
					dropTargets: initial.dropTargets,
					input: secondInput,
				},
			},
			source: {
				data: draggableData,
				dragHandle: null,
				element: draggableEl,
			},
		};
		expect(draggableOnDrag).toHaveBeenCalledWith(expected);
		expect(dropTargetOnDrag).toHaveBeenCalledWith({
			...expected,
			self: initial.dropTargets[0],
		});
		expect(monitorOnDrag).toHaveBeenCalledWith(expected);
	}

	// Leaving A
	// [A] -> []
	const thirdInput: Input = {
		...secondInput,
		pageX: 15,
	};

	fireEvent.dragEnter(document.body, thirdInput);

	{
		const expected: ElementEventPayloadMap['onDropTargetChange'] = {
			location: {
				initial,
				previous: {
					dropTargets: initial.dropTargets,
				},
				current: {
					dropTargets: [],
					input: thirdInput,
				},
			},
			source: {
				data: draggableData,
				dragHandle: null,
				element: draggableEl,
			},
		};
		expect(draggableOnDropTargetChange).toHaveBeenCalledWith(expected);
		expect(dropTargetOnDropTargetChange).toHaveBeenCalledWith({
			...expected,
			self: initial.dropTargets[0],
		});
		expect(monitorOnDropTargetChange).toHaveBeenCalledWith(expected);

		expect(draggableOnDropTargetChange).toHaveBeenCalledTimes(1);
		expect(dropTargetOnDropTargetChange).toHaveBeenCalledTimes(1);
		expect(monitorOnDropTargetChange).toHaveBeenCalledTimes(1);
	}

	// "dragleave" will fire after "dragenter"
	// this won't result in any pragmatic-dnd events being called
	fireEvent.dragLeave(draggableEl);
	expect(draggableOnDropTargetChange).toHaveBeenCalledTimes(1);
	expect(dropTargetOnDropTargetChange).toHaveBeenCalledTimes(1);
	expect(monitorOnDropTargetChange).toHaveBeenCalledTimes(1);

	// Okay, now we cancel the drag
	fireEvent.dragLeave(document.body);
	fireEvent.dragEnd(document.body);

	{
		const expected: ElementEventPayloadMap['onDrop'] = {
			location: {
				initial,
				previous: {
					dropTargets: [],
				},
				current: {
					dropTargets: [],
					input: thirdInput,
				},
			},
			source: {
				data: draggableData,
				dragHandle: null,
				element: draggableEl,
			},
		};
		expect(draggableOnDrop).toHaveBeenCalledWith(expected);
		expect(monitorOnDrop).toHaveBeenCalledWith(expected);
		// not dropped on
		expect(dropTargetOnDrop).not.toHaveBeenCalled();
	}

	// validation
	expect(draggableOnGenerateDragPreview).toHaveBeenCalledTimes(1);
	expect(draggableOnDragStart).toHaveBeenCalledTimes(1);
	expect(draggableOnDrag).toHaveBeenCalledTimes(1);
	expect(draggableOnDropTargetChange).toHaveBeenCalledTimes(1);
	expect(draggableOnDrop).toHaveBeenCalledTimes(1);
	expect(dropTargetOnGenerateDragPreview).toHaveBeenCalledTimes(1);
	expect(dropTargetOnDragStart).toHaveBeenCalledTimes(1);
	expect(dropTargetOnDrag).toHaveBeenCalledTimes(1);
	expect(dropTargetOnDropTargetChange).toHaveBeenCalledTimes(1);
	// not dropped on
	expect(dropTargetOnDrop).toHaveBeenCalledTimes(0);
	expect(monitorOnGenerateDragPreview).toHaveBeenCalledTimes(1);
	expect(monitorOnDragStart).toHaveBeenCalledTimes(1);
	expect(monitorOnDrag).toHaveBeenCalledTimes(1);
	expect(monitorOnDropTargetChange).toHaveBeenCalledTimes(1);
	expect(monitorOnDrop).toHaveBeenCalledTimes(1);

	cleanup();
});

test('scenario: [A] -> [A] -> cancel', () => {
	const [draggableEl, A] = getBubbleOrderedTree();
	draggableEl.setAttribute('data-draggable-el', 'true');
	A.setAttribute('data-drop-target', 'true');
	const monitorOnGenerateDragPreview = jest.fn();
	const monitorOnDragStart = jest.fn();
	const monitorOnDrag = jest.fn();
	const monitorOnDropTargetChange = jest.fn();
	const monitorOnDrop = jest.fn();
	const dropTargetOnGenerateDragPreview = jest.fn();
	const dropTargetOnDragStart = jest.fn();
	const dropTargetOnDrag = jest.fn();
	const dropTargetOnDropTargetChange = jest.fn();
	const dropTargetOnDrop = jest.fn();
	const draggableOnGenerateDragPreview = jest.fn();
	const draggableOnDragStart = jest.fn();
	const draggableOnDrag = jest.fn();
	const draggableOnDropTargetChange = jest.fn();
	const draggableOnDrop = jest.fn();
	const draggableData = { name: 'Alex' };
	const getInitialData = () => draggableData;
	const dropTargetData = { type: 'Person' };
	const getData = () => dropTargetData;

	const firstInput: Input = {
		...getDefaultInput(),
		pageX: 5,
	};
	const cleanup = combine(
		appendToBody(A),
		dropTargetForElements({
			element: A,
			getData,
			onGenerateDragPreview: dropTargetOnGenerateDragPreview,
			onDragStart: dropTargetOnDragStart,
			onDrag: dropTargetOnDrag,
			onDropTargetChange: dropTargetOnDropTargetChange,
			onDrop: dropTargetOnDrop,
		}),
		monitorForElements({
			onGenerateDragPreview: monitorOnGenerateDragPreview,
			onDragStart: monitorOnDragStart,
			onDrag: monitorOnDrag,
			onDropTargetChange: monitorOnDropTargetChange,
			onDrop: monitorOnDrop,
		}),
		draggable({
			element: draggableEl,
			getInitialData,
			onGenerateDragPreview: draggableOnGenerateDragPreview,
			onDragStart: draggableOnDragStart,
			onDrag: draggableOnDrag,
			onDropTargetChange: draggableOnDropTargetChange,
			onDrop: draggableOnDrop,
		}),
	);

	fireEvent.dragStart(draggableEl, firstInput);

	const initial: DragLocation = {
		input: firstInput,
		dropTargets: [
			{
				element: A,
				data: dropTargetData,
				isActiveDueToStickiness: false,
				dropEffect: 'move',
			},
		],
	};

	{
		const expected: ElementEventPayloadMap['onGenerateDragPreview'] = {
			location: {
				initial,
				previous: {
					dropTargets: [],
				},
				current: initial,
			},
			source: {
				data: draggableData,
				dragHandle: null,
				element: draggableEl,
			},
			nativeSetDragImage: expect.any(Function),
		};
		expect(draggableOnGenerateDragPreview).toHaveBeenCalledWith(expected);
		expect(dropTargetOnGenerateDragPreview).toHaveBeenCalledWith({
			...expected,
			self: initial.dropTargets[0],
		});
		expect(monitorOnGenerateDragPreview).toHaveBeenCalledWith(expected);
	}

	// @ts-ignore
	requestAnimationFrame.step();

	{
		const expected: ElementEventPayloadMap['onDragStart'] = {
			location: {
				initial,
				previous: {
					dropTargets: [],
				},
				current: initial,
			},
			source: {
				data: draggableData,
				dragHandle: null,
				element: draggableEl,
			},
		};
		expect(draggableOnDragStart).toHaveBeenCalledWith(expected);
		expect(dropTargetOnDragStart).toHaveBeenCalledWith({
			...expected,
			self: initial.dropTargets[0],
		});
		expect(monitorOnDragStart).toHaveBeenCalledWith(expected);
	}

	// [A] -> [A]
	const secondInput: Input = {
		...firstInput,
		pageX: 10,
	};
	fireEvent.dragOver(A, secondInput);
	// not called until the next frame
	expect(draggableOnDrag).not.toHaveBeenCalled();
	expect(dropTargetOnDrag).not.toHaveBeenCalled();
	expect(monitorOnDrag).not.toHaveBeenCalled();
	// @ts-ignore
	requestAnimationFrame.step();

	{
		const expected: ElementEventPayloadMap['onDrag'] = {
			location: {
				initial,
				previous: {
					dropTargets: initial.dropTargets,
				},
				current: {
					dropTargets: initial.dropTargets,
					input: secondInput,
				},
			},
			source: {
				data: draggableData,
				dragHandle: null,
				element: draggableEl,
			},
		};
		expect(draggableOnDrag).toHaveBeenCalledWith(expected);
		expect(dropTargetOnDrag).toHaveBeenCalledWith({
			...expected,
			self: initial.dropTargets[0],
		});
		expect(monitorOnDrag).toHaveBeenCalledWith(expected);
	}

	// Now cancelling the drag. Will cause a "dragleave" and and a "drop"
	userEvent.cancel();

	// 1. the current drop target [A] will be left
	// [A] -> []
	{
		const expected: ElementEventPayloadMap['onDropTargetChange'] = {
			location: {
				initial,
				// leaving 'A'
				previous: {
					dropTargets: initial.dropTargets,
				},
				current: {
					dropTargets: [],
					input: secondInput,
				},
			},
			source: {
				data: draggableData,
				dragHandle: null,
				element: draggableEl,
			},
		};
		expect(draggableOnDropTargetChange).toHaveBeenCalledWith(expected);
		expect(monitorOnDropTargetChange).toHaveBeenCalledWith(expected);
		// A is being left
		expect(dropTargetOnDropTargetChange).toHaveBeenCalledWith({
			...expected,
			self: initial.dropTargets[0],
		});
	}

	{
		const expected: ElementEventPayloadMap['onDrop'] = {
			location: {
				initial,
				previous: {
					// This points to the dropTargets in the `onDropTargetChange` event
					// which cleared the drop targets
					dropTargets: [],
				},
				current: {
					dropTargets: [],
					// the "dragleave" does not update the input
					// also, the "drop" does not update the input
					input: secondInput,
				},
			},
			source: {
				data: draggableData,
				dragHandle: null,
				element: draggableEl,
			},
		};
		expect(draggableOnDrop).toHaveBeenCalledWith(expected);
		expect(monitorOnDrop).toHaveBeenCalledWith(expected);
		// not dropped on
		expect(dropTargetOnDrop).not.toHaveBeenCalled();
	}

	// validation
	expect(draggableOnGenerateDragPreview).toHaveBeenCalledTimes(1);
	expect(draggableOnDragStart).toHaveBeenCalledTimes(1);
	expect(draggableOnDrag).toHaveBeenCalledTimes(1);
	expect(draggableOnDropTargetChange).toHaveBeenCalledTimes(1);
	expect(draggableOnDrop).toHaveBeenCalledTimes(1);
	expect(dropTargetOnGenerateDragPreview).toHaveBeenCalledTimes(1);
	expect(dropTargetOnDragStart).toHaveBeenCalledTimes(1);
	expect(dropTargetOnDrag).toHaveBeenCalledTimes(1);
	expect(dropTargetOnDropTargetChange).toHaveBeenCalledTimes(1);
	// not dropped on
	expect(dropTargetOnDrop).toHaveBeenCalledTimes(0);
	expect(monitorOnGenerateDragPreview).toHaveBeenCalledTimes(1);
	expect(monitorOnDragStart).toHaveBeenCalledTimes(1);
	expect(monitorOnDrag).toHaveBeenCalledTimes(1);
	expect(monitorOnDropTargetChange).toHaveBeenCalledTimes(1);
	expect(monitorOnDrop).toHaveBeenCalledTimes(1);

	cleanup();
});

test('scenario: [B, A] -> [A] -> drop', () => {
	const [draggableEl, B, A] = getBubbleOrderedTree();
	draggableEl.setAttribute('data-draggable-el', 'true');
	A.setAttribute('data-drop-target', 'true');
	const monitorOnGenerateDragPreview = jest.fn();
	const monitorOnDragStart = jest.fn();
	const monitorOnDrag = jest.fn();
	const monitorOnDropTargetChange = jest.fn();
	const monitorOnDrop = jest.fn();
	const AOnGenerateDragPreview = jest.fn();
	const AOnDragStart = jest.fn();
	const AOnDrag = jest.fn();
	const AOnDropTargetChange = jest.fn();
	const AOnDrop = jest.fn();
	const BOnGenerateDragPreview = jest.fn();
	const BOnDragStart = jest.fn();
	const BOnDrag = jest.fn();
	const BOnDropTargetChange = jest.fn();
	const BOnDrop = jest.fn();
	const draggableOnGenerateDragPreview = jest.fn();
	const draggableOnDragStart = jest.fn();
	const draggableOnDrag = jest.fn();
	const draggableOnDropTargetChange = jest.fn();
	const draggableOnDrop = jest.fn();
	const draggableData = { name: 'Alex' };
	const getInitialData = () => draggableData;
	const AData = { type: 'A' };
	const BData = { type: 'B' };

	const firstInput: Input = {
		...getDefaultInput(),
		pageX: 5,
	};
	const cleanup = combine(
		appendToBody(A),
		dropTargetForElements({
			element: A,
			getData: () => AData,
			onGenerateDragPreview: AOnGenerateDragPreview,
			onDragStart: AOnDragStart,
			onDrag: AOnDrag,
			onDropTargetChange: AOnDropTargetChange,
			onDrop: AOnDrop,
		}),
		dropTargetForElements({
			element: B,
			getData: () => BData,
			onGenerateDragPreview: BOnGenerateDragPreview,
			onDragStart: BOnDragStart,
			onDrag: BOnDrag,
			onDropTargetChange: BOnDropTargetChange,
			onDrop: BOnDrop,
		}),
		monitorForElements({
			onGenerateDragPreview: monitorOnGenerateDragPreview,
			onDragStart: monitorOnDragStart,
			onDrag: monitorOnDrag,
			onDropTargetChange: monitorOnDropTargetChange,
			onDrop: monitorOnDrop,
		}),
		draggable({
			element: draggableEl,
			getInitialData,
			onGenerateDragPreview: draggableOnGenerateDragPreview,
			onDragStart: draggableOnDragStart,
			onDrag: draggableOnDrag,
			onDropTargetChange: draggableOnDropTargetChange,
			onDrop: draggableOnDrop,
		}),
	);

	// Lifting in [B, A]
	fireEvent.dragStart(draggableEl, firstInput);

	const initial: DragLocation = {
		input: firstInput,
		dropTargets: [
			{
				element: B,
				data: BData,
				isActiveDueToStickiness: false,
				dropEffect: 'move',
			},
			{
				element: A,
				data: AData,
				isActiveDueToStickiness: false,
				dropEffect: 'move',
			},
		],
	};

	{
		const expected: ElementEventPayloadMap['onGenerateDragPreview'] = {
			location: {
				initial,
				previous: {
					dropTargets: [],
				},
				current: initial,
			},
			source: {
				data: draggableData,
				dragHandle: null,
				element: draggableEl,
			},
			nativeSetDragImage: expect.any(Function),
		};
		expect(draggableOnGenerateDragPreview).toHaveBeenCalledWith(expected);
		expect(BOnGenerateDragPreview).toHaveBeenCalledWith({
			...expected,
			self: initial.dropTargets[0],
		});
		expect(AOnGenerateDragPreview).toHaveBeenCalledWith({
			...expected,
			self: initial.dropTargets[1],
		});

		expect(monitorOnGenerateDragPreview).toHaveBeenCalledWith(expected);
	}

	// @ts-ignore
	requestAnimationFrame.step();

	{
		const expected: ElementEventPayloadMap['onDragStart'] = {
			location: {
				initial,
				previous: {
					dropTargets: [],
				},
				current: initial,
			},
			source: {
				data: draggableData,
				dragHandle: null,
				element: draggableEl,
			},
		};
		expect(draggableOnDragStart).toHaveBeenCalledWith(expected);
		expect(BOnDragStart).toHaveBeenCalledWith({
			...expected,
			self: initial.dropTargets[0],
		});
		expect(AOnDragStart).toHaveBeenCalledWith({
			...expected,
			self: initial.dropTargets[1],
		});
		expect(monitorOnDragStart).toHaveBeenCalledWith(expected);
	}

	// [B, A] -> [A]
	const secondInput: Input = {
		...firstInput,
		pageX: 10,
	};
	fireEvent.dragEnter(A, secondInput);
	{
		const expected: ElementEventPayloadMap['onDropTargetChange'] = {
			location: {
				initial,
				previous: {
					dropTargets: initial.dropTargets,
				},
				current: {
					// now only over A
					dropTargets: [initial.dropTargets[1]],
					input: secondInput,
				},
			},
			source: {
				data: draggableData,
				dragHandle: null,
				element: draggableEl,
			},
		};
		expect(draggableOnDropTargetChange).toHaveBeenCalledWith(expected);
		expect(BOnDropTargetChange).toHaveBeenCalledWith({
			...expected,
			self: initial.dropTargets[0],
		});
		expect(AOnDropTargetChange).toHaveBeenCalledWith({
			...expected,
			self: initial.dropTargets[1],
		});
		expect(monitorOnDropTargetChange).toHaveBeenCalledWith(expected);
	}

	// [A] -> drop
	const thirdInput: Input = {
		...firstInput,
		pageX: 11,
	};

	fireEvent.drop(A, thirdInput);

	{
		const expected: ElementEventPayloadMap['onDrop'] = {
			location: {
				initial,
				// Previous points to our last `onDropTargetChange`
				previous: {
					// [A]
					dropTargets: [initial.dropTargets[1]],
				},
				current: {
					// [A]
					dropTargets: [initial.dropTargets[1]],
					// not recapturing the in "drop", using the previous input
					input: secondInput,
				},
			},
			source: {
				data: draggableData,
				dragHandle: null,
				element: draggableEl,
			},
		};
		expect(draggableOnDrop).toHaveBeenCalledWith(expected);
		expect(monitorOnDrop).toHaveBeenCalledWith(expected);
		expect(AOnDrop).toHaveBeenCalledWith({
			...expected,
			self: initial.dropTargets[1],
		});
		expect(BOnDrop).not.toHaveBeenCalledWith();
	}

	// validation
	expect(draggableOnGenerateDragPreview).toHaveBeenCalledTimes(1);
	expect(AOnGenerateDragPreview).toHaveBeenCalledTimes(1);
	expect(monitorOnGenerateDragPreview).toHaveBeenCalledTimes(1);

	expect(draggableOnDragStart).toHaveBeenCalledTimes(1);
	expect(AOnDragStart).toHaveBeenCalledTimes(1);
	expect(monitorOnDragStart).toHaveBeenCalledTimes(1);

	// no drags
	expect(draggableOnDrag).toHaveBeenCalledTimes(0);
	expect(AOnDrag).toHaveBeenCalledTimes(0);
	expect(monitorOnDrag).toHaveBeenCalledTimes(0);

	// [A] => []
	expect(draggableOnDropTargetChange).toHaveBeenCalledTimes(1);
	expect(AOnDropTargetChange).toHaveBeenCalledTimes(1);
	expect(monitorOnDropTargetChange).toHaveBeenCalledTimes(1);

	// we had a drop on [A]
	expect(draggableOnDrop).toHaveBeenCalledTimes(1);
	expect(BOnDrop).not.toHaveBeenCalledTimes(1);
	expect(AOnDrop).toHaveBeenCalledTimes(1);
	expect(monitorOnDrop).toHaveBeenCalledTimes(1);

	cleanup();
});

test('scenario: [A] -> [A] -> drop', () => {
	const [draggableEl, A] = getBubbleOrderedTree();
	draggableEl.setAttribute('data-draggable-el', 'true');
	A.setAttribute('data-drop-target', 'true');
	const monitorOnGenerateDragPreview = jest.fn();
	const monitorOnDragStart = jest.fn();
	const monitorOnDrag = jest.fn();
	const monitorOnDropTargetChange = jest.fn();
	const monitorOnDrop = jest.fn();
	const dropTargetOnGenerateDragPreview = jest.fn();
	const dropTargetOnDragStart = jest.fn();
	const dropTargetOnDrag = jest.fn();
	const dropTargetOnDropTargetChange = jest.fn();
	const dropTargetOnDrop = jest.fn();
	const draggableOnGenerateDragPreview = jest.fn();
	const draggableOnDragStart = jest.fn();
	const draggableOnDrag = jest.fn();
	const draggableOnDropTargetChange = jest.fn();
	const draggableOnDrop = jest.fn();
	const draggableData = { name: 'Alex' };
	const getInitialData = () => draggableData;
	const dropTargetData = { type: 'Person' };
	const getData = () => dropTargetData;

	const firstInput: Input = {
		...getDefaultInput(),
		pageX: 5,
	};
	const cleanup = combine(
		appendToBody(A),
		dropTargetForElements({
			element: A,
			getData,
			onGenerateDragPreview: dropTargetOnGenerateDragPreview,
			onDragStart: dropTargetOnDragStart,
			onDrag: dropTargetOnDrag,
			onDropTargetChange: dropTargetOnDropTargetChange,
			onDrop: dropTargetOnDrop,
		}),
		monitorForElements({
			onGenerateDragPreview: monitorOnGenerateDragPreview,
			onDragStart: monitorOnDragStart,
			onDrag: monitorOnDrag,
			onDropTargetChange: monitorOnDropTargetChange,
			onDrop: monitorOnDrop,
		}),
		draggable({
			element: draggableEl,
			getInitialData,
			onGenerateDragPreview: draggableOnGenerateDragPreview,
			onDragStart: draggableOnDragStart,
			onDrag: draggableOnDrag,
			onDropTargetChange: draggableOnDropTargetChange,
			onDrop: draggableOnDrop,
		}),
	);

	fireEvent.dragStart(draggableEl, firstInput);

	const initial: DragLocation = {
		input: firstInput,
		dropTargets: [
			{
				element: A,
				data: dropTargetData,
				isActiveDueToStickiness: false,
				dropEffect: 'move',
			},
		],
	};

	{
		const expected: ElementEventPayloadMap['onGenerateDragPreview'] = {
			location: {
				initial,
				previous: {
					dropTargets: [],
				},
				current: initial,
			},
			source: {
				data: draggableData,
				dragHandle: null,
				element: draggableEl,
			},
			nativeSetDragImage: expect.any(Function),
		};
		expect(draggableOnGenerateDragPreview).toHaveBeenCalledWith(expected);
		expect(dropTargetOnGenerateDragPreview).toHaveBeenCalledWith({
			...expected,
			self: initial.dropTargets[0],
		});
		expect(monitorOnGenerateDragPreview).toHaveBeenCalledWith(expected);
	}

	// @ts-ignore
	requestAnimationFrame.step();

	{
		const expected: ElementEventPayloadMap['onDragStart'] = {
			location: {
				initial,
				previous: {
					dropTargets: [],
				},
				current: initial,
			},
			source: {
				data: draggableData,
				dragHandle: null,
				element: draggableEl,
			},
		};
		expect(draggableOnDragStart).toHaveBeenCalledWith(expected);
		expect(dropTargetOnDragStart).toHaveBeenCalledWith({
			...expected,
			self: initial.dropTargets[0],
		});
		expect(monitorOnDragStart).toHaveBeenCalledWith(expected);
	}

	// [A] -> [A]
	const secondInput: Input = {
		...firstInput,
		pageX: 10,
	};
	fireEvent.dragOver(A, secondInput);
	// not called until the next frame
	expect(draggableOnDrag).not.toHaveBeenCalled();
	expect(dropTargetOnDrag).not.toHaveBeenCalled();
	expect(monitorOnDrag).not.toHaveBeenCalled();
	// @ts-ignore
	requestAnimationFrame.step();

	{
		const expected: ElementEventPayloadMap['onDrag'] = {
			location: {
				initial,
				previous: {
					dropTargets: initial.dropTargets,
				},
				current: {
					dropTargets: initial.dropTargets,
					input: secondInput,
				},
			},
			source: {
				data: draggableData,
				dragHandle: null,
				element: draggableEl,
			},
		};
		expect(draggableOnDrag).toHaveBeenCalledWith(expected);
		expect(dropTargetOnDrag).toHaveBeenCalledWith({
			...expected,
			self: initial.dropTargets[0],
		});
		expect(monitorOnDrag).toHaveBeenCalledWith(expected);
	}

	// [A] -> drop
	userEvent.drop(A);

	{
		const expected: ElementEventPayloadMap['onDrop'] = {
			location: {
				initial,
				previous: {
					dropTargets: initial.dropTargets,
				},
				current: {
					dropTargets: initial.dropTargets,
					input: secondInput,
				},
			},
			source: {
				data: draggableData,
				dragHandle: null,
				element: draggableEl,
			},
		};
		expect(draggableOnDrop).toHaveBeenCalledWith(expected);
		expect(monitorOnDrop).toHaveBeenCalledWith(expected);
		expect(dropTargetOnDrop).toHaveBeenCalledWith({
			...expected,
			self: initial.dropTargets[0],
		});
	}

	// validation
	expect(draggableOnGenerateDragPreview).toHaveBeenCalledTimes(1);
	expect(draggableOnDragStart).toHaveBeenCalledTimes(1);
	expect(draggableOnDrag).toHaveBeenCalledTimes(1);
	expect(draggableOnDropTargetChange).toHaveBeenCalledTimes(0);
	expect(draggableOnDrop).toHaveBeenCalledTimes(1);
	expect(dropTargetOnGenerateDragPreview).toHaveBeenCalledTimes(1);
	expect(dropTargetOnDragStart).toHaveBeenCalledTimes(1);
	expect(dropTargetOnDrag).toHaveBeenCalledTimes(1);
	expect(dropTargetOnDropTargetChange).toHaveBeenCalledTimes(0);
	expect(dropTargetOnDrop).toHaveBeenCalledTimes(1);
	expect(monitorOnGenerateDragPreview).toHaveBeenCalledTimes(1);
	expect(monitorOnDragStart).toHaveBeenCalledTimes(1);
	expect(monitorOnDrag).toHaveBeenCalledTimes(1);
	expect(monitorOnDropTargetChange).toHaveBeenCalledTimes(0);
	expect(monitorOnDrop).toHaveBeenCalledTimes(1);

	cleanup();
});
