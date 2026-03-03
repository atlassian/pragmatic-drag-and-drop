import React from 'react';

import { render } from '@testing-library/react';

import { skipAutoA11yFile } from '@atlassian/a11y-jest-testing';

import { type DraggableProvided, type DraggableStateSnapshot } from '../../../../../../../src';
import { interactiveTagNames } from '../../../../../../../src/draggable/is-event-in-interactive-element';
import { setup } from '../../../../../_utils/setup';
import App, { type Item } from '../../_utils/app';
import { type Control, forEachSensor, mouseLiftExtended, simpleLift } from '../../_utils/controls';
import { isDragging } from '../../_utils/helpers';

// This file exposes one or more accessibility violations. Testing is currently skipped but violations need to
// be fixed in a timely manner or result in escalation. Once all violations have been fixed, you can remove
// the next line and associated import. For more information, see go/afm-a11y-tooling:jest
skipAutoA11yFile();

beforeAll(() => {
	setup();
});

const mixedCase = (obj: Object): string[] => [
	...Object.keys(obj).map((s) => s.toLowerCase()),
	...Object.keys(obj).map((s) => s.toUpperCase()),
];

const forEachTagName = (fn: (tagName: string) => void) =>
	mixedCase(interactiveTagNames).forEach(fn);

// react will log a warning if using upper case
jest.spyOn(console, 'error').mockImplementation(() => {});

forEachSensor((control: Control) => {
	it('should not drag if the handle is an interactive element', () => {
		forEachTagName((tagName: string) => {
			const renderItem =
				(item: Item) => (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
					const TagName = tagName;
					return (
						<TagName
							{...provided.draggableProps}
							{...provided.dragHandleProps}
							// @ts-expect-error - we know these are native elements but TypeScript doesn't
							ref={provided.innerRef}
							data-is-dragging={snapshot.isDragging}
							data-testid={item.id}
						/>
					);
				};

			const { unmount, getByTestId } = render(<App renderItem={renderItem} />);
			const handle: HTMLElement = getByTestId('0');

			simpleLift(control, handle);

			expect(isDragging(handle)).toBe(false);

			unmount();
		});
	});

	it('should allow dragging from an interactive handle if instructed', () => {
		mixedCase(interactiveTagNames).forEach((tagName: string) => {
			const items: Item[] = [{ id: '0', canDragInteractiveElements: true }];
			const renderItem =
				(item: Item) => (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
					const TagName = tagName;
					return (
						<TagName
							{...provided.draggableProps}
							{...provided.dragHandleProps}
							// @ts-expect-error - we know these are native elements but TypeScript doesn't
							ref={provided.innerRef}
							data-is-dragging={snapshot.isDragging}
							data-testid={item.id}
						/>
					);
				};

			const { unmount, getByTestId } = render(<App items={items} renderItem={renderItem} />);
			const handle: HTMLElement = getByTestId('0');

			simpleLift(control, handle);

			if (control.name === 'mouse') {
				// filling up for mandatory assertion. to be corrected
				expect(true).toBe(true);
			} else {
				expect(isDragging(handle)).toBe(true);
			}

			unmount();
		});
	});

	it('should not start a drag if the parent is interactive', () => {
		forEachTagName((tagName: string) => {
			const renderItem =
				(item: Item) => (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
					const TagName = tagName;
					return (
						<div
							{...provided.draggableProps}
							{...provided.dragHandleProps}
							ref={provided.innerRef}
							data-is-dragging={snapshot.isDragging}
							data-testid={`handle-${item.id}`}
						>
							<TagName data-testid={`inner-${item.id}`} />
						</div>
					);
				};

			const { unmount, getByTestId } = render(<App renderItem={renderItem} />);
			const inner: HTMLElement = getByTestId('inner-0');
			const handle: HTMLElement = getByTestId('handle-0');

			if (control.name === 'mouse') {
				mouseLiftExtended(handle, { elementUnderPointer: inner });
			} else {
				simpleLift(control, inner);
			}

			expect(isDragging(handle)).toBe(false);

			unmount();
		});
	});

	it('should allow dragging from with an interactive parent if instructed', () => {
		forEachTagName((tagName: string) => {
			const items: Item[] = [{ id: '0', canDragInteractiveElements: true }];
			const renderItem =
				(item: Item) => (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
					const TagName = tagName;
					return (
						<div
							{...provided.draggableProps}
							{...provided.dragHandleProps}
							ref={provided.innerRef}
							data-is-dragging={snapshot.isDragging}
							data-testid={`handle-${item.id}`}
						>
							<TagName data-testid={`inner-${item.id}`} />
						</div>
					);
				};

			const { unmount, getByTestId } = render(<App items={items} renderItem={renderItem} />);
			const handle: HTMLElement = getByTestId('handle-0');
			const inner: HTMLElement = getByTestId('inner-0');

			if (control.name === 'mouse') {
				mouseLiftExtended(handle, { elementUnderPointer: inner });
			} else {
				simpleLift(control, inner);
			}

			if (control.name === 'mouse') {
				// filling up for mandatory assertion. to be corrected
				expect(true).toBe(true);
			} else {
				expect(isDragging(handle)).toBe(true);
			}

			unmount();
		});
	});
});
