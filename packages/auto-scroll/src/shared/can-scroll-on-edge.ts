import { Edge } from '../internal-types';

export const canScrollOnEdge: {
  [key in Edge]: (element: Element) => boolean;
} = {
  // Notes:
  //
  // 🌏 Chrome 115.0: uses fractional units for `scrollLeft` and `scrollTop`
  //    (and fractional units don't reach true integer maximum when zoomed in / out)
  // 🍎 Safari 16.5.2: no fractional units
  // 🦊 Firefox 115.0: no fractional units

  // we have some scroll we can move backwards into
  top: element => element.scrollTop > 0,
  // We have some scroll we can move forward into
  right: element =>
    Math.ceil(element.scrollLeft) + element.clientWidth < element.scrollWidth,
  // We have some scroll we can move forwards into
  bottom: element =>
    Math.ceil(element.scrollTop) + element.clientHeight < element.scrollHeight,
  // we have some scroll we can move back into.
  left: element => element.scrollLeft > 0,
};
