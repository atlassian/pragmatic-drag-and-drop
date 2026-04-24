/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import React, { Fragment, useEffect, useRef, useState } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';
import invariant from 'tiny-invariant';

import { token } from '@atlaskit/tokens';

import { combine } from '../src/entry-point/combine';
import { dropTargetForExternal, monitorForExternal } from '../src/entry-point/external/adapter';
import { containsFiles, getFiles } from '../src/entry-point/external/file';
import { preventUnhandled } from '../src/entry-point/prevent-unhandled';

import { GlobalStyles } from './_util/global-styles';

const fileStyles = css({
	display: 'flex',
	padding: 'calc(var(--grid) * 6) calc(var(--grid) * 4)',
	alignItems: 'center',
	justifyContent: 'center',
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values -- Ignored via go/DSP-18766
	background: token('elevation.surface.sunken'),
	borderRadius: 'var(--border-radius)',
	// Use `color.text.subtlest` (not `color.text.disabled`) so the placeholder
	// label meets WCAG AA contrast against the sunken background.
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values -- Ignored via go/DSP-18766
	color: token('color.text.subtlest'),
	fontSize: '1.4rem',
});

const overStyles = css({
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values -- Ignored via go/DSP-18766
	background: token('color.background.selected.hovered'),
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values -- Ignored via go/DSP-18766
	color: token('color.text.selected'),
});

const potentialStyles = css({
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values -- Ignored via go/DSP-18766
	background: token('color.background.discovery'),
});

const appStyles = css({
	display: 'flex',
	padding: 'var(--grid)',
	alignItems: 'center',
	gap: 'calc(var(--grid) * 2)',
	flexDirection: 'column',
});

function FileList({ uploads }: { uploads: File[] }) {
	if (!uploads.length) {
		return null;
	}
	return (
		<ul data-testid="dropped-files">
			{uploads.map((upload, index) => (
				<li key={index}>{upload.name}</li>
			))}
		</ul>
	);
}

function Uploader() {
	const ref = useRef<HTMLDivElement | null>(null);
	const [state, setState] = useState<'idle' | 'potential' | 'over'>('idle');
	const [uploads, setUploads] = useState<File[]>([]);

	useEffect(() => {
		const el = ref.current;
		invariant(el);
		return combine(
			dropTargetForExternal({
				element: el,
				canDrop: containsFiles,
				onDragEnter: () => setState('over'),
				onDragLeave: () => setState('potential'),
				onDrop: ({ source }) => {
					if (!source.items) {
						return;
					}

					const files: File[] = getFiles({ source });
					setUploads((current) => [...files, ...current]);
				},
			}),
			monitorForExternal({
				canMonitor: containsFiles,
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
					fileStyles,
					state === 'over' ? overStyles : state === 'potential' ? potentialStyles : undefined,
				]}
			>
				<strong>Drop some files on me!</strong>
			</div>
			<FileList uploads={uploads} />
		</div>
	);
}

export default function Example(): React.JSX.Element {
	return (
		<Fragment>
			<GlobalStyles />
			<Uploader />
		</Fragment>
	);
}
