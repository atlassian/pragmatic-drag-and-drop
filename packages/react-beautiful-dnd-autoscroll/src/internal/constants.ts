import type { AxisDirection, HorizontalAxis, VerticalAxis } from './types';

// A scroll event will only be triggered when there is a value of at least 1px change
export const minScroll = 1;

export const vertical: VerticalAxis = {
  direction: 'vertical',
  start: 'top',
  end: 'bottom',
  size: 'height',
  scrollAxis: 'scrollTop',
};

export const horizontal: HorizontalAxis = {
  direction: 'horizontal',
  start: 'left',
  end: 'right',
  size: 'width',
  scrollAxis: 'scrollLeft',
};

export const defaultAllowedAxis: AxisDirection[] = [
  horizontal.direction,
  vertical.direction,
];
