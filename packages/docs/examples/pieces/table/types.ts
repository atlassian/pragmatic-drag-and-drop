import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';

import { Person } from '../../data/people';

export type Status = 'todo' | 'in-progress' | 'done';

export type Item = {
  id: string;
  status: Status;
  description: string;
  assignee: Person;
};

export type ItemRegistration = {
  item: Item;
  element: HTMLElement;
  index: number;
};

export type ReorderFunction = (args: {
  startIndex: number;
  indexOfTarget: number;
  closestEdgeOfTarget?: Edge | null;
}) => void;
