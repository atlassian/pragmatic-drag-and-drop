export { monitorForExternal, dropTargetForExternal } from '../../adapter/external-adapter';

// The data that is being dragged
export type { NativeMediaType, ExternalDragPayload } from '../../internal-types';

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
} from '../../adapter/external-adapter';
