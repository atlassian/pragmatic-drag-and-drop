import { isSafari } from '../util/is-safari';
import { textMediaType } from '../util/media-types/text-media-type';

export function findTextNode(event: DragEvent): Text | null {
	// Standard: the `event.target` should be the closest `Text` node.
	if (event.target instanceof Text) {
		return event.target;
	}

	// Structuring things this way so that if Safari fixes their bug
	// then the standard check will start working
	if (!isSafari()) {
		return null;
	}

	/**
	 * According to the spec, `event.target` should be the `Text` node that
	 * the drag started from when dragging a text selection.
	 *
	 * → https://html.spec.whatwg.org/multipage/dnd.html#drag-and-drop-processing-model
	 *
	 * However, in Safari the closest `HTMLElement` is returned.
	 * So we need to figure out if text is dragging ourselves.
	 *
	 * → https://bugs.webkit.org/show_bug.cgi?id=268959
	 */
	if (!(event.target instanceof HTMLElement)) {
		return null;
	}

	// Unlikely that this particular drag is a text selection drag
	if (event.target.draggable) {
		return null;
	}

	// if the drag contains no text data, then not dragging selected text
	// return `null` if there is no dataTransfer, or if `getData()` returns ""
	if (!event.dataTransfer?.getData(textMediaType)) {
		return null;
	}

	/**
	 * Grab the first Text node and use that.
	 * Only doing a single level search as that is all we need for this bug.
	 */
	const text: Text | undefined = Array.from(event.target.childNodes).find(
		(node): node is Text => node.nodeType === Node.TEXT_NODE,
	);

	return text ?? null;
}
