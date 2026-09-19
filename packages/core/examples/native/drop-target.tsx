/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import React, { useEffect, useRef, useState } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';
import invariant from 'tiny-invariant';

import { token } from '@atlaskit/tokens';

import { dropTargetForExternal } from '../../src/adapter/drop-target-for-external';
import { dropTargetForElements, monitorForElements } from '../../src/adapter/element-adapter';
import { monitorForExternal } from '../../src/adapter/monitor-for-external';
import { combine } from '../../src/public-utils/combine';
import { getHTML } from '../../src/public-utils/external/get-html';
import { getText } from '../../src/public-utils/external/get-text';
import { getURLs } from '../../src/public-utils/external/get-ur-ls';
import { preventUnhandled } from '../../src/public-utils/prevent-unhandled';

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

type State = 'idle' | 'potential' | 'over';

const text: { [Key in State]: string } = {
	idle: 'Please drag something',
	potential: 'Come drag over me',
	over: 'You can drop on me',
};

export function DropTarget(): React.JSX.Element {
	const ref = useRef<HTMLDivElement | null>(null);
	const [state, setState] = useState<State>('idle');

	useEffect(() => {
		const el = ref.current;
		invariant(el);
		return combine(
			dropTargetForElements({
				element: el,
				onDragEnter: () => setState('over'),
				onDragLeave: () => setState('potential'),
			}),
			dropTargetForExternal({
				element: el,
				onDragEnter: () => setState('over'),
				onDragLeave: () => setState('potential'),
				onDrop: ({ source }) => {
					console.log('drop', {
						items: source.items,
						types: source.types,
					});
					console.log('text', getText({ source }));
					console.log('html', getHTML({ source }));
					console.log('urls', getURLs({ source }));
				},
			}),
			monitorForExternal({
				onDragStart: () => {
					setState('potential');
					preventUnhandled.start();
				},
				onDrop: () => {
					preventUnhandled.stop();
					setState('idle');
				},
			}),
			monitorForElements({
				onDragStart: () => {
					setState('potential');
				},
				onDrop: () => {
					setState('idle');
				},
			}),
		);
	}, []);
	return (
		<div
			ref={ref}
			css={[
				dropTargetStyles,
				state === 'over' ? overStyles : state === 'potential' ? potentialStyles : undefined,
			]}
		>
			<strong>{text[state]}</strong>
		</div>
	);
}
