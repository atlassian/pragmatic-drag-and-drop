import { rbdInvariant } from '../drag-drop-context/rbd-invariant';

export const attributes = {
  draggable: {
    contextId: 'data-rbd-draggable-context-id',
    id: 'data-rbd-draggable-id',
  },
  dragHandle: {
    contextId: 'data-rbd-drag-handle-context-id',
    draggableId: 'data-rbd-drag-handle-draggable-id',
  },
  droppable: {
    contextId: 'data-rbd-droppable-context-id',
    id: 'data-rbd-droppable-id',
  },
  placeholder: { contextId: 'data-rbd-placeholder-context-id' },
} as const;

/**
 * These attributes are not set by `react-beautiful-dnd`,
 * but they expose useful information for the migration layer.
 */
export const customAttributes = {
  draggable: {
    droppableId: 'data-rbd-draggable-droppable-id',
    index: 'data-rbd-draggable-index',
  },
  dropIndicator: 'data-rbd-drop-indicator',
  droppable: {
    direction: 'data-rbd-droppable-direction',
    type: 'data-rbd-droppable-type',
  },
} as const;

type LeafOf<
  Object extends Record<string, any>,
  Value = Object[keyof Object],
> = Value extends Record<string, any> ? LeafOf<Value> : Value;

type Attribute = LeafOf<typeof attributes> | LeafOf<typeof customAttributes>;

export function getAttribute(element: HTMLElement, attribute: Attribute) {
  const value = element.getAttribute(attribute);
  rbdInvariant(value !== null, `Expected '${attribute}' to be present`);
  return value;
}

type CleanUpFn = () => void;

export function setAttributes(
  element: HTMLElement,
  attributes: Partial<Record<Attribute, string>>,
): CleanUpFn {
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }

  return () => {
    for (const key of Object.keys(attributes)) {
      element.removeAttribute(key);
    }
  };
}
