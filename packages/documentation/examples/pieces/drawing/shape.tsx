/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import { type ReactNode, useEffect, useRef } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';
import invariant from 'tiny-invariant';

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
	draggable,
	dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { token } from '@atlaskit/tokens';

const shapes = ['square', 'circle', 'triangle'] as const;

export type ShapeType = (typeof shapes)[number];

export const size = 48;
const strokeWidth = 4;

const shapeStyles = css({
	display: 'flex',
	width: size,
	height: size,
	position: 'relative',
	strokeWidth,
	stroke: token('color.border'),
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
	':nth-of-type(1)': {
		fill: token('color.background.accent.red.bolder'),
	},
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
	':nth-of-type(2)': {
		fill: token('color.background.accent.orange.bolder'),
	},
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
	':nth-of-type(3)': {
		fill: token('color.background.accent.yellow.bolder'),
	},
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
	':nth-of-type(4)': {
		fill: token('color.background.accent.green.bolder'),
	},
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
	':nth-of-type(5)': {
		fill: token('color.background.accent.blue.bolder'),
	},
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
	':nth-of-type(6)': {
		fill: token('color.background.accent.purple.bolder'),
	},
});

const shapeSVG: Record<ShapeType, ReactNode> = {
	square: (
		<rect
			x={strokeWidth / 2}
			y={strokeWidth / 2}
			width={size - strokeWidth}
			height={size - strokeWidth}
		/>
	),
	circle: <circle cx={size / 2} cy={size / 2} r={(size - strokeWidth) / 2} />,
	triangle: (
		<polygon
			points={[
				[strokeWidth, size - strokeWidth],
				[size / 2, strokeWidth],
				[size - strokeWidth, size - strokeWidth],
			].join(' ')}
		/>
	),
};

const Shape = ({
	shape,
	canDrag,
	onDrag: onDragProp,
}: {
	shape: ShapeType;
	canDrag: boolean;
	onDrag?: (args: { from: Element; to: { x: number; y: number } }) => void;
}): React.JSX.Element => {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		invariant(ref.current);
		return combine(
			draggable({
				element: ref.current,
				canDrag() {
					return canDrag;
				},
				getInitialData() {
					return { type: 'shape', shape };
				},
				onDrag({ location, source }) {
					const currentPosition = {
						x: location.current.input.clientX,
						y: location.current.input.clientY,
					};
					onDragProp?.({
						from: source.element,
						to: currentPosition,
					});
				},
				onGenerateDragPreview() {
					if (ref.current) {
						ref.current.style.opacity = '0';
					}
				},
				onDragStart() {
					if (ref.current) {
						ref.current.style.opacity = '1';
					}
				},
			}),
			dropTargetForElements({
				element: ref.current,
				getData() {
					return { type: 'shape', shape };
				},
				canDrop({ source }) {
					const isSameShape = source.data.shape === shape;
					const isDifferentElement = source.element !== ref.current;
					return isSameShape && isDifferentElement;
				},
			}),
		);
	}, [canDrag, onDragProp, shape]);

	return (
		<div css={shapeStyles} ref={ref} data-shape={shape}>
			<svg>{shapeSVG[shape]}</svg>
		</div>
	);
};

export default Shape;
