import { screen } from '@testing-library/dom';

import * as liveRegion from '../../src';

import { getLiveRegion, hasLiveRegion } from './_utils';

describe('announce', () => {
  beforeEach(() => {
    liveRegion.cleanup();
    expect(hasLiveRegion()).toBe(false);
  });

  it('should create a live region', () => {
    liveRegion.announce('a message');
    expect(hasLiveRegion()).toBe(true);
  });

  it('should place the message inside of the live region', () => {
    const msg = 'a message';
    liveRegion.announce(msg);
    expect(getLiveRegion().textContent).toBe(msg);
  });

  it('should reuse an existing live region', () => {
    liveRegion.announce('');
    const node = getLiveRegion();

    const msg1 = 'message #1';
    liveRegion.announce(msg1);
    expect(node.textContent).toBe(msg1);

    const msg2 = 'message #2';
    liveRegion.announce(msg2);
    expect(node.textContent).toBe(msg2);
  });

  it('should not create more than one node at a time', () => {
    liveRegion.announce('one message');
    liveRegion.announce('two message');
    liveRegion.announce('red message');
    liveRegion.announce('blue message');

    expect(screen.getAllByRole('alert')).toHaveLength(1);
  });
});
