/* eslint-disable @repo/internal/deprecations/deprecation-ticket-required -- VOLTC-139 tracks removal of these deprecated re-export shims. */
/**
 * @deprecated Use `import { draggable, dropTargetForElements, monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter'` instead.
 */

export {
	draggable,
	dropTargetForElements,
	monitorForElements,
	type ElementEventBasePayload,
	type ElementEventPayloadMap,
	type ElementDropTargetEventBasePayload,
	type ElementDropTargetEventPayloadMap,
	type ElementGetFeedbackArgs,
	type ElementDropTargetGetFeedbackArgs,
	type ElementMonitorGetFeedbackArgs,
} from '../../adapter/element-adapter';

/**
 * @deprecated Use `import { ElementEventBasePayload, ElementEventPayloadMap, ElementDropTargetEventBasePayload, ElementDropTargetEventPayloadMap, ElementGetFeedbackArgs, ElementDropTargetGetFeedbackArgs, ElementMonitorGetFeedbackArgs, ElementDragPayload } from '@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter'` instead.
 */
export type { ElementDragPayload } from '../../internal-types';
