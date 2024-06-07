/** @jsx jsx */
import { forwardRef, type RefObject, useCallback, useImperativeHandle, useRef } from 'react';

import { css, jsx, keyframes } from '@emotion/react';
import invariant from 'tiny-invariant';

import { token } from '@atlaskit/tokens';

type Point = { x: number; y: number };

export type LineOverlayHandle = {
	drawActive: (args: { from: Point; to: Point }) => void;
	drawFinished: (args: { from: Point; to: Point }) => void;
	showActive: () => void;
	hideActive: () => void;
};

const lineOverlayStyles = css({
	width: '100%',
	height: '100%',
	position: 'absolute',
	top: 0,
	left: 0,
	pointerEvents: 'none',
	stroke: token('color.border.bold', '#738496'),
	strokeWidth: 4,
});

const activeLineAnimation = keyframes({
	from: { strokeDashoffset: 0 },
	to: { strokeDashoffset: -24 },
});

const activeLineStyles = css({
	animation: `${activeLineAnimation} 250ms linear infinite`,
	stroke: token('color.border.selected', '#579DFF'),
	strokeDasharray: '16px 8px',
});

function setPoints(
	line: SVGLineElement,
	{ from, to }: { from: Point; to: Point },
	ref: RefObject<SVGSVGElement>,
) {
	if (to.x <= 0 || to.y <= 0) {
		return;
	}

	if (ref.current === null) {
		return;
	}

	const svg = ref.current;
	const rect = svg.getBoundingClientRect();

	line.setAttribute('x1', (from.x - rect.x).toFixed());
	line.setAttribute('y1', (from.y - rect.y).toFixed());
	line.setAttribute('x2', (to.x - rect.x).toFixed());
	line.setAttribute('y2', (to.y - rect.y).toFixed());
}

function createLine() {
	const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
	return line;
}

const Lines = forwardRef<LineOverlayHandle, {}>(({}, ref) => {
	invariant(ref !== null && 'current' in ref, 'ref is a ref object');

	const svgRef = useRef<SVGSVGElement>(null);

	const getActive = useCallback(() => {
		const active = svgRef.current?.getElementById('active');
		invariant(active, 'active line exists');
		return active as SVGLineElement;
	}, []);

	const showActive = useCallback(() => {
		const line = getActive();
		line.style.opacity = '1';
	}, [getActive]);

	const hideActive = useCallback(() => {
		const line = getActive();
		line.style.opacity = '0';
	}, [getActive]);

	const drawActive = useCallback(
		(args: { from: Point; to: Point }) => {
			const line = getActive();
			setPoints(line, args, svgRef);
			showActive();
		},
		[getActive, showActive],
	);

	const drawFinished = useCallback((args: { from: Point; to: Point }) => {
		const line = createLine();
		setPoints(line, args, svgRef);
		svgRef.current?.appendChild(line);
	}, []);

	useImperativeHandle<LineOverlayHandle, any>(
		ref,
		() => ({
			drawActive,
			drawFinished,
			hideActive,
			showActive,
		}),
		[drawActive, drawFinished, hideActive, showActive],
	);

	return (
		<svg css={lineOverlayStyles} ref={svgRef}>
			<line id="active" css={activeLineStyles} />
		</svg>
	);
});

export default Lines;
