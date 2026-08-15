/* eslint-disable @repo/internal/deprecations/deprecation-ticket-required -- VOLTC-139 tracks removal of these deprecated re-export shims. */
/**
 * @deprecated Use `import { dropTargetForExternal } from '@atlaskit/pragmatic-drag-and-drop/adapter/drop-target-for-external'` instead.
 */
export { dropTargetForExternal } from '../../adapter/drop-target-for-external';
/**
 * @deprecated Use `import { monitorForExternal } from '@atlaskit/pragmatic-drag-and-drop/adapter/monitor-for-external'` instead.
 */
export { monitorForExternal } from '../../adapter/monitor-for-external';
/**
 * @deprecated Use `import { ExternalEventBasePayload, ExternalEventPayloadMap, ExternalDropTargetEventBasePayload, ExternalDropTargetEventPayloadMap, ExternalMonitorGetFeedbackArgs, ExternalDropTargetGetFeedbackArgs, NativeMediaType, ExternalDragPayload } from '@atlaskit/pragmatic-drag-and-drop/adapter/external-adapter-types'` instead.
 */
export type {
	// Base events
	ExternalEventBasePayload,
	ExternalEventPayloadMap,
	// Drop target events
	ExternalDropTargetEventBasePayload,
	ExternalDropTargetEventPayloadMap,
	// Feedback types
	ExternalMonitorGetFeedbackArgs,
	ExternalDropTargetGetFeedbackArgs,
	// The data that is being dragged
	NativeMediaType,
	ExternalDragPayload,
} from '../../adapter/external-adapter-types';
