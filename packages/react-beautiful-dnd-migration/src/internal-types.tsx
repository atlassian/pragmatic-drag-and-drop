/**
 * This type is not exported by `@atlaskit/pragmatic-drag-and-drop`
 */
export type DragSource = {
	element: HTMLElement;
	dragHandle: Element | null;
	data: Record<string, unknown>;
};

export type Action<Name extends string, Payload = undefined> = Payload extends undefined
	? { type: Name }
	: { type: Name; payload: Payload };

export type CleanupFn = () => void;
