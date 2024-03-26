import React, { useRef, useState } from 'react';

import { render } from '@testing-library/react';
import invariant from 'tiny-invariant';

import { rbdInvariant } from '../../../../../../../src/drag-drop-context/rbd-invariant';
import { setup } from '../../../../../_utils/setup';
import causeRuntimeError from '../../../../_utils/cause-runtime-error';
import { withError, withWarn } from '../../../../_utils/console';
import App from '../../_utils/app';
import { type Control, forEachSensor, simpleLift } from '../../_utils/controls';
import { isDragging } from '../../_utils/helpers';

beforeAll(() => {
  setup();
});

type Props = {
  throw: () => void;
  setForceThrow: (fn: () => void) => void;
};

function Vomit(props: Props) {
  const setShouldThrow = useState(0)[1];
  const shouldThrowRef = useRef(false);

  function chuck() {
    shouldThrowRef.current = true;
    setShouldThrow(current => current + 1);
  }

  props.setForceThrow(chuck);

  if (shouldThrowRef.current) {
    shouldThrowRef.current = false;
    props.throw();
  }

  return null;
}

type Thrower = {
  setForceThrow: (fn: () => void) => void;
  execute: () => void;
};

function getThrower(): Thrower {
  let current: (() => void) | null = null;
  function setForceThrow(fn: () => void) {
    current = fn;
  }

  function execute() {
    withError(() => {
      invariant(current, 'Expected throw callback to be set');
      current();
    });
  }

  return { setForceThrow, execute };
}

forEachSensor((control: Control) => {
  it('should abort a drag if an invariant error occurs in the application', () => {
    const thrower: Thrower = getThrower();
    const { getByText } = render(
      <App
        anotherChild={
          <Vomit
            throw={() =>
              rbdInvariant(false, 'Do not pass go, do not collect $200')
            }
            setForceThrow={thrower.setForceThrow}
          />
        }
      />,
    );
    const handle: HTMLElement = getByText('item: 0');

    simpleLift(control, handle);
    expect(isDragging(handle)).toBe(true);

    thrower.execute();

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
    const thrower: Thrower = getThrower();
    const { getByText, queryByText } = render(
      <App
        anotherChild={
          <Vomit
            throw={() => {
              throw new Error('Raw error throw');
            }}
            setForceThrow={thrower.setForceThrow}
          />
        }
      />,
    );
    const handle: HTMLElement = getByText('item: 0');

    simpleLift(control, handle);
    expect(isDragging(handle)).toBe(true);

    expect(() => {
      thrower.execute();
    }).toThrow();

    // handle is gone
    expect(queryByText('item: 0')).toBe(null);

    // strange - but firing events on old handle
    expect(() => {
      control.move(handle);
    }).not.toThrow();
  });

  it('should abort a drag if a runtime error occurs', () => {
    const thrower: Thrower = getThrower();
    const { getByText } = render(
      <App
        anotherChild={
          <Vomit
            throw={() => {
              causeRuntimeError();
            }}
            setForceThrow={thrower.setForceThrow}
          />
        }
      />,
    );
    const handle: HTMLElement = getByText('item: 0');

    simpleLift(control, handle);
    expect(isDragging(handle)).toBe(true);

    withWarn(() => {
      thrower.execute();
    });

    expect(isDragging(getByText('item: 0'))).toBe(false);
  });
});
