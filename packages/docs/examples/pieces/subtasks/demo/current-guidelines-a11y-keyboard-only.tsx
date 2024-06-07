/* eslint-disable @atlaskit/design-system/no-unsafe-design-token-usage */
/** @jsx jsx */
import { useRef } from 'react';

import { css, jsx } from '@emotion/react';

import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { token } from '@atlaskit/tokens';

import { type DragState, useSortableField } from '../../hooks/use-sortable-field';
import { type ReorderItem, useTopLevelWiring } from '../../hooks/use-top-level-wiring';
import { MenuButton } from '../../menu-button';
import { initialData } from '../data';
import { Subtask, type SubtaskAppearance, type SubtaskProps } from '../primitives/subtask';
import { SubtaskContainer } from '../primitives/subtask-container';

const type = 'subtasks--current-guidelines--a11y-keyboard-only';

type DraggableSubtaskProps = SubtaskProps & {
	index: number;
};

const draggableSubtaskStyles = css({ cursor: 'grab', position: 'relative' });

const stateToAppearanceMap: Record<DragState, SubtaskAppearance> = {
	idle: 'default',
	preview: 'overlay',
	dragging: 'disabled',
};

const menuButtonContainerStyles = css({
	position: 'absolute',
	top: 0,
	right: 0,
	padding: 8,
	paddingLeft: 24,
	clipPath: 'inset(0px 0px 0px -32px)',
	maskImage: 'linear-gradient(to right, transparent, black 16px)',
	':focus-within': {
		background: token('elevation.surface'),
	},
});

const menuButtonContainerSelectedStyles = css({
	background: token('elevation.surface'),
});

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
					isOnlyVisibleWhenFocused
				>
					{({ children, isSelected }) => (
						<span
							css={[menuButtonContainerStyles, isSelected && menuButtonContainerSelectedStyles]}
						>
							{children}
						</span>
					)}
				</MenuButton>
			}
		>
			{closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
		</Subtask>
	);
}

export default function SubtasksCurrentGuidelinesA11yKeyboardOnly() {
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
