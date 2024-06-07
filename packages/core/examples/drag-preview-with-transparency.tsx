/** @jsx jsx */
import { Fragment, useEffect, useRef, useState } from 'react';

import { jsx } from '@emotion/react';
import { createPortal } from 'react-dom';
import invariant from 'tiny-invariant';

import { Box, Stack, xcss } from '@atlaskit/primitives';

import { draggable } from '../src/entry-point/element/adapter';
import { centerUnderPointer } from '../src/entry-point/element/center-under-pointer';
import { pointerOutsideOfPreview } from '../src/entry-point/element/pointer-outside-of-preview';
import { preserveOffsetOnSource } from '../src/entry-point/element/preserve-offset-on-source';
import { setCustomNativeDragPreview } from '../src/entry-point/element/set-custom-native-drag-preview';

function FakeText() {
	return (
		<div>
			If we are not careful, this text can get picked up in transparent drag previews on Safari
		</div>
	);
}

const previewStyles = xcss({
	width: 'size.1000',
	height: 'size.1000',
	backgroundColor: 'color.blanket.selected',
	borderColor: 'color.border.accent.blue',
	borderWidth: 'border.width',
	borderRadius: 'border.radius',
});
function Preview() {
	return <Box xcss={previewStyles} />;
}

const cardStyles = xcss({
	padding: 'space.100',
	backgroundColor: 'color.background.accent.blue.subtlest',
});

type ItemState =
	| { type: 'idle' }
	| { type: 'preview'; container: HTMLElement }
	| { type: 'dragging' };

function ItemNoOffset() {
	const ref = useRef<HTMLDivElement | null>(null);
	const [state, setState] = useState<ItemState>({ type: 'idle' });

	useEffect(() => {
		const element = ref.current;
		invariant(element);

		return draggable({
			element,
			onGenerateDragPreview({ nativeSetDragImage }) {
				setCustomNativeDragPreview({
					nativeSetDragImage,
					render({ container }) {
						setState({ type: 'preview', container });
						return () => setState({ type: 'dragging' });
					},
				});
			},
		});
	}, []);

	return (
		<Fragment>
			<Box ref={ref} xcss={cardStyles}>
				Standard
			</Box>
			{state.type === 'preview' ? createPortal(<Preview />, state.container) : null}
		</Fragment>
	);
}

function ItemOffsetFromPointer() {
	const ref = useRef<HTMLDivElement | null>(null);
	const [state, setState] = useState<ItemState>({ type: 'idle' });

	useEffect(() => {
		const element = ref.current;
		invariant(element);

		return draggable({
			element,
			onGenerateDragPreview({ nativeSetDragImage }) {
				setCustomNativeDragPreview({
					nativeSetDragImage,
					getOffset: pointerOutsideOfPreview({ x: '20px', y: '20px' }),
					render({ container }) {
						setState({ type: 'preview', container });
						return () => setState({ type: 'dragging' });
					},
				});
			},
		});
	}, []);

	return (
		<Fragment>
			<Box ref={ref} xcss={cardStyles}>
				Offset from pointer
			</Box>
			{state.type === 'preview' ? createPortal(<Preview />, state.container) : null}
		</Fragment>
	);
}

function ItemCenter() {
	const ref = useRef<HTMLDivElement | null>(null);
	const [state, setState] = useState<ItemState>({ type: 'idle' });

	useEffect(() => {
		const element = ref.current;
		invariant(element);

		return draggable({
			element,
			onGenerateDragPreview({ nativeSetDragImage }) {
				setCustomNativeDragPreview({
					nativeSetDragImage,
					getOffset: centerUnderPointer,
					render({ container }) {
						setState({ type: 'preview', container });
						return () => setState({ type: 'dragging' });
					},
				});
			},
		});
	}, []);

	return (
		<Fragment>
			<Box ref={ref} xcss={cardStyles}>
				Center under pointer
			</Box>
			{state.type === 'preview' ? createPortal(<Preview />, state.container) : null}
		</Fragment>
	);
}

function ItemPreserveOffsetOnSource() {
	const ref = useRef<HTMLDivElement | null>(null);
	const [state, setState] = useState<ItemState>({ type: 'idle' });

	useEffect(() => {
		const element = ref.current;
		invariant(element);

		return draggable({
			element,
			onGenerateDragPreview({ nativeSetDragImage, location }) {
				setCustomNativeDragPreview({
					nativeSetDragImage,
					getOffset: preserveOffsetOnSource({
						element,
						input: location.current.input,
					}),
					render({ container }) {
						setState({ type: 'preview', container });
						return () => setState({ type: 'dragging' });
					},
				});
			},
		});
	}, []);

	return (
		<Fragment>
			<Box ref={ref} xcss={cardStyles}>
				Preserve offset on source
			</Box>
			{state.type === 'preview' ? createPortal(<Preview />, state.container) : null}
		</Fragment>
	);
}

export default function Example() {
	return (
		<Stack space="space.050">
			<FakeText />
			<ItemNoOffset />
			<ItemOffsetFromPointer />
			<ItemCenter />
			<ItemPreserveOffsetOnSource />
		</Stack>
	);
}
