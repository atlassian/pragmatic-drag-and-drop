// This file was copied from `react-beautiful-dnd` with some adjustments.
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/test/unit/integration/drag-drop-context/error-handling/error-in-react-tree.spec.js>

import React from 'react';

import { render } from '@testing-library/react';

import { rbdInvariant } from '../../../../../../../src/drag-drop-context/rbd-invariant';
import { setElementFromPoint } from '../../../../../_util';
import App from '../../_utils/app';
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

forEachSensor(control => {
  it('should recover from rbd errors', () => {
    let hasThrown: boolean = false;
    function CanThrow(props: { shouldThrow: boolean }) {
      if (!hasThrown && props.shouldThrow) {
        hasThrown = true;
        rbdInvariant(false, 'throwing');
      }
      return null;
    }

    const { rerender, getByTestId } = render(
      <App anotherChild={<CanThrow shouldThrow={false} />} />,
    );

    setElementFromPoint(getByTestId('0'));
    simpleLift(control, getByTestId('0'));
    expect(isDragging(getByTestId('0'))).toBe(true);

    expect(() => {
      rerender(<App anotherChild={<CanThrow shouldThrow />} />);
    }).not.toThrow();

    expect(error).toHaveBeenCalled();

    expect(isDragging(getByTestId('0'))).toBe(false);
  });

  it('should not recover from non-rbd errors', () => {
    let hasThrown: boolean = false;
    function CanThrow(props: { shouldThrow: boolean }) {
      if (!hasThrown && props.shouldThrow) {
        hasThrown = true;
        throw new Error('Boom');
      }
      return null;
    }

    const { rerender, getByTestId } = render(
      <App anotherChild={<CanThrow shouldThrow={false} />} />,
    );

    setElementFromPoint(getByTestId('0'));
    simpleLift(control, getByTestId('0'));
    expect(isDragging(getByTestId('0'))).toBe(true);

    expect(() => {
      rerender(<App anotherChild={<CanThrow shouldThrow />} />);
    }).toThrow();

    expect(error).toHaveBeenCalled();
  });

  it('should not recover from runtime errors', () => {
    let hasThrown: boolean = false;
    function CanThrow(props: { shouldThrow: boolean }) {
      if (!hasThrown && props.shouldThrow) {
        hasThrown = true;
        // @ts-expect-error - intentionally calling nonexistent function
        window.foo();
      }
      return null;
    }

    const { rerender, getByTestId } = render(
      <App anotherChild={<CanThrow shouldThrow={false} />} />,
    );

    setElementFromPoint(getByTestId('0'));
    simpleLift(control, getByTestId('0'));
    expect(isDragging(getByTestId('0'))).toBe(true);

    expect(() => {
      rerender(<App anotherChild={<CanThrow shouldThrow />} />);
    }).toThrow();

    expect(error).toHaveBeenCalled();
  });
});
