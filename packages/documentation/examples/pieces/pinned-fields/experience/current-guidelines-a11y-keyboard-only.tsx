/* eslint-disable @atlaskit/design-system/no-unsafe-design-token-usage */
/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import { useRef } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';

import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { token } from '@atlaskit/tokens';

import { useSortableField } from '../../hooks/use-sortable-field';
import { useTopLevelWiring } from '../../hooks/use-top-level-wiring';
import { MenuButton } from '../../menu-button';
import type { ReorderItem } from '../../subtasks/hooks/use-top-level-wiring';
import { initialData } from '../data';
import { Field, type FieldProps, PinnedFieldsContainer, PinnedFieldsList } from '../index';

const draggableFieldStyles = css({
	cursor: 'grab',
});

const type = 'current-guidelines--a11y-keyboard-only';

const menuButtonContainerStyles = css({
	position: 'absolute',
	top: 0,
	right: 0,
	padding: 8,
	paddingLeft: 24,
	clipPath: 'inset(0px 0px 0px -32px)',
	maskImage: 'linear-gradient(to right, transparent, black 16px)',
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
	':focus-within': {
		background: token('elevation.surface'),
	},
});

const menuButtonContainerSelectedStyles = css({
	background: token('elevation.surface'),
});

function DraggableField({
	index,
	id,
	children,
	reorderItem,
	data,
	...fieldProps
}: FieldProps & {
	id: string;
	reorderItem: ReorderItem;
	data: unknown[];
	index: number;
}) {
	const ref = useRef<HTMLDivElement>(null);

	const { isDragging, closestEdge } = useSortableField({
		id,
		index,
		type,
		ref,
	});

	return (
		<Field
			ref={ref}
			isDisabled={isDragging}
			closestEdge={closestEdge}
			css={draggableFieldStyles}
			{...fieldProps}
		>
			{children}
			<MenuButton
				id={id}
				reorderItem={reorderItem}
				index={index}
				dataLength={data.length}
				size="small"
				isOnlyVisibleWhenFocused
			>
				{({ children, isSelected }) => (
					<span css={[menuButtonContainerStyles, isSelected && menuButtonContainerSelectedStyles]}>
						{children}
					</span>
				)}
			</MenuButton>
			{closestEdge && <DropIndicator edge={closestEdge} gap="8px" />}
		</Field>
	);
}

export default function PinnedFieldsWithCurrentGuidelinesA11yKeyboardOnly() {
	const { data, reorderItem } = useTopLevelWiring({ initialData, type });

	return (
		<PinnedFieldsContainer>
			<PinnedFieldsList>
				{data.map((item, index) => (
					<DraggableField
						key={item.id}
						id={item.id}
						label={item.label}
						index={index}
						reorderItem={reorderItem}
						data={data}
					>
						{item.content}
					</DraggableField>
				))}
			</PinnedFieldsList>
		</PinnedFieldsContainer>
	);
}
