export type CleanupFn = () => void;

/**
 * Drop effects allowed to be passed to `getDropEffect()`.
 * Cannot use `"none"` as a `dropEffect` for drop targets as
 * it will opt out of accepting a drop for all nested drop targets.
 * Please use `canDrop()` to disable dropping for this drop target.
 */
export type DropTargetAllowedDropEffect = Exclude<DataTransfer['dropEffect'], 'none'>;

/**
 * Information about a drop target
 */
export type DropTargetRecord = {
	/**
	 * The element the drop target is attached to
	 */
	element: Element;
	// using 'symbol' allows us to create uniquely typed keys / values
	/**
	 * Data associated with the drop target
	 *
	 * (Collected by `getData()`)
	 */
	data: Record<string | symbol, unknown>;
	/**
	 * The drop effect for the drop target
	 *
	 * (Collected by `getDropEffect()`)
	 */
	dropEffect: DropTargetAllowedDropEffect;
	/**
	 * Whether or not the drop target is active due to _stickiness_
	 */
	isActiveDueToStickiness: boolean;
};

export type Position = { x: number; y: number };

export type Serializable = {
	[key: string]: number | string | Serializable | Serializable[];
};
export type Region = 'internal' | 'external';

export type ElementDragPayload = {
	element: HTMLElement;
	dragHandle: Element | null;
	data: Record<string, unknown>;
};

export type ElementDragType = {
	type: 'element';
	startedFrom: 'internal';
	payload: ElementDragPayload;
};

/**
 * A convenance type to provide auto complete for common
 * media types. This type will accept any `string`.
 *
 * For more information on media types, see:
 *
 * - {@link https://atlassian.design/components/pragmatic-drag-and-drop/core-package/adapters/external/custom-media}
 * - {@link https://en.wikipedia.org/wiki/Media_type}
 */
export type NativeMediaType =
	| 'text/uri-list'
	| 'text/plain'
	| 'text/html'
	| 'Files'
	// A TS trick that allows this type to be any string,
	// but will populate auto complete for the provided strings
	// https://github.com/microsoft/TypeScript/issues/51717
	| (string & {});

export type ExternalDragPayload = {
	/**
	 * The media types that are being dragged during a drag.
	 *
	 * @example
	 *
	 * console.log(source.types);
	 * // → ["text/plain", "text/html"]
	 */
	types: NativeMediaType[];
	/**
	 * The entities that are being dragged.
	 * Usually you will not be using these directly, but
	 * our helper functions can leverage them to extract
	 * particular kinds of data (eg files) that are being dragged
	 */
	items: DataTransferItem[];
	/**
	 * returns the data for a given media type.
	 *
	 * - `getStringData(mediaType)` will return `null` if there is no data for that media type
	 * - `getStringData(mediaType)` will return the empty string (`""`) if the empty string (`""`)
	 *      was explicitly set as the data for a media type.
	 * - `getStringData(mediaType)` will return null if requesting files (ie `getStringData('Files')`).
	 *      To access files, use `source.items`, or better still, `getFiles({source})`
	 *
	 * Generally we recommend folks use our helpers to read native data rather than `getStringData(mediaType)`
	 *
	 * @example
	 *
	 * ```ts
	 * // Using getStringData()
	 * const text: string | null = source.getStringData("text/plain");
	 *
	 * // Using our text helper
	 * const text: string | null = getText({source});
	 * ```
	 * */
	getStringData: (mediaType: string) => string | null;
};

export type ExternalDragType = {
	type: 'external';
	startedFrom: 'external';
	payload: ExternalDragPayload;
	getDropPayload: (event: DragEvent) => ExternalDragType['payload'];
};

export type TextSelectionDragPayload = {
	/**
	 * The `Text` node that is the user started the drag from.
	 * Note: the `Text` node does not include all text being dragged.
	 * Use the `plain` or `html` properties to get the full selection
	 */
	target: Text;
	/** The plain text of the selection */
	plain: string;
	/** the HTML of the selection */
	HTML: string;
	/**
	 * Not sure whether to include `window.getSelection()`, but it would be easy to include. I didn't include it for now as I am not sure what we should do if the selection changed during a drag (eg by unrelated updates)
	 */
	// selection: Selection | null
};

export type TextSelectionDragType = {
	type: 'text-selection';
	startedFrom: 'internal';
	payload: TextSelectionDragPayload;
};

export type AllDragTypes = ElementDragType | ExternalDragType | TextSelectionDragType;

export type AdapterAPI<DragType extends AllDragTypes> = {
	canStart: (event: DragEvent) => boolean;
	start: (args: { event: DragEvent; dragType: DragType }) => void;
};

export type Input = {
	altKey: boolean;
	button: number;
	buttons: number;
	ctrlKey: boolean;
	metaKey: boolean;
	shiftKey: boolean;

	// coordinates
	clientX: number;
	clientY: number;
	pageX: number;
	pageY: number;
};

export type DragLocation = {
	/**
	 * A users input at a point in time
	 */
	input: Input;
	/**
	 * A _bubble_ ordered (innermost upwards) list of active drop targets
	 *
	 * @example
	 * [grandChildRecord, childRecord, parentRecord]
	 *
	 */
	dropTargets: DropTargetRecord[];
};

export type DragLocationHistory = {
	/**
	 * Where the drag operation started
	 */
	initial: DragLocation;
	/**
	 * Where the user currently is
	 */
	current: DragLocation;
	/**
	 * Where the user was previously.
	 * `previous` points to what `current` was in the last dispatched event
	 *
	 * `previous` is particularly useful for `onDropTargetChange`
	 * (and the derived `onDragEnter` and `onDragLeave`)
	 * as you can know what the delta of the change
	 *
	 * Exception: `onGenerateDragPreview` and `onDragStart` will have the
	 * same `current` and `previous` values. This is done so that the data
	 * received in `onDragStart` feels logical
	 * (`location.previous` should be `[]` in `onDragStart`)
	 */
	previous: Pick<DragLocation, 'dropTargets'>;
};

/**
 * The common data that is provided to all events
 */
export type BaseEventPayload<DragType extends AllDragTypes> = {
	/**
	 * Location history for the drag operation
	 */
	location: DragLocationHistory;
	/**
	 * Data associated with the entity that is being dragged
	 */
	source: DragType['payload'];
};

export type EventPayloadMap<DragType extends AllDragTypes> = {
	/**
	 * Drag is about to start.
	 * Make changes you want to see in the drag preview
	 *
	 * _Drag previews are not generated for external drag sources (eg files)_
	 */
	onGenerateDragPreview: BaseEventPayload<DragType> & {
		/**
		 * Allows you to use the native `setDragImage` function if you want
		 * Although, we recommend using alternative techniques (see element adapter docs)
		 */
		nativeSetDragImage: DataTransfer['setDragImage'] | null;
	};
	/**
	 * A drag operation has started. You can make changes to the DOM and those changes won't be reflected in your _drag preview_
	 */
	onDragStart: BaseEventPayload<DragType>;
	/**
	 * A throttled update of where the the user is currently dragging. Useful if you want to create a high fidelity experience such as drawing.
	 */
	onDrag: BaseEventPayload<DragType>;
	/**
	 * The `onDropTargetChange` event fires when the `dropTarget` hierarchy changes during a drag.
	 */
	onDropTargetChange: BaseEventPayload<DragType>;
	/**
	 * The `onDrop` event occurs when a user has finished a drag and drop operation.
	 * The `onDrop` event will fire when the drag operation finishes, regardless of how the drag operation finished
	 * (eg due to an explicit drop, the drag being canceled, recovering from an error and so on). On the web platform
	 * we cannot distinguish between dropping on no drop targets and an explicit cancel, so we do not publish any
	 * information about _how_ the drag ended, only that it ended.
	 *
	 * The `location.current` property will accurately contain the final drop targets.
	 */
	onDrop: BaseEventPayload<DragType>;
};

export type AllEvents<DragType extends AllDragTypes> = {
	[EventName in keyof EventPayloadMap<DragType>]: (
		args: EventPayloadMap<DragType>[EventName],
	) => void;
};

export type MonitorGetFeedbackArgs<DragType extends AllDragTypes> = {
	/**
	 * The users `initial` drag location
	 */
	initial: DragLocation;
	/**
	 * The data associated with the entity being dragged
	 */
	source: DragType['payload'];
};

export type MonitorArgs<DragType extends AllDragTypes> = Partial<AllEvents<DragType>> & {
	canMonitor?: (args: MonitorGetFeedbackArgs<DragType>) => boolean;
};

export type DropTargetGetFeedbackArgs<DragType extends AllDragTypes> = {
	/**
	 * The users _current_ input
	 */
	input: Input;
	/**
	 * The data associated with the entity being dragged
	 */
	source: DragType['payload'];
	/**
	 * This drop target's element
	 */
	element: Element;
};

export type DropTargetLocalizedData = {
	/**
	 * A convenance pointer to this drop targets values
	 */
	self: DropTargetRecord;
};

// Not directly used internally, but might be helpful for consumers
export type DropTargetEventBasePayload<DragType extends AllDragTypes> = BaseEventPayload<DragType> &
	DropTargetLocalizedData;
/**
 * Mapping event names to the payloads for those events
 */
export type DropTargetEventPayloadMap<DragType extends AllDragTypes> = {
	[EventName in keyof EventPayloadMap<DragType>]: EventPayloadMap<DragType>[EventName] &
		DropTargetLocalizedData;
} & {
	/**
	 * Derived from the `onDropTargetChange` event
	 * (`onDragEnter` is not it's own event that bubbles)
	 *
	 * `onDragEnter` is fired when _this_ drop target is entered into
	 * and not when any child drop targets change
	 */
	onDragEnter: EventPayloadMap<DragType>['onDropTargetChange'] & DropTargetLocalizedData;
	/**
	 * Derived from the `onDropTargetChange` event
	 * (`onDragLeave` is not it's own event that bubbles)
	 *
	 * `onDragLeave` is fired when _this_ drop target is exited from
	 * and not when any child drop targets change
	 */
	onDragLeave: EventPayloadMap<DragType>['onDropTargetChange'] & DropTargetLocalizedData;
};

export type DropTargetArgs<DragType extends AllDragTypes> = {
	/**
	 * The `element` that you want to attach drop target behaviour to.
	 * The `element` is the unique _key_ for a drop target
	 */
	element: Element;
	/**
	 * A function that returns `data` you want to attach to the drop target.
	 * `getData()` is called _repeatedly_ while the user is dragging over the drop target in order to power addons
	 */
	getData?: (args: DropTargetGetFeedbackArgs<DragType>) => Record<string | symbol, unknown>;
	/**
	 * Used to conditionally block dropping.
	 * By default a drop target can be dropped on.
	 *
	 * Return `false` if you want to block a drop.
	 *
	 * Blocking dropping on a drop target will not block
	 * dropping on child or parent drop targets.
	 * If you want child or parent drop targets to block dropping,
	 * then they will need to return `false` from their `canDrop()`
	 *
	 * `canDrop()` is called _repeatedly_ while a drop target
	 * is being dragged over to allow you to dynamically
	 * change your mind as to whether a drop target can be
	 * dropped on.
	 */
	canDrop?: (args: DropTargetGetFeedbackArgs<DragType>) => boolean;
	/**
	 * Optionally provide a _drop effect_ to be applied when
	 * this drop target is the innermost drop target being dragged over.
	 */
	getDropEffect?: (args: DropTargetGetFeedbackArgs<DragType>) => DropTargetAllowedDropEffect;
	/**
	 * Return `true` if you want your drop target to hold onto
	 * selection after the user is no longer dragging over this drop target.
	 *
	 * Stickiness defaults to `false`
	 *
	 * _For more details about the stickiness algorithm please refer to the docs_
	 */
	getIsSticky?: (args: DropTargetGetFeedbackArgs<DragType>) => boolean;
} & {
	[EventName in keyof DropTargetEventPayloadMap<DragType>]?: (
		args: DropTargetEventPayloadMap<DragType>[EventName],
	) => void;
};

export type DropTargetAPI<DragType extends AllDragTypes> = {
	dropTargetForConsumers: (args: DropTargetArgs<DragType>) => CleanupFn;
	dispatchEvent: <EventName extends keyof EventPayloadMap<DragType>>(args: {
		eventName: EventName;
		payload: EventPayloadMap<DragType>[EventName];
	}) => void;
	getIsOver: (args: {
		source: DragType['payload'];
		target: EventTarget | null;
		input: Input;
		current: DropTargetRecord[];
	}) => DropTargetRecord[];
};
