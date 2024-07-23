/* eslint-disable @atlaskit/design-system/no-unsafe-design-token-usage */
/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import { useRef } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';

import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';

import { type DragState, useSortableField } from '../../hooks/use-sortable-field';
import { type ReorderItem, useTopLevelWiring } from '../../hooks/use-top-level-wiring';
import { MenuButton } from '../../menu-button';
import { initialData } from '../data';
import { Subtask, type SubtaskAppearance, type SubtaskProps } from '../primitives/subtask';
import { SubtaskContainer } from '../primitives/subtask-container';

const type = 'subtasks--current-guidelines--a11y-always-visible';

type DraggableSubtaskProps = SubtaskProps & {
	index: number;
};

const draggableSubtaskStyles = css({ cursor: 'grab', position: 'relative' });

const stateToAppearanceMap: Record<DragState, SubtaskAppearance> = {
	idle: 'default',
	preview: 'overlay',
	dragging: 'disabled',
};

function DraggableSubtask({
	index,
	id,
	reorderItem,
	data,
	...subtaskProps
}: DraggableSubtaskProps & { reorderItem: ReorderItem; data: unknown[] }) {
	const ref = useRef<HTMLDivElement>(null);

	const { dragState, closestEdge } = useSortableField({
		id,
		index,
		type,
		ref,
	});

	return (
		<Subtask
			ref={ref}
			{...subtaskProps}
			id={id}
			appearance={stateToAppearanceMap[dragState]}
			css={draggableSubtaskStyles}
			elemAfter={
				<MenuButton
					id={id}
					reorderItem={reorderItem}
					index={index}
					dataLength={data.length}
					size="small"
				/>
			}
		>
			{closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
		</Subtask>
	);
}

export default function SubtasksCurrentGuidelinesA11yAlwaysVisible() {
	const { data, reorderItem } = useTopLevelWiring({ initialData, type });

	return (
		<SubtaskContainer>
			{data.map((item, index) => (
				<DraggableSubtask
					key={item.id}
					id={item.id}
					title={item.title}
					index={index}
					reorderItem={reorderItem}
					data={data}
				/>
			))}
		</SubtaskContainer>
	);
}
