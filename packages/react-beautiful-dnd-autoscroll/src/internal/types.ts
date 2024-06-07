import type { Rect } from 'css-box-model';

import type { Position } from '@atlaskit/pragmatic-drag-and-drop/types';

export type AxisDirection = 'horizontal' | 'vertical';

export type VerticalAxis = {
	direction: 'vertical';
	start: 'top';
	end: 'bottom';
	size: 'height';
	scrollAxis: 'scrollTop';
};

export type HorizontalAxis = {
	direction: 'horizontal';
	start: 'left';
	end: 'right';
	size: 'width';
	scrollAxis: 'scrollLeft';
};

export type Axis = VerticalAxis | HorizontalAxis;

export type Spacing = {
	top: number;
	bottom: number;
	left: number;
	right: number;
};

export type ScrollSize = {
	scrollHeight: number;
	scrollWidth: number;
};

export type ScrollDetails = {
	current: Position;
	// the maximum allowable scroll for the frame
	max: Position;
};

export type Scrollable = {
	scroll: ScrollDetails;
	container: Rect;
};

export type Viewport = {
	container: Rect;
	scroll: ScrollDetails;
};

export type ScrollBehavior =
	| 'window-then-container'
	| 'container-then-window'
	| 'window-only'
	| 'container-only';
