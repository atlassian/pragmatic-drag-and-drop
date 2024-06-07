// eslint-disable-next-line import/no-extraneous-dependencies
import type {
	DraggableLocation,
	DragStart,
	DragUpdate,
	DropResult,
	ResponderProvided,
} from 'react-beautiful-dnd';

import { warning } from '../dev-warning';

function getPosition(location: DraggableLocation) {
	return location.index + 1;
}

export const defaultMessage = {
	onDragStart({ source }: DragStart) {
		const startPosition = getPosition(source);
		return `You have lifted an item in position ${startPosition}.`;
	},

	onDragUpdate({ source, destination }: DragUpdate) {
		if (!destination) {
			return 'You are currently not dragging over a droppable area.';
		}

		const startPosition = getPosition(source);
		const endPosition = getPosition(destination);

		const isSameList = source.droppableId === destination.droppableId;
		if (isSameList) {
			return `You have moved the item from position ${startPosition} to position ${endPosition}.`;
		}

		return `You have moved the item from position ${startPosition} in list ${source.droppableId} to list ${destination.droppableId} in position ${endPosition}.`;
	},

	onDragEnd({ source, destination, reason }: DropResult) {
		const startPosition = getPosition(source);

		if (reason === 'CANCEL') {
			return `Movement cancelled. The item has returned to its starting position of ${startPosition}.`;
		}

		if (!destination) {
			return `The item has been dropped while not over a droppable location. The item has returned to its starting position of ${startPosition}.`;
		}

		const endPosition = getPosition(destination);

		const isSameList = source.droppableId === destination.droppableId;
		if (isSameList) {
			return `You have dropped the item. It has moved from position ${startPosition} to ${endPosition}.`;
		}

		return `You have dropped the item. It has moved from position ${startPosition} in list ${source.droppableId} to position ${endPosition} in list ${destination.droppableId}.`;
	},
} as const;

type EventName = keyof typeof defaultMessage;
type EventData<Event extends EventName> = Parameters<(typeof defaultMessage)[Event]>[0];

export function getDefaultMessage<Event extends EventName>(
	event: Event,
	data: EventData<Event>,
): string {
	// @ts-expect-error - narrowing issue
	return defaultMessage[event](data);
}

export function getProvided<Event extends EventName>(
	event: Event,
	data: EventData<Event>,
): {
	provided: ResponderProvided;
	getMessage(): string;
} {
	/**
	 * The custom message to be used.
	 */
	let userMessage: string | null = null;

	/**
	 * Whether the message has been read yet.
	 *
	 * After it has been read, the user can no longer override it.
	 */
	let hasExpired = false;

	const provided = {
		/**
		 * Used to capture custom messages for screen readers.
		 *
		 * Does not announce directly, but exposes the message that should be
		 * announced. This may or may not be the default message.
		 */
		announce(message: string) {
			if (process.env.NODE_ENV !== 'production') {
				if (userMessage) {
					warning('Announcement already made. Not making a second announcement');
				}

				if (hasExpired) {
					warning(`
            Announcements cannot be made asynchronously.
            Default message has already been announced.
          `);
				}
			}

			userMessage = message;
		},
	};

	/**
	 * Returns the message that should be announced.
	 */
	function getMessage() {
		hasExpired = true;
		return userMessage ?? getDefaultMessage(event, data);
	}

	return { provided, getMessage };
}

export const defaultDragHandleUsageInstructions: string = `
  Press space bar to start a drag.
  When dragging you can use the arrow keys to move the item around and escape to cancel.
  Some screen readers may require you to be in focus mode or to use your pass through key
`;
