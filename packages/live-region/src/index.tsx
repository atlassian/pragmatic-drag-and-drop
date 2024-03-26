let node: HTMLElement | null = null;

/**
 * These styles are recommended in
 * our Accessibility Standards for Hidden Content.
 */
const visuallyHiddenStyles = {
  position: 'absolute',
  clip: 'rect(0 0 0 0)',
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
