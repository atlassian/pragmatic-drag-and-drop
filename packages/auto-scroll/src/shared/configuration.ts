import type { InternalConfig, PublicConfig } from '../internal-types';

const baseConfig = {
	startHitboxAtPercentageRemainingOfElement: {
		top: 0.25,
		right: 0.25,
		bottom: 0.25,
		left: 0.25,
	},
	maxScrollAtPercentageRemainingOfHitbox: {
		top: 0.5,
		right: 0.5,
		bottom: 0.5,
		left: 0.5,
	},
	timeDampeningDurationMs: 300,
	// Too big and it's too easy to trigger auto scrolling
	// Too small and it's too hard 😅
	maxMainAxisHitboxSize: 180,
};

/** What the max scroll should be per second. Using "per second" rather than "per frame"
 * as we want a consistent scroll speed regardless of frame rate.
 *
 *
 * I explored trying to make the max scroll speed dynamic based on particular factors.
 * However, it ended up being difficult to find a _perfect_ formula.
 *
 * Likely the perfect answer would involve:
 * - the size of the scrollable element
 * - the size of the scrollable element relative to the screen size
 * - the size of the drag preview
 * - the size of elements being scrolled in scrollable elements (expensive and difficult to compute)
 */
const maxPixelScrollPerSecond: {
	[Key in Required<PublicConfig>['maxScrollSpeed']]: number;
} = {
	// What the value would be if we were scrolling at 15px per frame at 60fps.
	// This is the default as it works well for most experiences.
	// In certain scenarios though it can feel a bit slow.
	standard: 15 * 60,
	// What the value would be if we were scrolling at 25px per frame at 60fps.
	// This is not the default as it feels too fast for a lot of experiences.
	fast: 25 * 60,
};

export function getInternalConfig(provided?: PublicConfig | undefined): InternalConfig {
	return {
		...baseConfig,
		// only allowing limited control over the config at this stage
		maxPixelScrollPerSecond: maxPixelScrollPerSecond[provided?.maxScrollSpeed ?? 'standard'],
	};
}
