/** @jsx jsx */
import { Fragment, useEffect, useRef, useState } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx, type SerializedStyles } from '@emotion/react';
import ReactDOM from 'react-dom';

import { combine } from '../src/entry-point/combine';
import { draggable, dropTargetForElements } from '../src/entry-point/element/adapter';
import { setCustomNativeDragPreview } from '../src/entry-point/element/set-custom-native-drag-preview';
import { preserveOffsetOnSource } from '../src/public-utils/element/custom-native-drag-preview/preserve-offset-on-source';

type CardDragState = 'idle' | 'preview' | 'dragging';

const cardDragStateStyles: Partial<Record<CardDragState, SerializedStyles>> = {
	dragging: css({
		opacity: 0.4,
	}),
};

const cardStyles = css({
	width: '200px',
	border: '1px solid red',
	boxSizing: 'border-box',
});

function Card({ id, isPreview = false }: { id: string; isPreview?: boolean }) {
	const cardRef = useRef<HTMLDivElement | null>(null);
	const [dragState, setDragState] = useState<CardDragState>('idle');
	const [previewContainer, setPreviewContainer] = useState<HTMLElement | null>(null);

	useEffect(() => {
		if (!cardRef.current) {
			return undefined;
		}

		return combine(
			draggable({
				element: cardRef.current,
				canDrag: () => !isPreview,
				onGenerateDragPreview: ({ nativeSetDragImage, location, source }) => {
					setDragState('preview');
					setCustomNativeDragPreview({
						getOffset: preserveOffsetOnSource({
							element: source.element,
							input: location.current.input,
						}),
						render: ({ container }) => {
							setPreviewContainer(container);
							return () => {
								setPreviewContainer(null);
							};
						},
						nativeSetDragImage,
					});
				},
				getInitialData() {
					return { id };
				},
				onDragStart() {
					setDragState('dragging');
				},
				onDrop() {
					setDragState('idle');
				},
			}),
			dropTargetForElements({
				element: cardRef.current,
				getData() {
					return { id };
				},
			}),
		);
	}, [id, isPreview]);

	return (
		<Fragment>
			<div ref={cardRef} css={[cardStyles, cardDragStateStyles[dragState]]}>
				{`id: ${id}`}
			</div>
			{previewContainer
				? ReactDOM.createPortal(<Card id={id} isPreview />, previewContainer)
				: null}
		</Fragment>
	);
}

const cardListStyles = css({
	padding: 0,
	listStyle: 'none',
});

function CardList({ cardIds }: { cardIds: string[] }) {
	return (
		<ul css={cardListStyles}>
			{cardIds.map((id) => (
				<li>
					<Card id={id} />
				</li>
			))}
		</ul>
	);
}

export default function Example() {
	const cardIds = ['A', 'B', 'C', 'D', 'E'];

	return <CardList cardIds={cardIds} />;
}
