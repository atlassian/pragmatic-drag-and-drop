// Source: https://github.com/atlassian/react-beautiful-dnd

type Overflow = {
  overflowX: string;
  overflowY: string;
};

const isEqual =
  (base: string) =>
  (value: string): boolean =>
    base === value;
const isScroll = isEqual('scroll');
const isAuto = isEqual('auto');
const isEither = (overflow: Overflow, fn: (value: string) => boolean) =>
  fn(overflow.overflowX) || fn(overflow.overflowY);

const isElementScrollable = (el: Element): boolean => {
  const style: CSSStyleDeclaration = window.getComputedStyle(el);
  const overflow: Overflow = {
    overflowX: style.overflowX,
    overflowY: style.overflowY,
  };

  return isEither(overflow, isScroll) || isEither(overflow, isAuto);
};

export const getClosestScrollableElement = (
  el?: Element | null,
): Element | null => {
  // cannot do anything else!
  if (!el) {
    return null;
  }

  // not allowing us to go higher then body
  if (el === document.body || el === document.documentElement) {
    return null;
  }

  if (!isElementScrollable(el)) {
    // keep recursing
    return getClosestScrollableElement(el.parentElement);
  }

  // success!
  return el;
};
