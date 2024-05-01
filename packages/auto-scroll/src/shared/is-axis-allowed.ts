import { AllowedAxis, Axis } from '../internal-types';

export function isAxisAllowed(axis: Axis, allowedAxis: AllowedAxis) {
  return allowedAxis === 'all' || axis === allowedAxis;
}
