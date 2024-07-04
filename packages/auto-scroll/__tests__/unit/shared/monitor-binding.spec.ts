import { reset, setStartSystemTime, setupNestedScrollContainers } from '../_util';

// Using modern timers as it is important that the system clock moves in sync with the frames.
// We need this as we are keeping track of when a drop target is entered into.
jest.useFakeTimers();
setStartSystemTime();

beforeEach(reset);

it('should share a single monitor binding between imports', () => {
	jest.isolateModules(() => {
		jest.mock('@atlaskit/pragmatic-drag-and-drop/element/adapter');

		const { monitorForElements } = require('@atlaskit/pragmatic-drag-and-drop/element/adapter');
		const { combine } = require('@atlaskit/pragmatic-drag-and-drop/combine');

		const [_, parent, grandParent] = setupNestedScrollContainers([
			{ width: 10000, height: 10000 },
			{ width: 5000, height: 5000 },
			{ width: 2000, height: 2000 },
		]);
		expect(monitorForElements).not.toHaveBeenCalled();

		// first import will cause the monitor to be bound to
		const {
			autoScrollForElements: autoScrollForElements1,
		} = require('../../../src/entry-point/element');
		expect(monitorForElements).toHaveBeenCalledTimes(1);

		// second import will not cause another monitor binding
		const {
			autoScrollForElements: autoScrollForElements2,
		} = require('../../../src/entry-point/element');
		expect(monitorForElements).toHaveBeenCalledTimes(1);

		// registration will not cause another monitor binding;
		const unbind = combine(
			autoScrollForElements1({
				element: grandParent,
			}),
			autoScrollForElements2({
				element: parent,
			}),
		);
		expect(monitorForElements).toHaveBeenCalledTimes(1);

		unbind();
	});
});

it('should share a monitor binding between standard and overflow scrolling', () => {
	jest.isolateModules(() => {
		jest.mock('@atlaskit/pragmatic-drag-and-drop/element/adapter');

		const { monitorForElements } = require('@atlaskit/pragmatic-drag-and-drop/element/adapter');
		const { combine } = require('@atlaskit/pragmatic-drag-and-drop/combine');

		const [_, parent, grandParent] = setupNestedScrollContainers([
			{ width: 10000, height: 10000 },
			{ width: 5000, height: 5000 },
			{ width: 2000, height: 2000 },
		]);
		expect(monitorForElements).not.toHaveBeenCalled();

		// first import will cause the monitor to be bound to
		const { autoScrollForElements } = require('../../../src/entry-point/element');
		expect(monitorForElements).toHaveBeenCalledTimes(1);
		const {
			unsafeOverflowAutoScrollForElements,
		} = require('../../../src/entry-point/unsafe-overflow/element');
		expect(monitorForElements).toHaveBeenCalledTimes(1);

		// registration will not cause another monitor binding;
		const unbind = combine(
			autoScrollForElements({
				element: grandParent,
			}),
			unsafeOverflowAutoScrollForElements({
				element: parent,
			}),
		);
		expect(monitorForElements).toHaveBeenCalledTimes(1);

		unbind();
	});
});
