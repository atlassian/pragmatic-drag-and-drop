/** @jsx jsx */
import { type RefObject, useRef } from 'react';

import { css, jsx } from '@emotion/react';
import ReactDOM from 'react-dom';

import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';

import { useFlashOnDrop } from '../../hooks/use-flash-on-drop';
import { type DragState, useSortableField } from '../../hooks/use-sortable-field';
import {
	Subtask,
	type SubtaskAppearance,
	SubtaskPreview,
	type SubtaskProps,
} from '../primitives/linear/subtask';
import { type DraggableSubtaskProps } from '../templates/_base';
import { LinearTemplate } from '../templates/linear';

const type = 'subtasks--linear-clone--native-preview';

const draggableSubtaskStyles = css({ cursor: 'grab', position: 'relative' });

const stateToAppearanceMap: Record<DragState, SubtaskAppearance> = {
	idle: 'default',
	preview: 'overlay',
	dragging: 'disabled',
};

function DragPreview({
	subtaskRef,
	children,
	...props
}: SubtaskProps & { subtaskRef: RefObject<HTMLElement> }) {
	return <SubtaskPreview {...props}>{children}</SubtaskPreview>;
}

function DraggableSubtask({ index, item }: DraggableSubtaskProps) {
	const { id, title } = item;

	const ref = useRef<HTMLDivElement>(null);

	const { dragState, isHovering, closestEdge } = useSortableField({
		id,
		index,
		type,
		ref,
		isSticky: false,
		onGenerateDragPreview({ nativeSetDragImage }) {
			return setCustomNativeDragPreview({
				nativeSetDragImage,
				render({ container }) {
					ReactDOM.render(<DragPreview subtaskRef={ref} id={id} title={title} />, container);
					return () => ReactDOM.unmountComponentAtNode(container);
				},
				getOffset() {
					return { x: 16, y: 16 };
				},
			});
		},
	});

	useFlashOnDrop({ ref, draggableId: id, type });

	return (
		<Subtask
			ref={ref}
			id={id}
			title={title}
			appearance={stateToAppearanceMap[dragState]}
			isHovering={isHovering && dragState === 'idle'}
			css={draggableSubtaskStyles}
		>
			{closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
		</Subtask>
	);
}

export default function LinearTaskReorderingNativePreview() {
	return <LinearTemplate instanceId={type} DraggableSubtask={DraggableSubtask} />;
}
