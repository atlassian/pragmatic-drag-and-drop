// This file was copied from `react-beautiful-dnd` with some adjustments.
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/test/unit/integration/util/app.jsx>

import React, { type ReactNode, useMemo, useState } from 'react';

import type {
	Direction,
	DraggableProvided,
	DraggableRubric,
	DraggableStateSnapshot,
	DroppableProvided,
	DropResult,
	Sensor,
} from 'react-beautiful-dnd';

import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';

import { DragDropContext, Draggable, Droppable } from '../../../../../../src';

function noop() {}

export type Item = {
	id: string;
	// defaults to true
	isEnabled?: boolean;
	// defaults to false
	canDragInteractiveElements?: boolean;
	// defaults to false
	shouldRespectForcePress?: boolean;
};

export type RenderItem = (
	item: Item,
) => (
	provided: DraggableProvided,
	snapshot: DraggableStateSnapshot,
	rubric: DraggableRubric,
) => React.ReactElement;

export const defaultItemRender: RenderItem =
	(item: Item) => (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
		<div
			{...provided.draggableProps}
			{...provided.dragHandleProps}
			data-is-dragging={snapshot.isDragging}
			data-is-drop-animating={snapshot.isDropAnimating}
			data-is-combining={Boolean(snapshot.combineWith)}
			data-is-combine-target={Boolean(snapshot.combineTargetFor)}
			data-is-over={snapshot.draggingOver}
			data-is-clone={snapshot.isClone}
			data-testid={item.id}
			ref={provided.innerRef}
		>
			item: {item.id}
		</div>
	);
type Props = {
	onBeforeCapture?: (...args: Array<any>) => any;
	onBeforeDragStart?: (...args: Array<any>) => any;
	onDragStart?: (...args: Array<any>) => any;
	onDragUpdate?: (...args: Array<any>) => any;
	onDragEnd?: (...args: Array<any>) => any;
	items?: Item[];
	anotherChild?: ReactNode;
	renderItem?: RenderItem;
	// droppable
	direction?: Direction;
	isCombineEnabled?: boolean;
	getContainerForClone?: () => HTMLElement;
	useClone?: boolean;
	sensors?: Sensor[];
	enableDefaultSensors?: boolean;
};

function getItems() {
	return Array.from(
		{
			length: 3,
		},
		(v, k): Item => ({
			id: `${k}`,
		}),
	);
}

function withDefaultBool(value: boolean | null | undefined, defaultValue: boolean) {
	if (typeof value === 'boolean') {
		return value;
	}

	return defaultValue;
}

export default function App(props: Props) {
	const [items, setItems] = useState(() => props.items || getItems());
	const onBeforeCapture = props.onBeforeCapture || noop;
	const onBeforeDragStart = props.onBeforeDragStart || noop;
	const onDragStart = props.onDragStart || noop;
	const onDragUpdate = props.onDragUpdate || noop;
	const onDragEndProp = props.onDragEnd;

	const onDragEnd = (result: DropResult) => {
		if (result.destination) {
			const reordered: Item[] = reorder({
				list: items,
				startIndex: result.source.index,
				finishIndex: result.destination.index,
			});

			setItems(reordered);
		}

		if (onDragEndProp) {
			onDragEndProp(result);
		}
	};

	const sensors: Sensor[] = props.sensors || [];
	const render: RenderItem = props.renderItem || defaultItemRender;
	const direction: Direction = props.direction || 'vertical';
	const isCombineEnabled: boolean = withDefaultBool(props.isCombineEnabled, false);

	const shouldUseClone = props.useClone ?? false;
	const renderClone = useMemo(() => {
		if (!shouldUseClone) {
			return undefined;
		}

		return function result(
			provided: DraggableProvided,
			snapshot: DraggableStateSnapshot,
			rubric: DraggableRubric,
		) {
			const item: Item = items[rubric.source.index];
			return render(item)(provided, snapshot, rubric);
		};
	}, [items, render, shouldUseClone]);

	return (
		<main>
			<DragDropContext
				onBeforeCapture={onBeforeCapture}
				onBeforeDragStart={onBeforeDragStart}
				onDragStart={onDragStart}
				onDragUpdate={onDragUpdate}
				onDragEnd={onDragEnd}
				sensors={sensors}
				enableDefaultSensors={props.enableDefaultSensors}
			>
				<Droppable
					droppableId="droppable"
					direction={direction}
					isCombineEnabled={isCombineEnabled}
					renderClone={renderClone}
					getContainerForClone={props.getContainerForClone}
				>
					{(droppableProvided: DroppableProvided) => (
						<div
							{...droppableProvided.droppableProps}
							ref={droppableProvided.innerRef}
							data-testid="droppable"
						>
							{items.map((item: Item, index: number) => (
								<Draggable
									key={item.id}
									draggableId={item.id}
									index={index}
									isDragDisabled={item.isEnabled === false}
									disableInteractiveElementBlocking={withDefaultBool(
										item.canDragInteractiveElements,
										false,
									)}
									shouldRespectForcePress={withDefaultBool(item.shouldRespectForcePress, false)}
								>
									{render(item)}
								</Draggable>
							))}
							{droppableProvided.placeholder}
						</div>
					)}
				</Droppable>
				{props.anotherChild || null}
			</DragDropContext>
		</main>
	);
}
