/**
 * The original `react-beautiful-dnd` tests were located at:
 * <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/test/unit/integration/droppable/placeholder.spec.js>
 *
 * These tests have been distributed elsewhere, because placeholders in the
 * migration layer are intended to work a bit differently.
 *
 * Actual placeholders are rendered by `<Draggable>` and not through the
 * `placeholder` provided by a `<Droppable>`.
 *
 * The `placeholder` provided by `<Droppable>` is instead used to provide
 * a drop indicator.
 *
 * The tests for these have been derived from the original `react-beautiful-dnd`
 * tests and are located at:
 *
 * - `__tests__/unit/draggable/placeholder.test.tsx`
 * - `__tests__/unit/droppable/drop-indicator.test.tsx`
 */

export {};
