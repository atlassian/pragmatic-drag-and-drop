// This file was copied from `react-beautiful-dnd` with some adjustments.
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/test/unit/integration/drag-drop-context/error-handling/error-in-react-tree.spec.js>

import React from 'react';

import { render } from '@testing-library/react';

import { rbdInvariant } from '../../../../../../../src/drag-drop-context/rbd-invariant';
import { setElementFromPoint } from '../../../../../_util';
import { withWarn } from '../../../../_utils/console';
import App, { defaultItemRender, RenderItem } from '../../_utils/app';
import { forEachSensor, mouse, simpleLift } from '../../_utils/controls';
import { isDragging } from '../../_utils/helpers';

HTMLElement.prototype.scrollIntoView = jest.fn();

const error = jest.spyOn(console, 'error').mockImplementation(() => {});

afterEach(() => {
	mouse.cancel(document.body);
	error.mockClear();
});

/**
 * This file originally used `keyboard` for all tests.
 *
 * Now there is coverage for both types of input.
 */

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

forEachSensor((control) => {
	it('should recover from rbd errors', () => {
		const { rerender, getByTestId } = render(<App />);

		setElementFromPoint(getByTestId('0'));
		simpleLift(control, getByTestId('0'));
		expect(isDragging(getByTestId('0'))).toBe(true);

		/**
		 * Will throw an `rbdInvariant` while rendering the dragged item.
		 *
		 * Only throws while dragging.
		 */
		const renderItemWithRbdInvariantWhileDragging: RenderItem =
			(item) => (provided, snapshot, rubric) => {
				if (snapshot.isDragging) {
					rbdInvariant(false, 'throwing');
				}

				return defaultItemRender(item)(provided, snapshot, rubric);
			};

		expect(() => {
			withWarn(() => {
				rerender(<App renderItem={renderItemWithRbdInvariantWhileDragging} />);
			});
		}).not.toThrow();

		expect(error).toHaveBeenCalled();

		expect(isDragging(getByTestId('0'))).toBe(false);
	});

	it('should not recover from non-rbd errors', () => {
		const { rerender, getByTestId } = render(<App />);

		setElementFromPoint(getByTestId('0'));
		simpleLift(control, getByTestId('0'));
		expect(isDragging(getByTestId('0'))).toBe(true);

		/**
		 * Will throw an Error while rendering the dragged item.
		 *
		 * Only throws while dragging.
		 */
		const renderItemWithErrorWhileDragging: RenderItem = (item) => (provided, snapshot, rubric) => {
			if (snapshot.isDragging) {
				throw new Error('Boom');
			}

			return defaultItemRender(item)(provided, snapshot, rubric);
		};

		expect(() => {
			rerender(<App renderItem={renderItemWithErrorWhileDragging} />);
		}).toThrow();

		expect(error).toHaveBeenCalled();
	});

	it('should not recover from runtime errors', () => {
		const { rerender, getByTestId } = render(<App />);

		setElementFromPoint(getByTestId('0'));
		simpleLift(control, getByTestId('0'));
		expect(isDragging(getByTestId('0'))).toBe(true);

		/**
		 * Will cause a runtime error while rendering the dragged item.
		 *
		 * Only throws while dragging.
		 */
		const renderItemCausingRuntimeErrorWhileDragging: RenderItem =
			(item) => (provided, snapshot, rubric) => {
				if (snapshot.isDragging) {
					// @ts-expect-error - intentionally calling nonexistent function
					window.foo();
				}

				return defaultItemRender(item)(provided, snapshot, rubric);
			};

		expect(() => {
			rerender(<App renderItem={renderItemCausingRuntimeErrorWhileDragging} />);
		}).toThrow();

		expect(error).toHaveBeenCalled();
	});
});
