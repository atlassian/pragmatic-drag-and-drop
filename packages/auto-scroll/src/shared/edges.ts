import { type Axis, type Edge } from '../internal-types';

export const edges: Edge[] = ['top', 'right', 'bottom', 'left'];

// eslint-disable-next-line @atlaskit/volt-strict-mode/no-multiple-exports
export const edgeAxisLookup: Record<Edge, Axis> = {
	top: 'vertical',
	right: 'horizontal',
	bottom: 'vertical',
	left: 'horizontal',
};
