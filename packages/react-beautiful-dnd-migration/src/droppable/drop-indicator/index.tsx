/**
 * @jsxRuntime classic
 * @jsx jsx
 */

import { useCallback, useLayoutEffect, useRef, useState } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx, type SerializedStyles } from '@emotion/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import type { Direction, DraggableLocation, DroppableMode } from 'react-beautiful-dnd';

import { token } from '@atlaskit/tokens';

import { isSameLocation } from '../../drag-drop-context/draggable-location';
import { getActualDestination } from '../../drag-drop-context/get-destination';
import { useDragDropContext } from '../../drag-drop-context/internal-context';
import { useMonitorForLifecycle } from '../../drag-drop-context/lifecycle-context';
import { rbdInvariant } from '../../drag-drop-context/rbd-invariant';
import { customAttributes } from '../../utils/attributes';

import { directionMapping, lineOffset, lineThickness } from './constants';
import { getIndicatorSizeAndOffset } from './get-dimensions';
import type { IndicatorSizeAndOffset } from './types';

type DropIndicatorProps = {
	direction: Direction;
	mode: DroppableMode;
};

const scrollMarginTop = lineThickness + 2 * lineOffset;

const baseStyles = css({
	background: token('color.border.brand'),
	/**
	 * Ensures that when the indicator is scrolled into view there is visual
	 * space around it.
	 *
	 * Otherwise it will hug the edge of the container and be hard to see.
	 */
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
	scrollMarginTop,
	/**
	 * The bottom margin needs to be slightly bigger for the gap to look
	 * the same visually.
	 *
	 * It's unclear why, this was found through testing.
	 */
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-values, @atlaskit/ui-styling-standard/no-imported-style-values -- Ignored via go/DSP-18766
	scrollMarginBottom: scrollMarginTop + lineOffset,
});

/**
 * For virtual lists, the indicator might not be a sibling of the contents.
 * This can lead to issues like wrapping.
 *
 * This style 'resets' it so that there is a consistent initial position.
 */
const virtualStyles = css({ position: 'absolute', top: 0, left: 0 });

/**
 * When targeting the source location, we hide the drop indicator.
 * But it should still be scrolled to, so we only want to hide it visually,
 * instead of not rendering it.
 */
const visuallyHiddenStyles = css({ opacity: 0 });

const directionStyles: Record<Direction, SerializedStyles> = {
	horizontal: css({
		// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values, @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
		width: lineThickness,
		height: '100%',
		// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-values, @atlaskit/ui-styling-standard/no-imported-style-values -- Ignored via go/DSP-18766
		marginLeft: -lineThickness,
	}),
	vertical: css({
		width: '100%',
		// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values, @atlaskit/ui-styling-standard/no-unsafe-values -- Ignored via go/DSP-18766
		height: lineThickness,
		// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-values, @atlaskit/ui-styling-standard/no-imported-style-values -- Ignored via go/DSP-18766
		marginTop: -lineThickness,
	}),
};

function getDynamicStyles({
	direction,
	dimensions,
	indicatorOffset,
}: {
	direction: Direction;
	dimensions: IndicatorSizeAndOffset | null;
	indicatorOffset: number;
}): React.CSSProperties {
	if (dimensions === null) {
		/**
		 * We hide the indicator initially until dimensions can be taken.
		 */
		return { opacity: 0 };
	}

	const { mainAxis, crossAxis } = directionMapping[direction];

	return {
		transform: `${mainAxis.style.transform}(${dimensions.mainAxis.offset - indicatorOffset}px)`,
		[crossAxis.style.length]: dimensions.crossAxis.length,
		[crossAxis.style.offset]: dimensions.crossAxis.offset,
	};
}

const dropIndicatorData = {
	[customAttributes.dropIndicator]: '',
};

export const DropIndicator = ({ direction, mode }: DropIndicatorProps) => {
	const { contextId, getDragState } = useDragDropContext();

	const ref = useRef<HTMLDivElement>(null);

	const [dimensions, setDimensions] = useState<IndicatorSizeAndOffset | null>(null);
	const [isHidden, setIsHidden] = useState(false);

	const monitorForLifecycle = useMonitorForLifecycle();

	const updateIndicator = useCallback(
		({
			targetLocation,
			source,
			destination,
		}: {
			targetLocation: DraggableLocation | null;
			source: DraggableLocation;
			destination: DraggableLocation | null;
		}) => {
			if (!targetLocation) {
				return setDimensions(null);
			}

			const isInHomeLocation = isSameLocation(source, destination);

			/**
			 * Determines if the drop indicator should be hidden.
			 *
			 * This is desired when the current drop target would not change the position
			 * of the draggable.
			 */
			setIsHidden(isInHomeLocation);

			return setDimensions(
				getIndicatorSizeAndOffset({
					targetLocation,
					isInHomeLocation,
					direction,
					mode,
					contextId,
				}),
			);
		},
		[contextId, direction, mode],
	);

	/**
	 * This is in a `useLayoutEffect` for immediacy.
	 *
	 * When mounting (cross-axis movement) the indicator should update into
	 * its correct position right away, so that the drag preview can be placed
	 * correctly.
	 */
	useLayoutEffect(() => {
		const dragState = getDragState();
		if (!dragState.isDragging) {
			return;
		}

		/**
		 * If the indicator is only just mounting then it needs an immediate
		 * update to have it appear in the correct position.
		 */
		const { targetLocation, sourceLocation } = dragState;
		const destination = getActualDestination({
			start: sourceLocation,
			target: targetLocation,
		});
		updateIndicator({ targetLocation, destination, source: sourceLocation });

		return monitorForLifecycle({
			onPrePendingDragUpdate({ update, targetLocation }) {
				const { destination = null, source } = update;

				updateIndicator({ targetLocation, source, destination });
			},
		});
	}, [contextId, direction, getDragState, mode, monitorForLifecycle, updateIndicator]);

	/**
	 * Scroll the indicator into view.
	 *
	 * This is in a `useLayoutEffect` for immediacy.
	 * Otherwise the keyboard drag preview can appear in the wrong (old) location.
	 */
	useLayoutEffect(() => {
		if (dimensions === null) {
			return;
		}

		/**
		 * If we are doing a mouse drag,
		 * then we don't want to scroll to the indicator.
		 *
		 * Otherwise, it will conflict with the auto-scroll addon.
		 */
		const dragState = getDragState();
		if (!dragState.isDragging || dragState.mode !== 'SNAP') {
			return;
		}

		const element = ref.current;
		rbdInvariant(element instanceof HTMLElement);

		element.scrollIntoView({ block: 'nearest' });
	}, [dimensions, getDragState]);

	const { mainAxis } = directionMapping[direction];
	const indicatorOffset = ref.current ? ref.current[mainAxis.offset] : 0;
	const dynamicStyles = getDynamicStyles({
		direction,
		dimensions,
		indicatorOffset,
	});

	const isVirtual = mode === 'virtual';

	return (
		<div
			ref={ref}
			css={[
				baseStyles,
				directionStyles[direction],
				isVirtual && virtualStyles,
				isHidden && visuallyHiddenStyles,
			]}
			// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
			style={dynamicStyles}
			{...dropIndicatorData}
		/>
	);
};
