import type { Edge, Side } from '../internal-types';

export const mainAxisSideLookup: { [Key in Edge]: Side } = {
	top: 'start',
	right: 'end',
	bottom: 'end',
	left: 'start',
};
