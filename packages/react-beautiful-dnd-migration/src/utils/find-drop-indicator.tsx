import { customAttributes } from './attributes';
import { findElement } from './find-element';

export function findDropIndicator() {
  return findElement({
    attribute: customAttributes.dropIndicator,
  });
}
