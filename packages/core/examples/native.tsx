/** @jsx jsx */
import { Fragment, useEffect, useRef, useState } from 'react';

import { css, jsx } from '@emotion/react';
import { bindAll } from 'bind-event-listener';
import invariant from 'tiny-invariant';

import Lozenge from '@atlaskit/lozenge';
import { token } from '@atlaskit/tokens';

import { combine } from '../src/entry-point/combine';
import {
	dropTargetForElements,
	type ElementDragPayload,
	monitorForElements,
} from '../src/entry-point/element/adapter';
import {
	dropTargetForExternal,
	type ExternalDragPayload,
	monitorForExternal,
} from '../src/entry-point/external/adapter';
import { getFiles } from '../src/entry-point/external/file';
import { getHTML } from '../src/entry-point/external/html';
import { getText } from '../src/entry-point/external/text';
import { getURLs } from '../src/entry-point/external/url';
import { preventUnhandled } from '../src/entry-point/prevent-unhandled';
import {
	dropTargetForTextSelection,
	monitorForTextSelection,
	type TextSelectionDragPayload,
} from '../src/entry-point/text-selection/adapter';

import { fallbackColor } from './_util/fallback';
import { GlobalStyles } from './_util/global-styles';
import { Content } from './native/content';

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

const appStyles = css({
	display: 'grid',
	gridTemplateColumns: '1fr 1fr',
	padding: 'var(--grid)',
	gap: 'calc(var(--grid) * 2)',
	maxWidth: '800px',
});

type DragState =
	| {
			type: 'idle';
	  }
	| {
			type: 'dragging-external';
			payload: ExternalDragPayload;
	  }
	| {
			type: 'dragging-text-selection';
			payload: TextSelectionDragPayload;
	  }
	| {
			type: 'dragging-controlled';
			payload: ElementDragPayload;
	  };

function CurrentlyDragging() {
	const [state, setState] = useState<DragState>({ type: 'idle' });
	useEffect(() => {
		return combine(
			monitorForElements({
				onDragStart: (args) => {
					console.log('drag starting');
					setState({ type: 'dragging-controlled', payload: args.source });
				},
				onDrop: () => {
					setState({ type: 'idle' });
				},
			}),
			monitorForExternal({
				onDragStart: (args) => {
					console.log('drag starting');
					setState({ type: 'dragging-external', payload: args.source });
				},
				onDrop: () => {
					setState({ type: 'idle' });
				},
			}),
			monitorForTextSelection({
				onDragStart: (args) => {
					console.log('drag starting');
					setState({
						type: 'dragging-text-selection',
						payload: args.source,
					});
				},
				onDrop: () => {
					setState({ type: 'idle' });
				},
			}),
		);
	}, []);

	return (
		<div>
			<h4>Drag information</h4>
			{state.type === 'dragging-external' ? (
				<Fragment>
					<div>
						<Lozenge appearance="new">External</Lozenge> - drag started from outside this window
					</div>
					{state.payload.types.length} data types being dragged
					<ul>
						{state.payload.types.map((value) => (
							<li key={value}>{value}</li>
						))}
					</ul>
				</Fragment>
			) : state.type === 'dragging-text-selection' ? (
				<Fragment>
					<div>
						<Lozenge appearance="new">Internal (text selection)</Lozenge>
					</div>
					<h3>Plain</h3>
					<code>{state.payload.plain}</code>
					<h3>HTML</h3>
					<code>{state.payload.HTML}</code>
				</Fragment>
			) : state.type === 'dragging-controlled' ? (
				<Fragment>
					<div>
						<Lozenge appearance="new">Internal (controlled)</Lozenge>
					</div>
					Data: <pre>{JSON.stringify(state.payload.data)}</pre>
				</Fragment>
			) : (
				<em>No active drag detected</em>
			)}
		</div>
	);
}

function DropTarget() {
	const ref = useRef<HTMLDivElement | null>(null);
	const [state, setState] = useState<'idle' | 'potential' | 'over'>('idle');

	useEffect(() => {
		function log(event: DragEvent) {
			console.group(event.type);
			console.log(
				event.dataTransfer?.types.reduce(
					(acc: Record<string, string | undefined>, current: string) => {
						acc[current] = event.dataTransfer?.getData(current);
						return acc;
					},
					{},
				),
			);

			console.groupEnd();
		}
		return bindAll(window, [
			{
				type: 'dragstart',
				listener: log,
			},
			{
				type: 'drop',
				listener: log,
			},
			{
				type: 'drop',
				listener(event) {
					const files = Array.from(event.dataTransfer?.items ?? []).filter(
						(item) => item.kind === 'file',
					);
					console.log('files', files);
				},
			},
			{
				type: 'dragenter',
				listener(event) {
					// allow drop anywhere
					event.preventDefault();
				},
			},
			{
				type: 'dragover',
				listener(event) {
					// allow drop anywhere
					event.preventDefault();
				},
			},
		]);
	}, []);

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
					console.log('drop: native', {
						items: source.items,
						types: source.types,
					});
					console.log('drop: access', {
						text: getText({ source }),
						urls: getURLs({ source }),
						html: getHTML({ source }),
						files: getFiles({ source }),
					});
				},
			}),
			dropTargetForTextSelection({
				element: el,
				onDragStart: () => setState('over'),
				onDragEnter: () => setState('over'),
				onDragLeave: () => setState('potential'),
				onDrop: ({ source }) => {
					console.log('drop: text selection', source);
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
			monitorForTextSelection({
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
			<strong>Drag onto me!</strong>
		</div>
	);
}

function App() {
	return (
		<div css={appStyles}>
			<Content />
			<div>
				<DropTarget />
				<CurrentlyDragging />
			</div>
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
