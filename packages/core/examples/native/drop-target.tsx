/** @jsx jsx */
import { useEffect, useRef, useState } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';
import invariant from 'tiny-invariant';

import { token } from '@atlaskit/tokens';

import { combine } from '../../src/entry-point/combine';
import { dropTargetForElements, monitorForElements } from '../../src/entry-point/element/adapter';
import { dropTargetForExternal, monitorForExternal } from '../../src/entry-point/external/adapter';
import { getHTML } from '../../src/entry-point/external/html';
import { getText } from '../../src/entry-point/external/text';
import { getURLs } from '../../src/entry-point/external/url';
import { preventUnhandled } from '../../src/entry-point/prevent-unhandled';
import { fallbackColor } from '../_util/fallback';

const dropTargetStyles = css({
	display: 'flex',
	padding: 'calc(var(--grid) * 6) calc(var(--grid) * 4)',
	alignItems: 'center',
	justifyContent: 'center',
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values -- Ignored via go/DSP-18766
	background: token('elevation.surface.sunken', fallbackColor),
	borderRadius: 'var(--border-radius)',
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values -- Ignored via go/DSP-18766
	color: token('color.text.disabled', fallbackColor),
	fontSize: '1.4rem',
});

const overStyles = css({
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values -- Ignored via go/DSP-18766
	background: token('color.background.selected.hovered', fallbackColor),
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values -- Ignored via go/DSP-18766
	color: token('color.text.selected', fallbackColor),
});

const potentialStyles = css({
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values -- Ignored via go/DSP-18766
	background: token('color.background.discovery', fallbackColor),
});

type State = 'idle' | 'potential' | 'over';

const text: { [Key in State]: string } = {
	idle: 'Please drag something',
	potential: 'Come drag over me',
	over: 'You can drop on me',
};

export function DropTarget() {
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
