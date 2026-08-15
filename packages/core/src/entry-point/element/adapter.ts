/* eslint-disable @repo/internal/deprecations/deprecation-ticket-required -- VOLTC-139 tracks removal of these deprecated re-export shims. */
/**
 * @deprecated Use `import { draggable, dropTargetForElements, monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter'` instead.
 */
export {
	draggable,
	dropTargetForElements,
	monitorForElements,
} from '../../adapter/element-adapter';

/**
 * @deprecated Use `import { ElementEventBasePayload, ElementEventPayloadMap, ElementDropTargetEventBasePayload, ElementDropTargetEventPayloadMap, ElementGetFeedbackArgs, ElementDropTargetGetFeedbackArgs, ElementMonitorGetFeedbackArgs, ElementDragPayload } from '@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter'` instead.
 */
export type {
	// Base events
	ElementEventBasePayload,
	ElementEventPayloadMap,
	// Drop target events
	ElementDropTargetEventBasePayload,
	ElementDropTargetEventPayloadMap,
	// Feedback types
	ElementGetFeedbackArgs,
	ElementDropTargetGetFeedbackArgs,
	ElementMonitorGetFeedbackArgs,
	// Payload for the draggable being dragged
	ElementDragPayload,
} from '../../adapter/element-adapter';
