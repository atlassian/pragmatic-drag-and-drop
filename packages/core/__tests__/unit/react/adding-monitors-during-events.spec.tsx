import React, { useLayoutEffect, useRef, useState } from 'react';

// Using '@testing-library/react' rather than '@testing-library/dom'
// so that events are correctly wrapped in `act()`
import { fireEvent } from '@testing-library/react';
import ReactDOM from 'react-dom';

import { combine } from '../../../src/entry-point/combine';
import { draggable, monitorForElements } from '../../../src/entry-point/element/adapter';
import { appendToBody, getElements, reset } from '../_util';

afterEach(reset);

test('no double calls for created in effects', () => {
	const [container] = getElements('div');
	const cleanup = appendToBody(container);
	const ordered: string[] = [];

	function add({ label, isDragging }: { label: string; isDragging: boolean }) {
		ordered.push(`${label}:isDragging=${isDragging}`);
	}

	function App() {
		const ref = useRef<HTMLDivElement | null>(null);
		const [isDragging, setIsDragging] = useState<boolean>(false);

		add({ label: 'render', isDragging });

		useLayoutEffect(() => {
			add({ label: 'effect', isDragging });

			const element = ref.current;
			if (!element) {
				throw Error('Incorrect ref');
			}

			return combine(
				monitorForElements({
					onGenerateDragPreview: () => {
						add({ label: 'monitor+onGenerateDragPreview', isDragging });
						// setState will cause a render in the next microtask
						// https://twitter.com/alexandereardon/status/1585784101885263872

						// Because the microtask will fire after the iteration of all monitors
						// the new monitor would not be executed for the current event
						// So this test passed before the protection was added to only iterate
						// over active monitors
						setIsDragging(true);
					},
				}),
				draggable({
					element,
					onGenerateDragPreview: () => {
						add({ label: 'draggable+onGenerateDragPreview', isDragging });
						// setIsDragging(true);
					},
				}),
			);
		}, [isDragging]);

		return <div ref={ref}>Drag me</div>;
	}

	ReactDOM.render(<App />, container);

	// initial render
	expect(ordered).toEqual(['render:isDragging=false', 'effect:isDragging=false']);
	ordered.length = 0;

	const draggableElement = container.querySelector('[draggable="true"]');
	if (!(draggableElement instanceof HTMLElement)) {
		throw new Error('unable to find draggable element');
	}

	// act is messing up timings...
	fireEvent.dragStart(draggableElement);

	expect(ordered).toEqual([
		// event to trigger the state chance
		'draggable+onGenerateDragPreview:isDragging=false',
		'monitor+onGenerateDragPreview:isDragging=false',
		// a new render is run
		'render:isDragging=true',
		// a new effect is run an a new monitor is created
		'effect:isDragging=true',
		// `onDragStart` is _not_ called by the new monitor 💃
	]);

	ReactDOM.unmountComponentAtNode(container);
	cleanup();
});

test('no double calls for created in flushed effects', () => {
	const [container] = getElements('div');
	const cleanup = appendToBody(container);
	const ordered: string[] = [];

	function add({ label, isDragging }: { label: string; isDragging: boolean }) {
		ordered.push(`${label}:isDragging=${isDragging}`);
	}

	function App() {
		const ref = useRef<HTMLDivElement | null>(null);
		const [isDragging, setIsDragging] = useState<boolean>(false);

		add({ label: 'render', isDragging });

		useLayoutEffect(() => {
			add({ label: 'effect', isDragging });

			const element = ref.current;
			if (!element) {
				throw Error('Incorrect ref');
			}

			return combine(
				monitorForElements({
					onGenerateDragPreview: () => {
						add({ label: 'monitor+onGenerateDragPreview', isDragging });
						// setState will cause a render in the next microtask
						// https://twitter.com/alexandereardon/status/1585784101885263872

						// Because the microtask will fire after the iteration of all monitors
						// the new monitor would not be executed for the current event
						// So this test passed before the protection was added to only iterate
						// over active monitors
						ReactDOM.flushSync(() => {
							setIsDragging(true);
						});
					},
				}),
				draggable({
					element,
					onGenerateDragPreview: () => {
						add({ label: 'draggable+onGenerateDragPreview', isDragging });
					},
				}),
			);
		}, [isDragging]);

		return <div ref={ref}>Drag me</div>;
	}

	ReactDOM.render(<App />, container);

	// initial render
	expect(ordered).toEqual(['render:isDragging=false', 'effect:isDragging=false']);
	ordered.length = 0;

	const draggableElement = container.querySelector('[draggable="true"]');
	if (!(draggableElement instanceof HTMLElement)) {
		throw new Error('unable to find draggable element');
	}

	// act is messing up timings...
	fireEvent.dragStart(draggableElement);

	expect(ordered).toEqual([
		// event to trigger the state chance
		'draggable+onGenerateDragPreview:isDragging=false',
		'monitor+onGenerateDragPreview:isDragging=false',
		// a new render is run
		'render:isDragging=true',
		// a new effect is run an a new monitor is created
		'effect:isDragging=true',
		// `onDragStart` is _not_ called by the new monitor 💃
	]);

	ReactDOM.unmountComponentAtNode(container);
	cleanup();
});
