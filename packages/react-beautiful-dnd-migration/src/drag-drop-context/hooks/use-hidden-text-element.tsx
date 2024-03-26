import { useEffect } from 'react';

// eslint-disable-next-line import/no-extraneous-dependencies
import type { ContextId } from 'react-beautiful-dnd';

export function getHiddenTextElementId(contextId: string) {
  return `rbd-lift-instruction-${contextId}`;
}

type UseHiddenTextElementArgs = {
  contextId: ContextId;
  text: string;
};

export default function useHiddenTextElement({
  contextId,
  text,
}: UseHiddenTextElementArgs) {
  useEffect(() => {
    const id = getHiddenTextElementId(contextId);

    const el: HTMLElement = document.createElement('div');

    // identifier
    el.id = id;

    // add the description text
    el.textContent = text;

    // Using `display: none` prevent screen readers from reading this element in the document flow
    // This element is used as a `aria-labelledby` reference for *other elements* and will be read out for those
    Object.assign(el.style, { display: 'none' });

    // Add to body
    document.body.appendChild(el);

    return function unmount() {
      // Remove from body
      el.remove();
    };
  }, [contextId, text]);
}
