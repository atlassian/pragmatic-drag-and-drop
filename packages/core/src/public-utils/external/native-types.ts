import type { ExternalDragPayload } from '../../internal-types';

/** `ContainsSource` works for
 * 1. `monitorForNative` > `canMonitor()`
 * 2. `dropTargetForNative` > `canDrop()`
 *
 * We are also using `SourcePayload` as the parameter type for all native getters.
 * For example, `getFiles({source}: SourcePayload)`
 */
export type ContainsSource = { source: ExternalDragPayload };
export type PredicateFn = (args: ContainsSource) => boolean;
