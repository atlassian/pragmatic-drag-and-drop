/* eslint-disable import/dynamic-import-chunkname */
/** @jsx jsx */
import { Fragment, useEffect, useRef, useState } from 'react';

import { css, jsx } from '@emotion/react';

import { token } from '@atlaskit/tokens';
import { importForInteraction, waitForAllResources } from '@atlassian/react-async';

import { fallbackColor } from './util/fallback';
import { GlobalStyles } from './util/global-styles';

const fileStyles = css({
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
		<ul>
			{uploads.map((upload, index) => (
				<li key={index}>{upload.name}</li>
			))}
		</ul>
	);
}

function Uploader() {
	const ref = useRef<HTMLDivElement | null>(null);
	const [state, setState] = useState<'loading' | 'idle' | 'potential' | 'over'>('loading');
	const [uploads, setUploads] = useState<File[]>([]);

	useEffect(() => {
		let cleanupDragAndDrop: null | (() => void) = null;
		const disposeResource = waitForAllResources([
			importForInteraction(
				() =>
					import(
						/* webpackChunkName: "@atlaskit/pragmatic-drag-and-drop/combine" */ '@atlaskit/pragmatic-drag-and-drop/combine'
					),
				{
					moduleId: '@atlaskit/pragmatic-drag-and-drop/combine',
				},
			),
			importForInteraction(
				() =>
					import(
						/* webpackChunkName: "@atlaskit/pragmatic-drag-and-drop/external/adapter" */ '@atlaskit/pragmatic-drag-and-drop/external/adapter'
					),
				{
					moduleId: '@atlaskit/pragmatic-drag-and-drop/external/adapter',
				},
			),
			importForInteraction(
				() =>
					import(
						/* webpackChunkName: "@atlaskit/pragmatic-drag-and-drop/external/file" */ '@atlaskit/pragmatic-drag-and-drop/external/file'
					),
				{
					moduleId: '@atlaskit/pragmatic-drag-and-drop/external/file',
				},
			),
			importForInteraction(
				() =>
					import(
						/* webpackChunkName: "@atlaskit/pragmatic-drag-and-drop/prevent-unhandled" */ '@atlaskit/pragmatic-drag-and-drop/prevent-unhandled'
					),
				{
					moduleId: '@atlaskit/pragmatic-drag-and-drop/prevent-unhandled',
				},
			),
		]).onComplete(
			([
				{ combine },
				{ dropTargetForExternal, monitorForExternal },
				{ containsFiles, getFiles },
				{ preventUnhandled },
			]) => {
				const el = ref.current;
				if (!el) {
					return;
				}
				setState('idle');

				cleanupDragAndDrop = combine(
					dropTargetForExternal({
						element: el,
						canDrop: containsFiles,
						onDragEnter: () => setState('over'),
						onDragLeave: () => setState('potential'),
						onDrop: ({ source }) => {
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
			},
			(err) => {
				console.log('error', err);
			},
		);

		return () => {
			disposeResource();
			cleanupDragAndDrop?.();
		};
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
				<strong>Drop some files on me! {state}</strong>
			</div>
			<FileList uploads={uploads} />
		</div>
	);
}

export default function Example() {
	return (
		<Fragment>
			<GlobalStyles />
			<Uploader />
		</Fragment>
	);
}
