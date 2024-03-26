import type {
  AllDragTypes,
  Input,
} from '@atlaskit/pragmatic-drag-and-drop/types';

export type ElementGetFeedbackArgs<DragType extends AllDragTypes> = {
  /**
   * The users _current_ input
   */
  input: Input;
  /**
   * The data associated with the entity being dragged
   */
  source: DragType['payload'];
  /**
   * The element trying to be scrolled
   */
  element: Element;
};

export type WindowGetFeedbackArgs<DragType extends AllDragTypes> = Omit<
  ElementGetFeedbackArgs<DragType>,
  'element'
>;

export type Spacing = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type Edge = keyof Spacing;

export type EngagementHistoryEntry = {
  timeOfEngagementStart: number;
};

export type InternalConfig = {
  startHitboxAtPercentageRemainingOfElement: Spacing;
  maxScrollAtPercentageRemainingOfHitbox: Spacing;
  maxPixelScrollPerSecond: number;
  timeDampeningDurationMs: number;
  maxMainAxisHitboxSize: number;
};

export type PublicConfig = Partial<{ maxScrollSpeed: 'standard' | 'fast' }>;

export type ElementAutoScrollArgs<DragType extends AllDragTypes> = {
  element: Element;
  canScroll?: (args: ElementGetFeedbackArgs<DragType>) => boolean;
  getConfiguration?: (args: ElementGetFeedbackArgs<DragType>) => PublicConfig;
};

export type WindowAutoScrollArgs<DragType extends AllDragTypes> = {
  canScroll?: (args: WindowGetFeedbackArgs<DragType>) => boolean;
  getConfiguration?: (args: WindowGetFeedbackArgs<DragType>) => PublicConfig;
};

export type Side = 'start' | 'end';
export type Axis = 'vertical' | 'horizontal';
