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
	node.setAttribute('role', 'alert');
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

/**
 * Announces the provided message to assistive technology.
 */
export function announce(message: string) {
	const node = getNode();
	node.textContent = message;
}

/**
 * Removes the created live region. If there is no live region this is a no-op.
 */
export function cleanup() {
	node?.remove();
	node = null;
}
