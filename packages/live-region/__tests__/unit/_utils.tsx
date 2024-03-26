import { screen } from '@testing-library/dom';

function queryLiveRegion(): HTMLElement | null {
  return screen.queryByRole('alert');
}

export function getLiveRegion(): HTMLElement {
  return screen.getByRole('alert');
}

export function hasLiveRegion(): boolean {
  return Boolean(queryLiveRegion()?.isConnected);
}
