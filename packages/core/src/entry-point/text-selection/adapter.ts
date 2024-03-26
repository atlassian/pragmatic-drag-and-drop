export {
  monitorForTextSelection,
  dropTargetForTextSelection,
} from '../../adapter/text-selection-adapter';

// Payload for the text selection being dragged
export type { TextSelectionDragPayload } from '../../internal-types';

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
} from '../../adapter/text-selection-adapter';
