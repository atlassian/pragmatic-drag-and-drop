import { bind, bindAll } from 'bind-event-listener';

import {
	type AllDragTypes,
	type BaseEventPayload,
	type CleanupFn,
	type EventPayloadMap,
	type Position,
} from '../internal-types';
import { maxZIndex } from '../util/max-z-index';

import { honeyPotDataAttribute } from './honey-pot-data-attribute';

const honeyPotSize: number = 2;
const halfHoneyPotSize: number = honeyPotSize / 2;

/**
 * `clientX` and `clientY` can be in sub pixels (eg `2.332`)
 * However, browser hitbox testing is commonly do to the closest pixel.
 *
 * → https://issues.chromium.org/issues/40940531
 *
 * To be sure that the honey pot will be over the `client` position,
 * we `.floor()` `clientX` and`clientY` and then make it `2px` in size.
 **/
function floorToClosestPixel(point: Position): Position {
	return {
		x: Math.floor(point.x),
		y: Math.floor(point.y),
	};
}

/**
 * We want to make sure the honey pot sits around the users position.
 * This seemed to be the most resilient while testing.
 */
function pullBackByHalfHoneyPotSize(point: Position): Position {
	return {
		x: point.x - halfHoneyPotSize,
		y: point.y - halfHoneyPotSize,
	};
}

/**
 * Prevent the honey pot from changing the window size.
 * This is super unlikely to occur, but just being safe.
 */
function preventGoingBackwardsOffScreen(point: Position): Position {
	return {
		x: Math.max(point.x, 0),
		y: Math.max(point.y, 0),
	};
}

/**
 * Prevent the honey pot from changing the window size.
 * This is super unlikely to occur, but just being safe.
 */
function preventGoingForwardsOffScreen(point: Position): Position {
	return {
		x: Math.min(point.x, window.innerWidth - honeyPotSize),
		y: Math.min(point.y, window.innerHeight - honeyPotSize),
	};
}

/**
 * Create a `2x2` `DOMRect` around the `client` position
 */
function getHoneyPotRectFor({ client }: { client: Position }): DOMRect {
	const point = preventGoingForwardsOffScreen(
		preventGoingBackwardsOffScreen(pullBackByHalfHoneyPotSize(floorToClosestPixel(client))),
	);

	// When debugging, it is helpful to
	// make this element a bit bigger
	return DOMRect.fromRect({
		x: point.x,
		y: point.y,
		width: honeyPotSize,
		height: honeyPotSize,
	});
}

function getRectStyles({ clientRect }: { clientRect: DOMRect }): Partial<CSSStyleDeclaration> {
	return {
		left: `${clientRect.left}px`,
		top: `${clientRect.top}px`,
		width: `${clientRect.width}px`,
		height: `${clientRect.height}px`,
	};
}

function isWithin({ client, clientRect }: { client: Position; clientRect: DOMRect }): boolean {
	return (
		// is within horizontal bounds
		client.x >= clientRect.x &&
		client.x <= clientRect.x + clientRect.width &&
		// is within vertical bounds
		client.y >= clientRect.y &&
		client.y <= clientRect.y + clientRect.height
	);
}

type FinishHoneyPotArgs = { current: Position };

type FinishHoneyPotFn = (args: FinishHoneyPotArgs) => void;

/**
 * The honey pot fix is designed to get around a painful bug in all browsers.
 *
 * [Overview](https://www.youtube.com/watch?v=udE9qbFTeQg)
 *
 * **Background**
 *
 * When a drag starts, browsers incorrectly think that the users pointer is
 * still depressed where the drag started. Any element that goes under this position
 * will be entered into, causing `"mouseenter"` events and `":hover"` styles to be applied.
 *
 * _This is a violation of the spec_
 *
 * > "From the moment that the user agent is to initiate the drag-and-drop operation,
 * > until the end 	of the drag-and-drop operation, device input events
 * > (e.g. mouse and keyboard events) must be suppressed."
 * >
 * > - https://html.spec.whatwg.org/multipage/dnd.html#drag-and-drop-processing-model
 *
 * _Some impacts_
 *
 * - `":hover"` styles being applied where they shouldn't (looks messy)
 * - components such as tooltips responding to `"mouseenter"` can show during a drag,
 *   and on an element the user isn't even over
 *
 * Bug: https://issues.chromium.org/issues/41129937
 *
 * **Honey pot fix**
 *
 * 1. Create an element where the browser thinks the depressed pointer is
 *    to absorb the incorrect pointer events
 * 2. Remove that element when it is no longer needed
 */
function mountHoneyPot({ initial }: { initial: Position }): FinishHoneyPotFn {
	const element = document.createElement('div');
	element.setAttribute(honeyPotDataAttribute, 'true');

	// can shift during the drag thanks to Firefox
	let clientRect: DOMRect = getHoneyPotRectFor({ client: initial });

	Object.assign(element.style, {
		// Setting a background color explicitly to avoid any inherited styles.
		// Looks like this could be `opacity: 0`, but worried that _might_
		// cause the element to be ignored on some platforms.
		// When debugging, set backgroundColor to something like "red".
		backgroundColor: 'transparent',

		position: 'fixed',

		// Being explicit to avoid inheriting styles
		padding: 0,
		margin: 0,
		boxSizing: 'border-box',
		...getRectStyles({ clientRect }),

		// We want this element to absorb pointer events,
		// it's kind of the whole point 😉
		pointerEvents: 'auto',

		// Want to make sure the honey pot is top of everything else.
		// Don't need to worry about native drag previews, as they will
		// have been rendered (and removed) before the honey pot is rendered
		zIndex: maxZIndex,
	});

	document.body.appendChild(element);

	/**
	 *  🦊 In firefox we can get `"pointermove"` events after the drag
	 * has started, which is a spec violation.
	 * The final `"pointermove"` will reveal where the "depressed" position
	 * is for our honey pot fix.
	 */
	const unbindPointerMove = bind(window, {
		type: 'pointermove',
		listener(event) {
			const client: Position = {
				x: event.clientX,
				y: event.clientY,
			};
			clientRect = getHoneyPotRectFor({ client });
			Object.assign(element.style, getRectStyles({ clientRect }));
		},
		// using capture so we are less likely to be impacted by event stopping
		options: { capture: true },
	});

	return function finish({ current }: FinishHoneyPotArgs): void {
		// Don't need this any more
		unbindPointerMove();

		// If the user is hover the honey pot, we remove it
		// so that the user can continue to interact with the page normally.
		if (isWithin({ client: current, clientRect })) {
			element.remove();
			return;
		}

		function cleanup() {
			unbindPostDragEvents();
			element.remove();
		}

		const unbindPostDragEvents = bindAll(
			window,
			[
				{ type: 'pointerdown', listener: cleanup },
				{ type: 'pointermove', listener: cleanup },
				{ type: 'focusin', listener: cleanup },
				{ type: 'focusout', listener: cleanup },

				// a 'pointerdown' should happen before 'dragstart', but just being super safe
				{ type: 'dragstart', listener: cleanup },

				// if the user has dragged something out of the window
				// and then is dragging something back into the window
				// the first events we will see are "dragenter" (and then "dragover").
				// So if we see any of these we need to clear the post drag fix.
				{ type: 'dragenter', listener: cleanup },
				{ type: 'dragover', listener: cleanup },

				// Not adding a "wheel" event listener, as "wheel" by itself does not
				// resolve the bug.
			],
			{
				// Using `capture` so less likely to be impacted by other code stopping events
				capture: true,
			},
		);
	};
}

export function makeHoneyPotFix() {
	let latestPointerMove: Position | null = null;
	function bindEvents(): CleanupFn {
		// For sanity, only collecting this value from when events are first bound.
		// This prevents the case where a super old "pointermove" could be used
		// from a prior interaction.
		latestPointerMove = null;

		return bind(window, {
			type: 'pointermove',
			listener(event) {
				latestPointerMove = {
					x: event.clientX,
					y: event.clientY,
				};
			},
			// listening for pointer move in capture phase
			// so we are less likely to be impacted by events being stopped.
			options: { capture: true },
		});
	}

	function getOnPostDispatch() {
		let finish: ReturnType<typeof mountHoneyPot> | null = null;

		return function onPostEvent({
			eventName,
			payload,
		}: {
			eventName: keyof EventPayloadMap<AllDragTypes>;
			payload: BaseEventPayload<AllDragTypes>;
		}) {
			// We are adding the honey pot `onDragStart` so we don't
			// impact the creation of the native drag preview.
			if (eventName === 'onDragStart') {
				const { input } = payload.location.initial;

				// Sometimes there will be no latest "pointermove" (eg iOS).
				// In which case, we use the start position of the drag.
				const initial = latestPointerMove ?? {
					x: input.clientX,
					y: input.clientY,
				};

				// Don't need to defensively call `finish()` as `onDrop` from
				// one interaction is guaranteed to be called before `onDragStart`
				// of the next.
				finish = mountHoneyPot({ initial });
			}
			if (eventName === 'onDrop') {
				const { input } = payload.location.current;
				finish?.({
					current: {
						x: input.clientX,
						y: input.clientY,
					},
				});
				finish = null;
				// this interaction is finished, we want to use
				// the latest "pointermove" for each interaction
				latestPointerMove = null;
			}
		};
	}

	return { bindEvents, getOnPostDispatch };
}
