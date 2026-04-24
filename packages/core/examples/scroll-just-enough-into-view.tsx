/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import { Fragment, useEffect, useRef, useState } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';
import invariant from 'tiny-invariant';

import { token } from '@atlaskit/tokens';

import { draggable } from '../src/entry-point/element/adapter';
import { scrollJustEnoughIntoView } from '../src/public-utils/element/scroll-just-enough-into-view';

import { GlobalStyles } from './_util/global-styles';
import { ScrollableDropTarget } from './_util/scrollable-drop-target';

const cardHeight = 48;
const numCards = 3;

const cardStyles = css({
	height: cardHeight,
	display: 'flex',
	flexShrink: 0,
	alignItems: 'center',
	boxShadow: token('elevation.shadow.raised'),
	background: token('elevation.surface.raised'),
	width: '100%',
	justifyContent: 'center',
	borderRadius: 'var(--border-radius)',
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

export default function Example(): React.JSX.Element {
	return (
		<Fragment>
			<GlobalStyles />
			<ScrollableDropTarget testId="container">
				{Array.from({ length: numCards }, (_, index) => {
					return <Draggable key={index} testId={`card-${index}`} />;
				})}
			</ScrollableDropTarget>
		</Fragment>
	);
}
