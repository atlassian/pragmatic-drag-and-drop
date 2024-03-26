import { getClosestScrollableElement } from '../../src/internal/get-closest-scrollable-element';

describe('getClosestScrollable()', () => {
  it('should return null when element is not provided', () => {
    expect(getClosestScrollableElement()).toEqual(null);
  });

  it('should return null when element is document.body', () => {
    expect(getClosestScrollableElement(document.body)).toEqual(null);
  });

  it('should return null when element is document.documentElement', () => {
    expect(getClosestScrollableElement(document.documentElement)).toEqual(null);
  });

  it('should return element when it is scrollable', () => {
    const element = document.createElement('div');
    element.style.overflowX = 'auto';
    expect(getClosestScrollableElement(element)).toEqual(element);
  });

  it('should return parent element when it is scrollable', () => {
    const element = document.createElement('div');
    const parent = document.createElement('div');
    parent.style.overflowX = 'auto';
    parent.appendChild(element);

    expect(getClosestScrollableElement(element)).toEqual(parent);
  });
});
