/** @jsx jsx */
import { Fragment, type ReactNode, useEffect, useRef, useState } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';
import invariant from 'tiny-invariant';

import { token } from '@atlaskit/tokens';

import { draggable, dropTargetForElements } from '../src/entry-point/element/adapter';
import { scrollJustEnoughIntoView } from '../src/public-utils/element/scroll-just-enough-into-view';

import { fallbackColor } from './_util/fallback';
import { GlobalStyles } from './_util/global-styles';

const cardHeight = 48;
const numCards = 3;

const cardStyles = css({
	height: cardHeight,
	display: 'flex',
	flexShrink: 0,
	alignItems: 'center',
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values -- Ignored via go/DSP-18766
	boxShadow: token('elevation.shadow.raised', fallbackColor),
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values -- Ignored via go/DSP-18766
	background: token('elevation.surface.raised', fallbackColor),
	width: '100%',
	justifyContent: 'center',
	borderRadius: 'var(--border-radius)',
});

const containerStyles = css({
	display: 'flex',
	alignItems: 'center',
	flexDirection: 'column',
	/**
	 * This is intentionally too small to fit all of the cards,
	 * so that we can test the scrollJustEnoughIntoView behavior.
	 */
	height: (cardHeight * numCards) / 2,
	gap: 'var(--grid)',
	overflow: 'auto',
	width: 240,
	margin: '0 auto',
	padding: 'var(--grid)',
});

function Draggable({ testId }: { testId: string }) {
	const ref = useRef<HTMLDivElement>(null);
	const [state, setState] = useState<'idle' | 'dragging'>('idle');

	useEffect(() => {
		const element = ref.current;
		invariant(element);

		return draggable({
			element,
			onGenerateDragPreview() {
				scrollJustEnoughIntoView({ element });
				setState('dragging');
			},
			onDrop() {
				setState('idle');
			},
		});
	}, []);

	return (
		<div ref={ref} css={cardStyles} data-testid={testId} data-state={state}>
			{testId}
		</div>
	);
}

function DropTarget({ children, testId }: { children: ReactNode; testId: string }) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const element = ref.current;
		invariant(element);

		return dropTargetForElements({
			element,
		});
	}, []);

	return (
		<div ref={ref} css={containerStyles} data-testid={testId}>
			{children}
		</div>
	);
}

export default function Example() {
	return (
		<Fragment>
			<GlobalStyles />
			<DropTarget testId="container">
				{Array.from({ length: numCards }, (_, index) => {
					return <Draggable key={index} testId={`card-${index}`} />;
				})}
			</DropTarget>
		</Fragment>
	);
}
