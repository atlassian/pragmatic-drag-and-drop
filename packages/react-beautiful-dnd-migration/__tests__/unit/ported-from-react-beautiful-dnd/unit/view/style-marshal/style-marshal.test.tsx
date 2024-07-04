/**
 * These tests are loosely ported from `react-beautiful-dnd`.
 *
 * They were originally written as white box tests, and tested the style
 * marshal directly.
 *
 * They've been rewritten as black box tests that only use the public API.
 *
 * Many of them have also been removed due to simplifications in the
 * style marshal.
 */

import React from 'react';

import { render } from '@testing-library/react';
import type { ContextId } from 'react-beautiful-dnd';
import invariant from 'tiny-invariant';

import { DragDropContext, Draggable, Droppable } from '../../../../../../src';

function getStyleTagSelector(contextId: ContextId) {
	return `style[data-rbd-style-context-id="${contextId}"]`;
}

const getStyleTag = (contextId: ContextId): HTMLStyleElement => {
	const selector: string = getStyleTagSelector(contextId);
	const el = document.querySelector(selector);
	invariant(el instanceof HTMLStyleElement, 'expected style tag should exist');
	return el;
};

function App({ nonce }: { nonce?: string }) {
	return (
		<DragDropContext onDragEnd={() => {}} nonce={nonce}>
			<Droppable droppableId="droppable">
				{(provided) => (
					<div ref={provided.innerRef} {...provided.droppableProps}>
						<Draggable draggableId="draggable" index={0}>
							{(provided) => (
								<div
									ref={provided.innerRef}
									{...provided.draggableProps}
									{...provided.dragHandleProps}
								>
									Draggable
								</div>
							)}
						</Draggable>
					</div>
				)}
			</Droppable>
		</DragDropContext>
	);
}

let instanceId = 0;
function renderApp(args?: { nonce?: string }) {
	const { nonce } = args ?? {};
	const wrapper = render(<App nonce={nonce} />);
	return { ...wrapper, contextId: String(instanceId++) };
}

it('should not mount style tags until mounted', () => {
	// // initially there is no style tag
	expect(document.head.childElementCount).toBe(0);

	// now mounting
	const { contextId, unmount } = renderApp();

	const selector: string = getStyleTagSelector(contextId);

	// elements should now exist
	expect(document.querySelector(selector)).toBeInstanceOf(HTMLStyleElement);

	unmount();
});

it('should remove the style tag from the head when unmounting', () => {
	const { contextId, unmount } = renderApp();
	const selector: string = getStyleTagSelector(contextId);

	// the style tag exists
	expect(document.querySelector(selector)).toBeTruthy();

	// now unmounted
	unmount();

	expect(document.querySelector(selector)).not.toBeTruthy();
});

it('should have the expected styles', () => {
	const { contextId, unmount } = renderApp();

	const styleTag = getStyleTag(contextId);
	expect(styleTag.innerHTML).toMatchInlineSnapshot(
		`"[data-rbd-drag-handle-context-id="2"] { cursor: grab; -webkit-touch-callout: none; }"`,
	);

	unmount();
});

it('should insert nonce into tag attribute', () => {
	const nonce = 'ThisShouldBeACryptographicallySecurePseudoRandomNumber';
	const { contextId, unmount } = renderApp({ nonce });

	const styleTag = getStyleTag(contextId);
	const styleTagNonce = styleTag ? styleTag.getAttribute('nonce') : '';

	// the style tag exists
	expect(styleTagNonce).toEqual(nonce);

	// now unmounted
	unmount();
});
