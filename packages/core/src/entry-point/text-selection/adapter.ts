/* eslint-disable @repo/internal/deprecations/deprecation-ticket-required -- VOLTC-139 tracks removal of these deprecated re-export shims. */
/**
 * @deprecated Use `import { dropTargetForTextSelection } from '@atlaskit/pragmatic-drag-and-drop/adapter/drop-target-for-text-selection'` instead.
 */
export { dropTargetForTextSelection } from '../../adapter/drop-target-for-text-selection';
/**
 * @deprecated Use `import { monitorForTextSelection } from '@atlaskit/pragmatic-drag-and-drop/adapter/monitor-for-text-selection'` instead.
 */
export { monitorForTextSelection } from '../../adapter/monitor-for-text-selection';

/**
 * @deprecated Use `import { TextSelectionEventBasePayload, TextSelectionEventPayloadMap, TextSelectionDropTargetEventBasePayload, TextSelectionDropTargetEventPayloadMap, TextSelectionMonitorGetFeedbackArgs, TextSelectionDropTargetGetFeedbackArgs, TextSelectionDragPayload } from '@atlaskit/pragmatic-drag-and-drop/adapter/text-selection-adapter-types'` instead.
 */
export type {
	// Event types
	TextSelectionEventBasePayload,
	TextSelectionEventPayloadMap,
	// Drop targets
	TextSelectionDropTargetEventBasePayload,
	TextSelectionDropTargetEventPayloadMap,
	// Feedback types
	TextSelectionMonitorGetFeedbackArgs,
	TextSelectionDropTargetGetFeedbackArgs,
	// Payload for the text selection being dragged
	TextSelectionDragPayload,
} from '../../adapter/text-selection-adapter-types';
