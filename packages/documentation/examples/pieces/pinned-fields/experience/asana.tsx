import React, { type ReactNode, type RefObject, useEffect, useRef } from 'react';

import invariant from 'tiny-invariant';

import DragHandleVerticalIcon from '@atlaskit/icon/core/migration/drag-handle-vertical--drag-handler';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import { useSortableField } from '../../hooks/use-sortable-field';
import { DropIndicator } from '../primitives/asana/drop-indicator';
import { Field, FieldPreview } from '../primitives/asana/field';
import AsanaFieldsTemplate, { type DraggableFieldProps } from '../templates/asana';

const type = 'asana';

function DragPreview({
	fieldRef,
	children,
}: {
	children: ReactNode;
	fieldRef: RefObject<HTMLElement>;
}) {
	const previewRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const previewElement = previewRef.current;
		invariant(previewElement);

		const fieldElement = fieldRef.current;
		invariant(fieldElement);

		const initialFieldRect = fieldElement.getBoundingClientRect();

		return monitorForElements({
			onDrag({ location }) {
				const { current, initial } = location;

				const alignmentX = initialFieldRect.x - initial.input.clientX;
				const alignmentY = initialFieldRect.y - initial.input.clientY;

				const offsetX = current.input.clientX + alignmentX;
				const offsetY = current.input.clientY + alignmentY;

				const transform = `translate(${offsetX}px, ${offsetY}px)`;

				Object.assign(previewElement.style, {
					transform,
					opacity: 1,
				});
			},
		});
	}, [fieldRef]);

	return (
		<div
			ref={previewRef}
			style={{
				// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
				position: 'fixed',
				// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
				top: 0,
				// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
				left: 0,
				// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
				opacity: 0,
				// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
				pointerEvents: 'none',
				// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
				zIndex: 999,
			}}
		>
			<FieldPreview>{children}</FieldPreview>
		</div>
	);
}

function DraggableField({ index, item }: DraggableFieldProps) {
	const ref = useRef<HTMLDivElement>(null);

	const { isHovering, isDragging, closestEdge } = useSortableField({
		id: item.id,
		index,
		type,
		ref,
		shouldHideDropIndicatorForNoopTargets: false,
		isSticky: false,
		shouldHideNativeDragPreview: true,
	});

	return (
		<Field
			ref={ref}
			icon={
				isHovering ? (
					<DragHandleVerticalIcon color="currentColor" spacing="spacious" label="" size="small" />
				) : (
					item.icon
				)
			}
		>
			{item.label}
			{closestEdge && <DropIndicator edge={closestEdge} />}
			{isDragging && <DragPreview fieldRef={ref}>{item.label}</DragPreview>}
		</Field>
	);
}

export default function AsanaFields(): React.JSX.Element {
	return <AsanaFieldsTemplate instanceId={type} DraggableField={DraggableField} />;
}
