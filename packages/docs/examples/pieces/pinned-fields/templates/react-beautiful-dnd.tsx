/* eslint-disable @atlaskit/design-system/no-unsafe-design-token-usage */
/** @jsx jsx */

import { type ReactElement, useCallback, useState } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { jsx } from '@emotion/react';
import type {
	DragDropContextProps,
	DraggableProps,
	DroppableProps,
	OnDragEndResponder,
} from 'react-beautiful-dnd';

import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';

import { initialData } from '../data';
import { Field, type FieldProps, PinnedFieldsContainer, PinnedFieldsList } from '../index';
import { type DroppableAreaOverlayProps } from '../primitives/droppable-area-overlay';

function DraggableField({
	index,
	component,
	idPrefix,
	...fieldProps
}: FieldProps & {
	index: number;
	component: TemplateProps['Draggable'];
	idPrefix: string;
}) {
	const Draggable = component;
	const draggableId = `${idPrefix}--${fieldProps.label}`;
	return (
		<Draggable draggableId={draggableId} index={index}>
			{(provided, snapshot) => (
				<Field
					ref={provided.innerRef}
					isDragging={snapshot.isDragging}
					{...fieldProps}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
				/>
			)}
		</Draggable>
	);
}

type TemplateProps = {
	DragDropContext: React.ComponentType<DragDropContextProps>;
	Draggable: React.ComponentType<DraggableProps>;
	Droppable: React.ComponentType<DroppableProps>;

	DroppableAreaOverlay: (props: DroppableAreaOverlayProps) => ReactElement;

	idPrefix: string;
};

export default function PinnedFieldsReactBeautifulDndTemplate({
	DragDropContext,
	Draggable,
	Droppable,
	DroppableAreaOverlay,
	idPrefix,
}: TemplateProps) {
	const [data, setData] = useState(initialData);

	const onDragEnd: OnDragEndResponder = useCallback(({ source, destination }) => {
		if (!destination) {
			return;
		}

		const startIndex = source.index;
		const finishIndex = destination.index;

		setData((data) =>
			reorder({
				list: data,
				startIndex,
				finishIndex,
			}),
		);
	}, []);

	const droppableId = `${idPrefix}--droppable`;

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<PinnedFieldsContainer>
				<Droppable droppableId={droppableId}>
					{(provided, snapshot) => (
						<PinnedFieldsList ref={provided.innerRef} {...provided.droppableProps}>
							<DroppableAreaOverlay
								isDraggingFrom={Boolean(snapshot.draggingFromThisWith)}
								isDraggingOver={snapshot.isDraggingOver}
							/>
							{data.map((item, index) => (
								<DraggableField
									component={Draggable}
									key={item.label}
									label={item.label}
									index={index}
									idPrefix={idPrefix}
								>
									{item.content}
								</DraggableField>
							))}
							{provided.placeholder}
						</PinnedFieldsList>
					)}
				</Droppable>
			</PinnedFieldsContainer>
		</DragDropContext>
	);
}
