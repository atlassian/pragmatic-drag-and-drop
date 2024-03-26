import { getRect } from 'css-box-model';

import type { Position } from '@atlaskit/pragmatic-drag-and-drop/types';

import type { Viewport } from '../types';

import getMaxWindowScroll from './get-max-window-scroll';
import getWindowScroll from './get-window-scroll';

export default (): Viewport => {
  const scroll: Position = getWindowScroll();
  const maxScroll: Position = getMaxWindowScroll();

  const top: number = scroll.y;
  const left: number = scroll.x;

  // window.innerHeight: includes scrollbars (not what we want)
  // document.clientHeight gives us the correct value when using the html5 doctype
  const doc: HTMLElement = document.documentElement;
  // Using these values as they do not consider scrollbars
  // padding box, without scrollbar
  const width: number = doc.clientWidth;
  const height: number = doc.clientHeight;

  // Computed
  const right: number = left + width;
  const bottom: number = top + height;

  const container = getRect({
    top,
    left,
    right,
    bottom,
  });

  const viewport: Viewport = {
    container,
    scroll: {
      current: scroll,
      max: maxScroll,
    },
  };

  return viewport;
};
