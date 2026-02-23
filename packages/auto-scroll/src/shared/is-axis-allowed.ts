import { type AllowedAxis, type Axis } from '../internal-types';

export function isAxisAllowed(axis: Axis, allowedAxis: AllowedAxis): boolean {
	return allowedAxis === 'all' || axis === allowedAxis;
}
