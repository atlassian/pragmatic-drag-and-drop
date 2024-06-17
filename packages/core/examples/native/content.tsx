/** @jsx jsx */
import { useEffect, useRef, useState } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';
import invariant from 'tiny-invariant';

import { Stack } from '@atlaskit/primitives';
import { token } from '@atlaskit/tokens';

import { draggable } from '../../src/entry-point/element/adapter';
import { scrollJustEnoughIntoView } from '../../src/entry-point/element/scroll-just-enough-into-view';
import { setCustomNativeDragPreview } from '../../src/entry-point/element/set-custom-native-drag-preview';

import avatarUrl from './avatar.png';

const cardStyles = css({
	display: 'flex',
	flexDirection: 'column',
	padding: 'var(--grid)',
	borderRadius: 'var(--border-radius)',
	boxShadow: `0px 0px 1px rgba(9, 30, 66, 0.31), 0px 1px 1px rgba(9, 30, 66, 0.25)`,
	userSelect: 'none',
	background: token('elevation.surface.raised', '#FFF'),
	width: '150px',
	justifyContent: 'center',
});

type CardState = 'idle' | 'generate-preview' | 'dragging';
const cardText: { [State in CardState]: string } = {
	'generate-preview': '📸 Drag preview',
	idle: '👋 Draggable',
	dragging: '🏠 Draggable source',
};

const cardTextStyles = css({
	margin: 0,
});
const cardTextDraggingStyles = css({
	color: token('color.text.disabled', '#091E424F'),
});

function Card() {
	const ref = useRef<HTMLDivElement | null>(null);
	const [state, setState] = useState<CardState>('idle');

	useEffect(() => {
		const el = ref.current;
		invariant(el);
		return draggable({
			element: el,
			getInitialData: () => ({ type: 'card', itemId: 'fake-item-id-1' }),
			onGenerateDragPreview: ({ source }) => {
				scrollJustEnoughIntoView({ element: source.element });
				setState('generate-preview');
			},
			onDragStart: () => setState('dragging'),
			onDrop: () => setState('idle'),
		});
	}, []);

	return (
		<div ref={ref} css={cardStyles}>
			<h5 css={[cardTextStyles, state === 'dragging' ? cardTextDraggingStyles : undefined]}>
				{cardText[state]}
			</h5>
		</div>
	);
}

function CardWithExternal() {
	const ref = useRef<HTMLDivElement | null>(null);
	const [state, setState] = useState<CardState>('idle');

	useEffect(() => {
		const el = ref.current;
		invariant(el);
		return draggable({
			element: el,
			getInitialData: () => ({ type: 'card', itemId: 'fake-item-id-1' }),
			getInitialDataForExternal: () => ({
				'text/uri-list': 'https://the-other-window',
			}),
			onGenerateDragPreview: ({ source }) => {
				scrollJustEnoughIntoView({ element: source.element });
				setState('generate-preview');
			},
			onDragStart: () => setState('dragging'),
			onDrop: () => setState('idle'),
		});
	}, []);

	return (
		<div ref={ref} css={cardStyles}>
			<h5 css={[cardTextStyles, state === 'dragging' ? cardTextDraggingStyles : undefined]}>
				{cardText[state]}
			</h5>
			<small>This card also attaches a url that can be dragged into external windows</small>
			<img src={avatarUrl} width="40" height="40" />
		</div>
	);
}

function DraggableAnchor() {
	const ref = useRef<HTMLAnchorElement | null>(null);
	useEffect(() => {
		const element = ref.current;
		invariant(element);

		return draggable({
			element,
		});
	}, []);
	return (
		<a href="#controlled" ref={ref}>
			Anchor that is also a draggable()
		</a>
	);
}

function DraggableAnchorWithNewUrl() {
	const ref = useRef<HTMLAnchorElement | null>(null);
	useEffect(() => {
		const element = ref.current;
		invariant(element);

		return draggable({
			element,
			getInitialDataForExternal: () => ({
				'text/uri-list': 'https://domevents.dev',
				'application/x.custom': 'My custom value',
			}),
		});
	}, []);
	return (
		<a href="#controlled" ref={ref}>
			Link that is also a draggable() - with a new url
		</a>
	);
}

function DraggableAnchorWithCustomPreview() {
	const ref = useRef<HTMLAnchorElement | null>(null);
	useEffect(() => {
		const element = ref.current;
		invariant(element);

		return draggable({
			element,
			onGenerateDragPreview({ nativeSetDragImage }) {
				setCustomNativeDragPreview({
					nativeSetDragImage,
					render({ container }) {
						const preview = document.createElement('div');
						preview.textContent = 'Preview';
						Object.assign(preview.style, {
							padding: '20px',
							background: 'lightblue',
						});
						container.appendChild(preview);
					},
				});
			},
		});
	}, []);
	return (
		<a href="#controlled" ref={ref}>
			Link that is also a draggable() (custom preview)
		</a>
	);
}

function DraggableImage() {
	const ref = useRef<HTMLImageElement | null>(null);
	useEffect(() => {
		const element = ref.current;
		invariant(element);

		return draggable({
			element,
		});
	}, []);
	return <img src={avatarUrl} ref={ref} width="40" height="40" />;
}

function DraggableImageWithCustomPreview() {
	const ref = useRef<HTMLImageElement | null>(null);
	useEffect(() => {
		const element = ref.current;
		invariant(element);

		return draggable({
			element,
			onGenerateDragPreview({ nativeSetDragImage }) {
				setCustomNativeDragPreview({
					nativeSetDragImage,
					render({ container }) {
						const preview = document.createElement('div');
						preview.textContent = 'Preview';
						Object.assign(preview.style, {
							padding: '20px',
							background: 'lightblue',
						});
						container.appendChild(preview);
					},
				});
			},
		});
	}, []);
	return <img src={avatarUrl} ref={ref} width="40" height="40" />;
}

export function Content() {
	return (
		<Stack space="space.025">
			<h4>Links</h4>
			<div>
				<ul>
					<li>
						<a href="#standalone">Standalone link</a>
					</li>
					<li>
						<a href="#side-by">Side by</a>
						<a href="#side-links">side links</a>
					</li>
					<li>
						<DraggableAnchor />
					</li>
					<li>
						<DraggableAnchorWithNewUrl />
					</li>
					<li>
						<DraggableAnchorWithCustomPreview />
					</li>
				</ul>
			</div>
			<h4>Text</h4>
			<p>Here is some plain text</p>
			<h4>HTML</h4>
			<p>
				Text with{' '}
				<em>
					some <strong>nested</strong>
				</em>{' '}
				elements
			</p>
			<h4>Images</h4>
			<li>
				Uncontrolled <img src={avatarUrl} width="40" height="40" />
			</li>
			<li>
				Controlled <DraggableImage />
			</li>
			<li>
				Controlled with custom preview <DraggableImageWithCustomPreview />
			</li>

			<h4>Controlled draggables</h4>
			<Stack>
				<Card />
				<CardWithExternal />
			</Stack>
		</Stack>
	);
}
