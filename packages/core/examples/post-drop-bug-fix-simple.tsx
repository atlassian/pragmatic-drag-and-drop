import React, { useEffect, useRef, useState } from 'react';

import invariant from 'tiny-invariant';

// eslint-disable-next-line @atlaskit/design-system/no-emotion-primitives -- to be migrated to @atlaskit/primitives/compiled – go/akcss
import { Box, Stack, xcss } from '@atlaskit/primitives';

import {
	draggable,
	dropTargetForElements,
	monitorForElements,
} from '../src/entry-point/element/adapter';
import { combine } from '../src/public-utils/combine';

const interactiveStyles = xcss({
	position: 'relative',
	'::before': {
		content: '""',
		position: 'absolute',
		pointerEvents: 'none',
		top: 'space.0',
		left: 'space.0',
		padding: 'space.100',
	},
	':hover::before': {
		content: '":hover"',
		backgroundColor: 'color.background.accent.green.subtler',
	},
});

const cardStyles = xcss({
	boxShadow: 'elevation.shadow.raised',
	backgroundColor: 'elevation.surface.raised',
	justifyContent: 'center',
	padding: 'space.100',
	textAlign: 'center',
	position: 'relative',
	flexShrink: 0,
	borderWidth: 'border.width',
	borderColor: 'color.border',
	borderStyle: 'solid',
});

const listStyles = xcss({
	display: 'flex',
	alignItems: 'stretch',
	flexDirection: 'column',
	width: '600px',
	margin: '0 auto',
	background: 'elevation.surface.sunken',
	height: '500px',
	overflow: 'scroll',
	position: 'relative',
});

const isOverCardStyles = xcss({
	backgroundColor: 'color.background.accent.blue.subtle',
});

function Card({ cardId }: { cardId: string }) {
	const [counts, setCounts] = useState<{
		dragstart: number;
		drop: number;
		click: number;
		mouseenter: number;
		mouseleave: number;
	}>({
		dragstart: 0,
		drop: 0,
		click: 0,
		mouseenter: 0,
		mouseleave: 0,
	});
	const [state, setState] = useState<'idle' | 'is-over'>('idle');
	const ref = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const element = ref.current;
		invariant(element);

		return combine(
			draggable({
				element,
				getInitialData: () => ({ cardId }),
				onDragStart: () =>
					setCounts((current) => ({ ...current, dragstart: current.dragstart + 1 })),
			}),
			dropTargetForElements({
				element,
				getData: () => ({ cardId }),
				onDragStart: () => setState('is-over'),
				onDragEnter: () => setState('is-over'),
				onDragLeave: () => setState('idle'),
				onDrop: () => {
					setCounts((current) => ({ ...current, drop: current.drop + 1 }));
					setState('idle');
				},
			}),
		);
	}, [cardId]);

	return (
		// eslint-disable-next-line @atlassian/a11y/interactive-element-not-keyboard-focusable
		<Box
			ref={ref}
			xcss={[cardStyles, interactiveStyles, state === 'is-over' ? isOverCardStyles : undefined]}
			testId={cardId}
			onMouseEnter={() => {
				setCounts((current) => ({ ...current, mouseenter: current.mouseenter + 1 }));
			}}
			onMouseLeave={() => {
				setCounts((current) => ({ ...current, mouseleave: current.mouseleave + 1 }));
			}}
			onClick={() => setCounts((current) => ({ ...current, click: current.click + 1 }))}
		>
			{cardId}{' '}
			<small>
				mouseenter:{counts.mouseenter} mouseleave:{counts.mouseleave} dragstart:{counts.dragstart}{' '}
				drop:
				{counts.drop}
			</small>
		</Box>
	);
}

type Card = {
	id: string;
};
function getCards() {
	return Array.from({ length: 30 }, (_, index) => ({
		id: `card-${index}`,
	}));
}

const titleStyles = xcss({
	textAlign: 'center',
});

function DropTest() {
	const [cards, setCards] = useState<Card[]>(() => getCards());
	const [dragCount, setDragCount] = useState<number>(0);
	useEffect(() => {
		return monitorForElements({
			onDrop(args) {
				const destination = args.location.current.dropTargets[0];
				if (!destination) {
					return;
				}
				const startIndex = cards.findIndex((card) => card.id === args.source.data.cardId);
				const finishIndex = cards.findIndex((card) => card.id === destination.data.cardId);

				// swapping
				const newList = [...cards];
				newList[startIndex] = cards[finishIndex];
				newList[finishIndex] = cards[startIndex];

				setCards(newList);
				setDragCount((current) => current + 1);
			},
		});
	}, [cards]);

	return (
		<Stack space="space.100">
			<Box as="h4" xcss={titleStyles}>
				Swap items on drop
			</Box>
			<Box as="h5" xcss={titleStyles} testId="drag-count">
				Drags completed: {dragCount}
			</Box>
			<Box
				xcss={[listStyles, interactiveStyles]}
				tabIndex={0}
				testId="scroll-container"
				role="region"
				aria-label="Scrollable content"
			>
				{cards.map((card) => {
					return <Card key={card.id} cardId={card.id} />;
				})}
			</Box>
		</Stack>
	);
}

export default function Example(): React.JSX.Element {
	return <DropTest />;
}
