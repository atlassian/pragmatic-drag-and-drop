import React from 'react';

import { fireEvent, render, type RenderResult } from '@testing-library/react';
import type { DragStart, DragUpdate, ResponderProvided } from 'react-beautiful-dnd';
import invariant from 'tiny-invariant';

import * as liveRegion from '@atlaskit/pragmatic-drag-and-drop-live-region';

import * as screenReader from '../../../../../../../src/drag-drop-context/screen-reader';
import { Board } from '../../../../../_utils/board';
import { keyboard } from '../../../integration/_utils/controls';
import { isDragging } from '../../../integration/_utils/helpers';

const { getDefaultMessage } = screenReader;

const announce = jest.spyOn(liveRegion, 'announce');

beforeAll(() => {
	/**
	 * Jest does not implement `scrollIntoView` so we have to mock it.
	 */
	HTMLElement.prototype.scrollIntoView = jest.fn();
});

jest.useFakeTimers();

type Case = {
	responder: 'onDragStart' | 'onDragUpdate' | 'onDragEnd';
	description?: string;
	execute: (renderResult: RenderResult) => void;
	defaultMessage: string;
};

function getDragStart(): DragStart {
	return {
		draggableId: 'A0',
		mode: 'SNAP',
		type: 'DEFAULT',
		source: {
			droppableId: 'A',
			index: 0,
		},
	};
}

const moveForwardUpdate: DragUpdate = {
	...getDragStart(),
	destination: {
		droppableId: 'A',
		index: 1,
	},
	combine: null,
};

const start = ({ getByTestId }: RenderResult) => {
	const handle = getByTestId('A0');
	keyboard.lift(handle);

	expect(isDragging(handle)).toBe(true);

	// release async responder
	jest.runOnlyPendingTimers();
};

const update = ({ getByTestId }: RenderResult) => {
	const handle = getByTestId('A0');
	fireEvent.keyDown(handle, { key: 'ArrowDown' });

	// release async responder
	jest.runOnlyPendingTimers();
};

const end = ({ getByTestId }: RenderResult) => {
	const handle = getByTestId('A0');
	fireEvent.keyDown(handle, { key: ' ' });
};

const cases: Case[] = [
	{
		responder: 'onDragStart',
		execute: (renderResult: RenderResult) => {
			start(renderResult);
		},
		defaultMessage: getDefaultMessage('onDragStart', getDragStart()),
	},
	{
		responder: 'onDragUpdate',
		description: 'a reorder update',
		execute: (renderResult: RenderResult) => {
			start(renderResult);
			update(renderResult);
		},
		defaultMessage: getDefaultMessage('onDragUpdate', moveForwardUpdate),
	},
	{
		responder: 'onDragEnd',
		execute: (renderResult: RenderResult) => {
			start(renderResult);
			update(renderResult);
			end(renderResult);
		},
		defaultMessage: getDefaultMessage('onDragEnd', {
			...moveForwardUpdate,
			reason: 'DROP',
		}),
	},
];

cases.forEach((current: Case) => {
	describe(`for responder: ${current.responder}${
		current.description ? `: ${current.description}` : ''
	}`, () => {
		beforeEach(() => {
			announce.mockClear();
		});

		it('should announce with the default message if no responder is provided', () => {
			// This test is not relevant for onDragEnd as it must always be provided
			if (current.responder === 'onDragEnd') {
				expect(true).toBe(true);
				return;
			}

			const renderResult = render(<Board />);

			current.execute(renderResult);
			expect(announce).toHaveBeenCalledWith(current.defaultMessage);
		});

		it('should announce with the default message if the responder does not announce', () => {
			const responders = {
				[current.responder]() {},
			};
			const renderResult = render(<Board {...responders} />);

			current.execute(renderResult);
			expect(announce).toHaveBeenCalledWith(current.defaultMessage);
		});

		it('should not announce twice if the responder makes an announcement', () => {
			const responders = {
				[current.responder]: jest.fn((data: any, provided: ResponderProvided) => {
					provided.announce('hello');
				}),
			};
			const renderResult = render(<Board {...responders} />);

			current.execute(renderResult);

			expect(announce).toHaveBeenCalledWith('hello');
			expect(announce).not.toHaveBeenCalledWith(current.defaultMessage);
		});

		it('should prevent async announcements', () => {
			const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

			let provided: ResponderProvided;
			const responders = {
				[current.responder]: jest.fn((data: any, supplied: ResponderProvided) => {
					announce.mockReset();
					provided = supplied;
				}),
			};

			const renderResult = render(<Board {...responders} />);

			current.execute(renderResult);

			// We did not announce so it would have been called with the default message
			expect(announce).toHaveBeenCalledWith(current.defaultMessage);
			expect(announce).toHaveBeenCalledTimes(1);
			expect(warn).not.toHaveBeenCalled();
			announce.mockReset();

			// perform an async message
			setTimeout(() => provided.announce('async message'));
			jest.runOnlyPendingTimers();

			expect(announce).not.toHaveBeenCalled();
			expect(warn).toHaveBeenCalled();

			// cleanup
			warn.mockRestore();
		});

		it('should prevent multiple announcement calls from a consumer', () => {
			const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

			let provided: ResponderProvided;
			const responders = {
				[current.responder]: jest.fn((data: any, supplied: ResponderProvided) => {
					announce.mockReset();
					provided = supplied;
					provided.announce('hello');
				}),
			};

			const renderResult = render(<Board {...responders} />);

			current.execute(renderResult);

			expect(announce).toHaveBeenCalledWith('hello');
			expect(announce).toHaveBeenCalledTimes(1);
			expect(warn).not.toHaveBeenCalled();
			announce.mockReset();

			// perform another announcement
			invariant(provided!, 'provided is not set');
			provided.announce('another one');

			expect(announce).not.toHaveBeenCalled();
			expect(warn).toHaveBeenCalled();

			warn.mockRestore();
		});
	});
});
