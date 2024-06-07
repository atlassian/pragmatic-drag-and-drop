// This file was copied from `react-beautiful-dnd` with some adjustments.
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/test/unit/integration/drag-drop-context/error-handling/error-on-window.spec.js>

import React from 'react';

import { act, render } from '@testing-library/react';

import { RbdInvariant } from '../../../../../../../src/drag-drop-context/rbd-invariant';
import { setElementFromPoint } from '../../../../../_util';
import { withError, withoutError, withWarn } from '../../../../_utils/console';
import App from '../../_utils/app';
import { keyboard, mouse, simpleLift } from '../../_utils/controls';
import { isDragging } from '../../_utils/helpers';

/**
 * This mock is required because jest does not implement `scrollIntoView`.
 */
HTMLElement.prototype.scrollIntoView = jest.fn();

function getRuntimeError(): Event {
	return new window.ErrorEvent('error', {
		error: new Error('non-rbd'),
		cancelable: true,
	});
}

function getRbdErrorEvent(): Event {
	return new window.ErrorEvent('error', {
		error: new RbdInvariant('my invariant'),
		cancelable: true,
	});
}

const cases = [
	{ id: 'mouse', control: mouse },
	{ id: 'keyboard', control: keyboard },
];

cases.forEach(({ id, control }) => {
	it(`should abort any active drag (rbd error) (${id})`, () => {
		const { getByTestId } = render(<App />);
		control.lift(getByTestId('0'));
		expect(isDragging(getByTestId('0'))).toBe(true);
		const event: Event = getRbdErrorEvent();

		withWarn(() => {
			withError(() => {
				act(() => {
					window.dispatchEvent(event);
				});
			});
		});

		// drag aborted
		expect(isDragging(getByTestId('0'))).toBe(false);
		// error event prevented
		expect(event.defaultPrevented).toBe(true);
	});

	it(`should abort any active drag (non-rbd error) (${id})`, async () => {
		const { getByTestId } = render(<App />);
		setElementFromPoint(getByTestId('0'));
		simpleLift(control, getByTestId('0'));
		expect(isDragging(getByTestId('0'))).toBe(true);
		const event: Event = getRuntimeError();

		// not logging the raw error
		withoutError(() => {
			// logging that the drag was aborted
			withWarn(() => {
				act(() => {
					window.dispatchEvent(event);
				});
			});
		});

		// drag aborted
		expect(isDragging(getByTestId('0'))).toBe(false);
		// error event not prevented
		expect(event.defaultPrevented).toBe(false);
	});
});
