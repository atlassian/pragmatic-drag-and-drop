// Note: not using '@testing-library/dom' in this file as it can
// add it's own "error" event listeners when other events are being fired
// This file uses vanilla event firing so that we are in total control

import { combine } from '../../../../src/entry-point/combine';
import { appendToBody, firePointer, getElements, nativeDrag, reset } from '../../_util';

let windowAddEventListener = jest.spyOn(window, 'addEventListener');
let removeWindowEventListener = jest.spyOn(window, 'removeEventListener');

jest.resetModules();

afterEach(() => {
	windowAddEventListener.mockClear();
	removeWindowEventListener.mockClear();
	jest.resetModules();
});

afterEach(reset);

const mountWindowEventListenerCount = 2;

it('should add event listeners when the module is imported', () => {
	expect(windowAddEventListener).not.toHaveBeenCalled();

	require('../../../../src/entry-point/text-selection/adapter');

	// initial listener
	expect(windowAddEventListener).toHaveBeenCalledTimes(mountWindowEventListenerCount);
});

it('should not add more event listeners when drop targets and monitors are added', () => {
	expect(windowAddEventListener).not.toHaveBeenCalled();
	const {
		dropTargetForTextSelection,
		monitorForTextSelection,
	} = require('../../../../src/entry-point/text-selection/adapter');

	expect(windowAddEventListener).toHaveBeenCalledTimes(mountWindowEventListenerCount);

	const [paragraph] = getElements('p');
	paragraph.textContent = 'Hello world';
	const unbind = combine(
		appendToBody(paragraph),
		dropTargetForTextSelection({
			element: paragraph,
		}),
		monitorForTextSelection({}),
	);

	expect(windowAddEventListener).toHaveBeenCalledTimes(mountWindowEventListenerCount);
	unbind();
});

it('should not remove initiating event listener when an only drop target is removed', () => {
	const {
		dropTargetForTextSelection,
	} = require('../../../../src/entry-point/text-selection/adapter');

	// initial event listener added
	expect(windowAddEventListener).toHaveBeenCalledTimes(mountWindowEventListenerCount);
	// nothing removed
	expect(removeWindowEventListener).not.toHaveBeenCalled();

	const [paragraph] = getElements('p');
	paragraph.textContent = 'Hello world';
	const unbindA = combine(
		appendToBody(paragraph),
		dropTargetForTextSelection({
			element: paragraph,
		}),
	);

	expect(windowAddEventListener).toHaveBeenCalledTimes(mountWindowEventListenerCount);
	// nothing removed yet
	expect(removeWindowEventListener).not.toHaveBeenCalled();

	unbindA();

	// still nothing removed
	expect(removeWindowEventListener).not.toHaveBeenCalled();
});

it('should bind event listeners needed for the drag only while dragging', () => {
	const {
		dropTargetForTextSelection,
		monitorForTextSelection,
	} = require('../../../../src/entry-point/text-selection/adapter');
	const ordered: string[] = [];

	// no event listeners added or removed yet
	expect(windowAddEventListener).toHaveBeenCalledTimes(mountWindowEventListenerCount);

	expect(removeWindowEventListener).not.toHaveBeenCalled();

	const [paragraph] = getElements('p');
	paragraph.textContent = 'Hello world';
	const unbindA = combine(
		appendToBody(paragraph),
		dropTargetForTextSelection({
			element: paragraph,
		}),
		monitorForTextSelection({
			onDragStart: () => ordered.push('start'),
			onDrop: () => ordered.push('drop'),
		}),
	);

	// Note: Cannot reset the mock. It causes internal reference mismatches
	// addEventListener.mockReset();

	// let's start a drag
	nativeDrag.startTextSelectionDrag({
		element: paragraph,
	});
	expect(ordered).toEqual(['start']);
	ordered.length = 0;

	// we expect that *new* event listeners have been added for the duration of a the drag
	const postLiftAddEventListenerCount =
		windowAddEventListener.mock.calls.length - mountWindowEventListenerCount;
	expect(postLiftAddEventListenerCount).toBeGreaterThan(0);
	expect(removeWindowEventListener).not.toHaveBeenCalled();

	// finish the drag
	window.dispatchEvent(new DragEvent('dragend', { cancelable: true, bubbles: true }));

	expect(ordered).toEqual(['drop']);

	// all drag event listeners removed
	expect(removeWindowEventListener).toHaveBeenCalledTimes(postLiftAddEventListenerCount);

	// post drop event listeners added for the honey pot
	const postDropAddEventListenerCount =
		windowAddEventListener.mock.calls.length -
		postLiftAddEventListenerCount -
		mountWindowEventListenerCount;

	expect(postDropAddEventListenerCount).toBeGreaterThan(0);

	// release honey pot fix
	firePointer.move(document.body);

	expect(removeWindowEventListener).toHaveBeenCalledTimes(
		postLiftAddEventListenerCount + postDropAddEventListenerCount,
	);

	unbindA();
});

it('should keep dragging event listeners bound even if only drop target is removed mid drag', () => {
	const {
		dropTargetForTextSelection,
		monitorForTextSelection,
	} = require('../../../../src/entry-point/text-selection/adapter');
	const ordered: string[] = [];

	// no event listeners added or removed yet
	expect(windowAddEventListener).toHaveBeenCalledTimes(mountWindowEventListenerCount);
	expect(removeWindowEventListener).not.toHaveBeenCalled();

	const [paragraph] = getElements('p');
	paragraph.textContent = 'Hello world';
	const unbindA = combine(
		appendToBody(paragraph),
		dropTargetForTextSelection({
			element: paragraph,
			onDrop: () => ordered.push('dropTarget:drop'),
		}),
	);
	const unbindMonitor = monitorForTextSelection({
		onDragStart: () => ordered.push('monitor:start'),
		onDrop: () => ordered.push('monitor:drop'),
	});

	// Note: Cannot reset the mock. It causes internal reference mismatches
	// addEventListener.mockReset();

	// let's start a drag
	nativeDrag.startTextSelectionDrag({
		element: paragraph,
	});
	expect(ordered).toEqual(['monitor:start']);
	ordered.length = 0;

	// we expect that *new* event listeners have been added for the duration of a the drag
	const postLiftAddEventListenerCount =
		windowAddEventListener.mock.calls.length - mountWindowEventListenerCount;
	expect(postLiftAddEventListenerCount).toBeGreaterThan(0);
	expect(removeWindowEventListener).not.toHaveBeenCalled();

	// unbinding the only drop target during the drag
	unbindA();
	// our drag initiation drag listener is still active (we no longer tie it to drop targets)
	expect(removeWindowEventListener).not.toHaveBeenCalled();
	// finish the drag
	window.dispatchEvent(new DragEvent('dragend', { cancelable: true, bubbles: true }));

	// monitor still told about the drop
	expect(ordered).toEqual(['monitor:drop']);

	// all drag event listeners removed
	expect(removeWindowEventListener).toHaveBeenCalledTimes(postLiftAddEventListenerCount);

	unbindMonitor();
});
