import { Input } from '../../../entry-point/types';

import type { GetOffsetFn } from './types';

export function preserveOffsetOnSource({
  element,
  input,
}: {
  element: HTMLElement;
  input: Input;
}): GetOffsetFn {
  return ({ container }) => {
    const sourceRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const offsetX = Math.min(
      // difference
      input.clientX - sourceRect.x,
      // don't let the difference be more than the width of the container,
      // otherwise the pointer will be off the preview
      containerRect.width,
    );
    const offsetY = Math.min(
      // difference
      input.clientY - sourceRect.y,
      // don't let the difference be more than the height of the container,
      // otherwise the pointer will be off the preview
      containerRect.height,
    );

    return { x: offsetX, y: offsetY };
  };
}
