import type { AllDragTypes, Input, Position } from '@atlaskit/pragmatic-drag-and-drop/types';

import type { AllowedAxis, Axis, Edge, InternalConfig, Spacing } from '../internal-types';
import { canScrollOnEdge } from '../shared/can-scroll-on-edge';
import { edgeAxisLookup, edges } from '../shared/edges';
import { markAndGetEngagement } from '../shared/engagement-history';
import { getScrollChange } from '../shared/get-scroll-change';
import { isAxisAllowed } from '../shared/is-axis-allowed';
import { isWithin } from '../shared/is-within';

import { getHitbox } from './hitbox';
import {
	type HitboxSpacing,
	type ProvidedHitboxSpacing,
	type UnsafeOverflowAutoScrollArgs,
} from './types';

export type HitboxForEdge = {
	edge: Edge;
	type: 'inside-of-edge' | 'outside-of-edge';
	hitbox: DOMRect;
};

// Distance dampening is enabled when we are inside the edge
// In order to match "over element" scrolling
function getIsDistanceDampeningEnabled(value: HitboxForEdge): boolean {
	return value.type === 'inside-of-edge';
}

function getSpacingFromProvided(value: Partial<Spacing> | undefined): Spacing {
	return {
		top: value?.top ?? 0,
		right: value?.right ?? 0,
		bottom: value?.bottom ?? 0,
		left: value?.left ?? 0,
	};
}

function getHitboxSpacing(provided: ProvidedHitboxSpacing): HitboxSpacing {
	return {
		top: getSpacingFromProvided(provided.fromTopEdge),
		right: getSpacingFromProvided(provided.fromRightEdge),
		bottom: getSpacingFromProvided(provided.fromBottomEdge),
		left: getSpacingFromProvided(provided.fromLeftEdge),
	};
}

export function getScrollBy<DragType extends AllDragTypes>({
	entry,
	timeSinceLastFrame,
	input,
	config,
	allowedAxis,
}: {
	entry: UnsafeOverflowAutoScrollArgs<DragType>;
	input: Input;
	allowedAxis: AllowedAxis;
	timeSinceLastFrame: number;
	config: InternalConfig;
}): Pick<ScrollToOptions, 'top' | 'left'> | null {
	const client: Position = {
		x: input.clientX,
		y: input.clientY,
	};

	// 🔥
	// For each registered item we need to do `getBoundingClientRect()` which is not great
	// Why?
	// 1. The hitbox can extend outside of an elements bounds
	// 2. We want overflow scrolling to start before the user has entered the bounds of the element
	//     Otherwise we could search upwards in the DOM from the `elementFromPoint`
	const clientRect: DOMRect = entry.element.getBoundingClientRect();
	const overflow = getHitboxSpacing(entry.getOverflow());

	const inHitboxForEdge: HitboxForEdge[] = edges
		.map((edge): HitboxForEdge | false => {
			const { insideOfEdge, outsideOfEdge } = getHitbox[edge]({
				clientRect,
				overflow,
				config,
			});

			/** Note:
			 * Intentionally _not_ doing an explicit check to
			 * see if `client` is with within the `overElementHitbox`.
			 *
			 * **Why?**
			 *
			 * 1. 🥱 Redundant
			 * This check is already achieved by `element.contains(underUsersPointer)`
			 *
			 * 2. 📐 Overlap on boundaries
			 * Two elements can share the same `{x,y}` points on shared edges.
			 * It's not clear which of the two will be picked by
			 * `const underUsersPointer = document.elementFromPoint(x,y)`
			 * The edge of an "outside" element, can have shared `{x,y}`
			 * values along the edge of an "inside element".
			 * So when `underUsersPointer` is the "outer" element, the `client`
			 * point might actually be also within the "inner" element.
			 * We are exclusively relying on `underUsersPointer` make the decision
			 * on what we are "over" so we should not be doing "over element" hitbox
			 * testing here.
			 * https://twitter.com/alexandereardon/status/1721758766507638996
			 *
			 *
			 * 3. 🐞 Chrome bug
			 * `document.elementFromPoint(x, y)` can return an element that does not contain `{x,y}`,
			 * In these cases, `isWithin({client, clientRect: overElementHitbox})` can return `false`.
			 * https://bugs.chromium.org/p/chromium/issues/detail?id=1500073
			 */

			if (isWithin({ client, clientRect: outsideOfEdge })) {
				return {
					edge,
					hitbox: outsideOfEdge,
					type: 'outside-of-edge',
				};
			}

			if (isWithin({ client, clientRect: insideOfEdge })) {
				return {
					edge,
					hitbox: insideOfEdge,
					type: 'inside-of-edge',
				};
			}

			return false;
		})
		.filter((value): value is HitboxForEdge => Boolean(value));

	if (!inHitboxForEdge.length) {
		return null;
	}

	// Even if no edges are scrollable, we are marking the element
	// as being engaged with to start applying time dampening
	const engagement = markAndGetEngagement(entry.element);

	// Note: changing the allowed axis during a drag will not
	// reset time dampening. It was decided it would be too
	// complex to implement initially, and we can add it
	// later if needed.
	const scrollableEdges: HitboxForEdge[] = inHitboxForEdge.filter(
		(value) =>
			isAxisAllowed(edgeAxisLookup[value.edge], allowedAxis) &&
			canScrollOnEdge[value.edge](entry.element),
	);

	// Nothing can be scrolled
	if (!scrollableEdges.length) {
		return null;
	}

	const lookup = new Map<Edge, HitboxForEdge>(scrollableEdges.map((value) => [value.edge, value]));

	const left: number = (() => {
		const axis: Axis = 'horizontal';
		const leftEdge = lookup.get('left');
		if (leftEdge) {
			return getScrollChange({
				client,
				isDistanceDampeningEnabled: getIsDistanceDampeningEnabled(leftEdge),
				hitbox: leftEdge.hitbox,
				edge: 'left',
				axis,
				timeSinceLastFrame,
				engagement,
				config,
			});
		}
		const rightEdge = lookup.get('right');
		if (rightEdge) {
			return getScrollChange({
				client,
				isDistanceDampeningEnabled: getIsDistanceDampeningEnabled(rightEdge),
				hitbox: rightEdge.hitbox,
				edge: 'right',
				axis,
				timeSinceLastFrame,
				engagement,
				config,
			});
		}

		return 0;
	})();

	const top: number = (() => {
		const axis: Axis = 'vertical';
		const bottomEdge = lookup.get('bottom');
		if (bottomEdge) {
			return getScrollChange({
				client,
				isDistanceDampeningEnabled: getIsDistanceDampeningEnabled(bottomEdge),
				hitbox: bottomEdge.hitbox,
				edge: 'bottom',
				axis,
				timeSinceLastFrame,
				engagement,
				config,
			});
		}
		const topEdge = lookup.get('top');
		if (topEdge) {
			return getScrollChange({
				client,
				isDistanceDampeningEnabled: getIsDistanceDampeningEnabled(topEdge),
				hitbox: topEdge.hitbox,
				edge: 'top',
				axis,
				timeSinceLastFrame,
				engagement,
				config,
			});
		}

		return 0;
	})();

	return {
		left,
		top,
	};
}
