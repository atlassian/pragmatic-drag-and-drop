/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import React, { Fragment, useEffect, useRef, useState } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { jsx } from '@emotion/react';
import { createPortal } from 'react-dom';
import invariant from 'tiny-invariant';

// eslint-disable-next-line @atlaskit/design-system/no-emotion-primitives -- to be migrated to @atlaskit/primitives/compiled – go/akcss
import { Box, Stack, xcss } from '@atlaskit/primitives';

import { draggable } from '../src/adapter/element-adapter';
import { centerUnderPointer } from '../src/public-utils/element/custom-native-drag-preview/center-under-pointer';
import { pointerOutsideOfPreview } from '../src/public-utils/element/custom-native-drag-preview/pointer-outside-of-preview';
import { preserveOffsetOnSource } from '../src/public-utils/element/custom-native-drag-preview/preserve-offset-on-source';
import { setCustomNativeDragPreview } from '../src/public-utils/element/custom-native-drag-preview/set-custom-native-drag-preview';

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
	borderRadius: 'radius.small',
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

export default function Example(): React.JSX.Element {
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
