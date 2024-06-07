/**
 * Cancels the active drag, if there is one.
 *
 * This only affects pdnd's tracking, not the browser's dragging.
 *
 * This means if you drag out of the browser and back in,
 * an external adapter could pick it up as a new drag.
 */
export function cancelPointerDrag() {
	window.dispatchEvent(new DragEvent('dragend'));
}
