/**
 * @jsxRuntime classic
 * @jsx jsx
 */

import { useEffect, useRef, useState } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';
import invariant from 'tiny-invariant';

import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
	draggable,
	dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { token } from '@atlaskit/tokens';

import { DropIndicator } from '../../src/box';

const itemStyles = css({
	position: 'relative',
	display: 'inline-block',
	padding: token('space.200', '16px'),
	border: `1px solid ${token('color.border', 'lightgrey')}`,
});

export default function Conditional() {
	const ref = useRef<HTMLDivElement | null>(null);
	const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

	useEffect(() => {
		const el = ref.current;
		invariant(el);
		return combine(
			draggable({
				element: el,
			}),
			dropTargetForElements({
				element: el,
				// just being simple and always using the 'top' edge
				// ideally this is set using our `@atlaskit/pragmatic-drag-and-drop-hitbox package
				onDragStart: () => setClosestEdge('top'),
				onDragEnter: () => setClosestEdge('top'),
				onDrop: () => setClosestEdge(null),
				onDragLeave: () => setClosestEdge(null),
			}),
		);
	}, []);

	return (
		<div ref={ref} css={itemStyles}>
			<span>Drag me</span>
			{/* DropIndicator is being conditionally rendered */}
			{closestEdge && <DropIndicator edge={closestEdge} />}
		</div>
	);
}
