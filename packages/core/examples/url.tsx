/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import { Fragment, useEffect, useRef, useState } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';
import invariant from 'tiny-invariant';

import { Box, Stack } from '@atlaskit/primitives';
import { token } from '@atlaskit/tokens';

import { combine } from '../src/entry-point/combine';
import { dropTargetForExternal, monitorForExternal } from '../src/entry-point/external/adapter';
import { containsURLs, getURLs } from '../src/entry-point/external/url';
import { preventUnhandled } from '../src/entry-point/prevent-unhandled';

import { GlobalStyles } from './_util/global-styles';

const dropTargetStyles = css({
	display: 'flex',
	padding: 'calc(var(--grid) * 6) calc(var(--grid) * 4)',
	alignItems: 'center',
	justifyContent: 'center',
	background: token('elevation.surface.sunken'),
	borderRadius: 'var(--border-radius)',
	color: token('color.text.disabled'),
	fontSize: '1.4rem',
});

const overStyles = css({
	background: token('color.background.selected.hovered'),
	color: token('color.text.selected'),
});

const potentialStyles = css({
	background: token('color.background.discovery'),
});

const appStyles = css({
	display: 'flex',
	padding: 'var(--grid)',
	alignItems: 'center',
	gap: 'calc(var(--grid) * 2)',
	flexDirection: 'column',
	maxWidth: '400px',
	margin: '0 auto',
});

function App() {
	const ref = useRef<HTMLDivElement | null>(null);
	const [state, setState] = useState<'idle' | 'potential' | 'over'>('idle');
	const [drops, setDrops] = useState<string[][]>([]);

	useEffect(() => {
		const el = ref.current;
		invariant(el);
		return combine(
			dropTargetForExternal({
				element: el,
				canDrop: containsURLs,
				onDragEnter: () => setState('over'),
				onDragLeave: () => setState('potential'),
				onDrop: ({ source }) => {
					if (!source.items) {
						return;
					}

					const urls: string[] = getURLs({ source });
					setDrops((current) => [...current, urls]);
				},
			}),
			monitorForExternal({
				canMonitor: containsURLs,
				onDragStart: () => {
					setState('potential');
					preventUnhandled.start();
				},
				onDrop: () => {
					preventUnhandled.stop();
					setState('idle');
				},
			}),
		);
	});
	return (
		<div css={appStyles}>
			<div
				ref={ref}
				data-testid="drop-target"
				css={[
					dropTargetStyles,
					state === 'over' ? overStyles : state === 'potential' ? potentialStyles : undefined,
				]}
			>
				<strong>Drop some URLs on me!</strong>
			</div>
			<Stack alignInline="start" space="space.100">
				{drops.map((drop, index) => (
					<Box key={index}>
						<h4>Drop {index + 1}</h4>
						<ul>
							{drop.map((url) => (
								<li key={url}>{url}</li>
							))}
						</ul>
					</Box>
				))}
			</Stack>
		</div>
	);
}

export default function Example() {
	return (
		<Fragment>
			<GlobalStyles />
			<App />
		</Fragment>
	);
}
