import { CleanupFn } from '../internal-types';

export function addAttribute(
  element: Element,
  { attribute, value }: { attribute: string; value: string },
): CleanupFn {
  element.setAttribute(attribute, value);
  return () => element.removeAttribute(attribute);
}
