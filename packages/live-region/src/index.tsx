import { announceDelay } from './constants';

let node: HTMLElement | null = null;

const size = '1px';

const visuallyHiddenStyles = {
	// Standard visually hidden styles.
	// Copied from our VisuallyHidden (react) package.
	width: size,
	height: size,
	padding: '0',
	position: 'absolute',
	border: '0',
	clip: `rect(${size}, ${size}, ${size}, ${size})`,
	overflow: 'hidden',
	whiteSpace: 'nowrap',
	// Pulling upwards slightly to prevent the page
	// from growing when appended to a body that contains
	// an element with height:100%
	marginTop: `-${size}`,
	// Just being safe and letting this element not interfere with hitboxes
	pointerEvents: 'none',
};

/**
 * Creates a live region node, appends it to the body, and returns it.
 */
function createNode(): HTMLElement {
	const node = document.createElement('div');
	/**
	 * Using `role="status"` instead of `role="alert"` so that the message
	 * can be queued and read when able.
	 *
	 * We found with `role="alert"` the message was not reliably read when
	 * focus changed.
	 */
	node.setAttribute('role', 'status');
	Object.assign(node.style, visuallyHiddenStyles);
	document.body.append(node);
	return node;
}

/**
 * Returns the live region node, creating one if necessary.
 */
function getNode(): HTMLElement {
	if (node === null) {
		node = createNode();
	}
	return node;
}

let timerId: ReturnType<typeof setTimeout> | null = null;

function tryClearTimer() {
	if (timerId !== null) {
		clearTimeout(timerId);
	}
	timerId = null;
}

/**
 * Announces the provided message to assistive technology.
 */
export function announce(message: string): void {
	/**
	 * Calling this immediately to ensure a node exists and has time to be parsed
	 * and exposed in the accessibility tree.
	 */
	getNode();

	/**
	 * Updating the message in a timeout so that it's less likely to be interrupted.
	 *
	 * This function is often called right before focus changes,
	 * because the user has just taken an action.
	 * This focus change would often cause the message to be skipped / interrupted.
	 */
	tryClearTimer();
	timerId = setTimeout(() => {
		timerId = null;
		const node = getNode();
		node.textContent = message;
	}, announceDelay);

	return;
}

/**
 * Removes the created live region. If there is no live region this is a no-op.
 */
export function cleanup(): void {
	tryClearTimer();
	node?.remove();
	node = null;
}
