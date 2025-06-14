import React from 'react';

import { render } from '@testing-library/react';

import { rbdInvariant } from '../../../../../../../src/drag-drop-context/rbd-invariant';
import { setup } from '../../../../../_utils/setup';
import causeRuntimeError from '../../../../_utils/cause-runtime-error';
import { withError, withWarn } from '../../../../_utils/console';
import App, { defaultItemRender, type RenderItem } from '../../_utils/app';
import { type Control, forEachSensor, simpleLift } from '../../_utils/controls';
import { isDragging } from '../../_utils/helpers';

beforeAll(() => {
	setup();
});

/**
 * __Note about triggering errors__
 *
 * We cannot make the item ALWAYS error because then the error will propagate to the next the error boundary,
 * because our boundary will have failed to handle it.
 *
 * With React 16 / 17 we could just error once, however in React 18 this is more difficult.
 *
 * React 18 can recover gracefully if a component errors, and retry a render.
 * If it succeeds on a later try then it will not trigger the error boundary.
 * [https://github.com/facebook/react/issues/27510]
 *
 * This means we cannot just error once for React 18. The alternative is to error based on dragging state.
 */

forEachSensor((control: Control) => {
	it('should abort a drag if an invariant error occurs in the application', () => {
		const { getByText, rerender } = render(<App />);
		const handle: HTMLElement = getByText('item: 0');

		simpleLift(control, handle);
		expect(isDragging(getByText('item: 0'))).toBe(true);

		/**
		 * Will throw an `rbdInvariant` while rendering the dragged item.
		 *
		 * Only throws while dragging.
		 */
		const renderItemWithRbdInvariantWhileDragging: RenderItem =
			(item) => (provided, snapshot, rubric) => {
				if (snapshot.isDragging) {
					rbdInvariant(false, 'rbdInvariant while dragging');
				}

				return defaultItemRender(item)(provided, snapshot, rubric);
			};

		expect(() => {
			// Using `withWarn` and `withError` to reduce console noise
			withWarn(() => {
				withError(() => {
					rerender(<App renderItem={renderItemWithRbdInvariantWhileDragging} />);
				});
			});
		}).not.toThrow();

		const newHandle: HTMLElement = getByText('item: 0');
		// handle is now a new element
		expect(handle).not.toBe(newHandle);
		expect(isDragging(newHandle)).toBe(false);

		// moving the handles around
		expect(() => {
			control.move(handle);
			control.move(newHandle);
		}).not.toThrow();
	});

	it('should abort a drag if an a non-invariant error occurs in the application', () => {
		const { getByText, queryByText, rerender } = render(<App />);
		const handle: HTMLElement = getByText('item: 0');

		simpleLift(control, handle);
		expect(isDragging(handle)).toBe(true);

		/**
		 * Will throw an Error while rendering the dragged item.
		 *
		 * Only throws while dragging.
		 */
		const renderItemWithErrorWhileDragging: RenderItem = (item) => (provided, snapshot, rubric) => {
			if (snapshot.isDragging) {
				throw new Error('error while dragging');
			}

			return defaultItemRender(item)(provided, snapshot, rubric);
		};

		expect(() => {
			// Using `withWarn` and `withError` to reduce console noise
			withWarn(() => {
				withError(() => {
					rerender(<App renderItem={renderItemWithErrorWhileDragging} />);
				});
			});
		}).toThrow();

		// handle is gone
		expect(queryByText('item: 0')).toBe(null);

		// strange - but firing events on old handle
		expect(() => {
			control.move(handle);
		}).not.toThrow();
	});

	it('should abort a drag if a runtime error occurs', () => {
		const { getByText, rerender } = render(<App />);
		const handle: HTMLElement = getByText('item: 0');

		simpleLift(control, handle);
		expect(isDragging(handle)).toBe(true);

		/**
		 * Will cause a runtime error while rendering the dragged item.
		 *
		 * Only throws while dragging.
		 */
		const renderItemCausingRuntimeErrorWhileDragging: RenderItem =
			(item) => (provided, snapshot, rubric) => {
				if (snapshot.isDragging) {
					causeRuntimeError();
				}

				return defaultItemRender(item)(provided, snapshot, rubric);
			};

		// Using `withWarn` to reduce console noise
		withWarn(() => {
			rerender(<App renderItem={renderItemCausingRuntimeErrorWhileDragging} />);
		});

		expect(isDragging(getByText('item: 0'))).toBe(false);
	});
});
