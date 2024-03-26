import { getPerson } from '../../data/people';

import type { Item, Status } from './types';

const status: Status[] = ['todo', 'in-progress', 'done'];

let count: number = 0;

export function getItems({ amount }: { amount: number }): Item[] {
  return Array.from({ length: amount }, () => {
    const statusIndex = Math.floor((Math.random() * 100) % status.length);
    const id = count++;
    return {
      id: `id:${id}`,
      description: `Generated description ${id}`,
      status: status[statusIndex],
      assignee: getPerson(),
    };
  });
}
