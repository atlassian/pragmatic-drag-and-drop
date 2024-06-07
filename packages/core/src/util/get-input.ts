import { type Input } from '../internal-types';

export function getInput(event: DragEvent): Input {
	return {
		altKey: event.altKey,
		button: event.button,
		buttons: event.buttons,
		ctrlKey: event.ctrlKey,
		metaKey: event.metaKey,
		shiftKey: event.shiftKey,
		clientX: event.clientX,
		clientY: event.clientY,
		pageX: event.pageX,
		pageY: event.pageY,
	};
}
