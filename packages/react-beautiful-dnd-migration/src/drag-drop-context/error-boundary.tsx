import React, { type ReactElement, useCallback, useEffect, useRef } from 'react';

import { bind } from 'bind-event-listener';

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import { error, warning } from '../dev-warning';

import { cancelPointerDrag } from './cancel-drag';
import { RbdInvariant } from './rbd-invariant';
import type { DragController } from './types';

type ErrorBoundaryProps = {
	children: ReactElement;
	contextId: string;
	dragController: DragController;
};

/**
 * This component holds the actual error boundary logic.
 */
function ErrorBoundaryInner({ children, dragController }: ErrorBoundaryProps) {
	const isDraggingRef = useRef(false);

	const handleWindowError = useCallback(
		(event: ErrorEvent) => {
			const dragState = dragController.getDragState();

			if (!dragState.isDragging) {
				return;
			}

			if (dragState.mode === 'FLUID') {
				cancelPointerDrag();
			}

			if (dragState.mode === 'SNAP') {
				dragController.stopDrag({ reason: 'CANCEL' });
			}

			if (process.env.NODE_ENV !== 'production') {
				warning(`
          An error was caught by our window 'error' event listener while a drag was occurring.
          The active drag has been aborted.
        `);
			}

			const err: Error = event.error;

			if (err instanceof RbdInvariant) {
				// Marking the event as dealt with.
				// This will prevent any 'uncaught' error warnings in the console
				event.preventDefault();
				if (process.env.NODE_ENV !== 'production') {
					error(err.message);
				}
			}
		},
		[dragController],
	);

	useEffect(() => {
		return combine(
			monitorForElements({
				onDragStart() {
					isDraggingRef.current = true;
				},
				onDrop() {
					isDraggingRef.current = false;
				},
			}),
			bind(window, { type: 'error', listener: handleWindowError as any }),
		);
	}, [handleWindowError]);

	return children;
}

/**
 * Cancels drags when errors occur.
 */
// We have to use a class component to create an error boundary
// eslint-disable-next-line @repo/internal/react/no-class-components
export class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
	componentDidCatch(err: Error) {
		if (err instanceof RbdInvariant) {
			if (process.env.NODE_ENV !== 'production') {
				error(err.message);
			}
			return;
		}

		// throwing error for other error boundaries
		throw err;
	}

	static getDerivedStateFromError() {
		// Intentionally blank, because this method needs to be defined
	}

	render() {
		return (
			<ErrorBoundaryInner
				contextId={this.props.contextId}
				dragController={this.props.dragController}
			>
				{this.props.children}
			</ErrorBoundaryInner>
		);
	}
}
