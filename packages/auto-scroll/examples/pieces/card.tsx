import React, { Fragment, useEffect, useRef, useState } from 'react';

import { createPortal } from 'react-dom';
import invariant from 'tiny-invariant';

import { durations, easeInOut } from '@atlaskit/motion';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
	draggable,
	dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { preserveOffsetOnSource } from '@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
// eslint-disable-next-line @atlaskit/design-system/no-emotion-primitives -- to be migrated to @atlaskit/primitives/compiled – go/akcss
import { Box, xcss } from '@atlaskit/primitives';

const cardStyles = xcss({
	height: 'size.400',
	borderWidth: 'border.width',
	borderColor: 'color.border.accent.purple',
	borderStyle: 'solid',
	backgroundColor: 'color.background.accent.purple.subtler',
	borderRadius: 'border.radius',
	transitionProperty: 'background-color, opacity',
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-values, @atlaskit/ui-styling-standard/no-imported-style-values
	transitionDuration: `${durations.medium}ms`,
	transitionTimingFunction: easeInOut,

	display: 'flex',
	alignItems: 'center',
	padding: 'space.050',
});

type TItem = { id: string };

type CardState =
	| { type: 'idle' }
	| { type: 'preview'; container: HTMLElement; rect: DOMRect }
	| { type: 'is-dragging' }
	| { type: 'is-over' };

const cardStateStyles: {
	[Key in CardState['type']]: ReturnType<typeof xcss> | undefined;
} = {
	idle: undefined,
	preview: undefined,
	'is-dragging': xcss({ opacity: 0.4 }),
	'is-over': xcss({
		backgroundColor: 'color.background.accent.purple.subtler.hovered',
	}),
};

const idle: CardState = { type: 'idle' };
const isDragging: CardState = { type: 'is-dragging' };
const isOver: CardState = { type: 'is-over' };

export function Card({ item }: { item: TItem }) {
	const ref = useRef<HTMLDivElement | null>(null);
	const [state, setState] = useState<CardState>(idle);

	useEffect(() => {
		const element = ref.current;
		invariant(element);

		return combine(
			draggable({
				element,
				onGenerateDragPreview: ({ source, nativeSetDragImage, location }) => {
					// Using a custom native drag preview
					// so that we get a nicer border radius on
					// the preview 👩‍🍳🤌
					setCustomNativeDragPreview({
						nativeSetDragImage,
						getOffset: preserveOffsetOnSource({
							element: source.element,
							input: location.initial.input,
						}),
						render({ container }) {
							setState({
								type: 'preview',
								container,
								rect: element.getBoundingClientRect(),
							});
							return () => setState(isDragging);
						},
					});
				},
				onDragStart: () => setState(isDragging),
				onDrop: () => setState(idle),
			}),
			dropTargetForElements({
				element,
				getIsSticky: () => true,
				canDrop: ({ source }) => source.element !== element,
				onDragStart: () => setState(isOver),
				onDragEnter: () => setState(isOver),
				onDragLeave: () => setState(idle),
				onDrop: () => setState(idle),
			}),
		);
	}, []);

	return (
		<Fragment>
			<Box ref={ref} xcss={[cardStyles, cardStateStyles[state.type]]} testId={item.id} />
			{state.type === 'preview'
				? createPortal(<CardPreview rect={state.rect} />, state.container)
				: null}
		</Fragment>
	);
}

function CardPreview({ rect }: { rect: DOMRect }) {
	return <Box xcss={cardStyles} style={{ width: rect.width, height: rect.height }} />;
}
