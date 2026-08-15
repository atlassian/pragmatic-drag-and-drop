import {
	type BaseEventPayload,
	type DropTargetEventBasePayload,
	type DropTargetEventPayloadMap,
	type DropTargetGetFeedbackArgs,
	type EventPayloadMap,
	type MonitorGetFeedbackArgs,
	type TextSelectionDragType,
} from '../internal-types';

// Payload for the text selection being dragged
// eslint-disable-next-line @atlaskit/volt-strict-mode/no-re-exports
export type { TextSelectionDragPayload } from '../internal-types';

export // The `onGenerateDragPreview` does not make sense to publish for text selection
// as the browser is completely in control of the drag preview
type StripPreviewEvent<T> = Omit<T, 'onGenerateDragPreview'>;

/** Common event payload for all events */
export type TextSelectionEventBasePayload = BaseEventPayload<TextSelectionDragType>;

/** A map containing payloads for all events */
export type TextSelectionEventPayloadMap = StripPreviewEvent<
	EventPayloadMap<TextSelectionDragType>
>;

/** Common event payload for all drop target events */
export type TextSelectionDropTargetEventBasePayload =
	DropTargetEventBasePayload<TextSelectionDragType>;

/** A map containing payloads for all events on drop targets */
export type TextSelectionDropTargetEventPayloadMap = StripPreviewEvent<
	DropTargetEventPayloadMap<TextSelectionDragType>
>;

/** Argument given to all feedback functions (eg `canDrop()`) on a `dropTargetForExternal` */
export type TextSelectionMonitorGetFeedbackArgs = MonitorGetFeedbackArgs<TextSelectionDragType>;

/** Argument given to all monitor feedback functions (eg `canMonitor()`) for a `monitorForExternal` */
export type TextSelectionDropTargetGetFeedbackArgs =
	DropTargetGetFeedbackArgs<TextSelectionDragType>;
