import type { Position } from '@atlaskit/pragmatic-drag-and-drop/types';

export function isWithin({
  client,
  clientRect,
}: {
  client: Position;
  clientRect: DOMRect;
}): boolean {
  return (
    // is within horizontal bounds
    client.x >= clientRect.x &&
    client.x <= clientRect.x + clientRect.width &&
    // is within vertical bounds
    client.y >= clientRect.y &&
    client.y <= clientRect.y + clientRect.height
  );
}
