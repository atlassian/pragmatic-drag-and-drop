import {
	type BaseEventPayload,
	type DropTargetEventBasePayload,
	type DropTargetEventPayloadMap,
	type DropTargetGetFeedbackArgs,
	type EventPayloadMap,
	type ExternalDragType,
	type MonitorGetFeedbackArgs,
} from '../internal-types';

// The data that is being dragged
// eslint-disable-next-line @atlaskit/volt-strict-mode/no-re-exports
export type { NativeMediaType, ExternalDragPayload } from '../internal-types';

export /**
 * Some events don't make sense for the external adapter
 *
 * `onGenerateDragPreview`
 * The browser creates the drag preview for external drags, so we don't
 * need an event to generate the preview for _monitors_ or the _dropTarget_
 *
 * `onDragStart`
 * An external drag can never start from in the `window`, so _dropTarget_'s
 * don't need `onDragStart`
 */
type StripEventsForDropTargets<T> = Omit<T, 'onGenerateDragPreview' | 'onDragStart'>;

export type StripEventsForMonitors<T> = Omit<T, 'onGenerateDragPreview'>;

/** Common event payload for all events */
export type ExternalEventBasePayload = BaseEventPayload<ExternalDragType>;

/** A map containing payloads for all events */
export type ExternalEventPayloadMap = StripEventsForMonitors<EventPayloadMap<ExternalDragType>>;

/** Common event payload for all drop target events */
export type ExternalDropTargetEventBasePayload = DropTargetEventBasePayload<ExternalDragType>;

/** A map containing payloads for all events on drop targets */
export type ExternalDropTargetEventPayloadMap = StripEventsForDropTargets<
	DropTargetEventPayloadMap<ExternalDragType>
>;

/** Arguments given to all feedback functions (eg `canDrop()`) on a `dropTargetForExternal` */
export type ExternalDropTargetGetFeedbackArgs = DropTargetGetFeedbackArgs<ExternalDragType>;

/** Arguments given to all monitor feedback functions (eg `canMonitor()`) for a `monitorForExternal` */
export type ExternalMonitorGetFeedbackArgs = MonitorGetFeedbackArgs<ExternalDragType>;
