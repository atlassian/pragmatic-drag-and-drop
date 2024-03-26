export type {
  DropTargetAllowedDropEffect,
  DropTargetRecord,
  Position,
  Input,
  DragLocation,
  DragLocationHistory,
  CleanupFn,
  // These types are not needed for consumers.
  // They are mostly helpful for other packages
  AllDragTypes,
  MonitorArgs,
  BaseEventPayload,

  // Exporting the members of `AllDragTypes`
  // This was needed for `pragmatic-drag-and-drop-auto-scroll`
  // so that it was no reaching into "internal-types" from "/core"
  // to extract the union members.
  // A "deep import paths in type declaration files" was created, which
  // is not allowed in our monorepo.
  ElementDragType,
  TextSelectionDragType,
  ExternalDragType,
} from '../internal-types';
