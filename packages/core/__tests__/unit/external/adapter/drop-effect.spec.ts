import { fireEvent } from '@testing-library/dom';

import { combine } from '../../../../src/entry-point/combine';
import {
	dropTargetForExternal,
	monitorForExternal,
} from '../../../../src/entry-point/external/adapter';
import { appendToBody, getBubbleOrderedTree, reset } from '../../_util';

afterEach(reset);

it('should set "copy" as the default drop effect', () => {
	const [A] = getBubbleOrderedTree();
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(A),
		dropTargetForExternal({
			element: A,
		}),
		monitorForExternal({
			onDragStart: () => ordered.push('monitor:start'),
		}),
	);

	const event = new DragEvent('dragenter', {
		bubbles: true,
		cancelable: true,
	});
	event.dataTransfer?.items.add('Hello', 'text/plain');
	fireEvent(window, event);

	// not over a drop target yet
	expect(event.dataTransfer?.dropEffect).toEqual('none');

	// @ts-expect-error
	requestAnimationFrame.step();
	expect(ordered).toEqual(['monitor:start']);

	// entering into A
	const enterEvent = new DragEvent('dragenter', {
		cancelable: true,
		bubbles: true,
	});
	A.dispatchEvent(enterEvent);
	// using the default drop effect
	expect(enterEvent.dataTransfer?.dropEffect).toEqual('copy');

	// moving over A
	const dragOverEvent = new DragEvent('dragover', {
		cancelable: true,
		bubbles: true,
	});
	A.dispatchEvent(dragOverEvent);
	// using the default drop effect
	expect(dragOverEvent.dataTransfer?.dropEffect).toEqual('copy');

	// dropping on A
	const dropEvent = new DragEvent('drop', {
		cancelable: true,
		bubbles: true,
	});
	A.dispatchEvent(dropEvent);
	// using the default drop effect
	expect(dropEvent.dataTransfer?.dropEffect).toEqual('copy');

	cleanup();
});

it('should allow overriding of the default drop effect', () => {
	const [A] = getBubbleOrderedTree();
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(A),
		dropTargetForExternal({
			element: A,
			getDropEffect: () => 'link',
		}),
		monitorForExternal({
			onDragStart: () => ordered.push('monitor:start'),
		}),
	);

	const startEvent = new DragEvent('dragenter', {
		cancelable: true,
		bubbles: true,
	});
	startEvent.dataTransfer?.items.add('Hello', 'text/plain');
	fireEvent(window, startEvent);

	expect(startEvent.dataTransfer?.dropEffect).toEqual('none');

	expect(ordered).toEqual([]);

	// @ts-expect-error
	requestAnimationFrame.step();

	expect(ordered).toEqual(['monitor:start']);

	// entering into A
	const enterEvent = new DragEvent('dragenter', {
		cancelable: true,
		bubbles: true,
	});
	A.dispatchEvent(enterEvent);
	// using the provided drop effect
	expect(enterEvent.dataTransfer?.dropEffect).toEqual('link');

	// moving over A
	const dragOverEvent = new DragEvent('dragover', {
		cancelable: true,
		bubbles: true,
	});
	A.dispatchEvent(dragOverEvent);
	// using the provided drop effect
	expect(dragOverEvent.dataTransfer?.dropEffect).toEqual('link');

	// dropping on A
	const dropEvent = new DragEvent('drop', {
		cancelable: true,
		bubbles: true,
	});
	A.dispatchEvent(dropEvent);
	// using the provided drop effect
	expect(dropEvent.dataTransfer?.dropEffect).toEqual('link');

	cleanup();
});
