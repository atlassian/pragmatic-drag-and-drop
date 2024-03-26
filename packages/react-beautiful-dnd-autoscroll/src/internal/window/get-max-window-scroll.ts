import type { Position } from 'css-box-model';

import getMaxScroll from '../get-max-scroll';

export default (): Position => {
  const doc: HTMLElement = document.documentElement;

  const maxScroll: Position = getMaxScroll({
    // unclipped padding box, with scrollbar
    scrollHeight: doc.scrollHeight,
    scrollWidth: doc.scrollWidth,
    // clipped padding box, without scrollbar
    width: doc.clientWidth,
    height: doc.clientHeight,
  });

  return maxScroll;
};
