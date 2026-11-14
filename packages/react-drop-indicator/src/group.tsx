/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import {
	forwardRef,
	type ForwardRefExoticComponent,
	type ReactNode,
	type RefAttributes,
} from 'react';

import { cssMap, jsx } from '@compiled/react';

import { token } from '@atlaskit/tokens';

import type { Colors } from './types';

const styles = cssMap({
	active: {
		borderRadius: token('radius.xsmall'),
		outlineOffset: token('space.075'),
		outlineWidth: token('border.width.selected'),
		outlineStyle: 'solid',
	},
	standard: {
		backgroundColor: token('color.background.information'),
		outlineColor: token('color.border.selected'),
	},
	dedicated: {
		backgroundColor: token('color.background.droptarget'),
		outlineColor: token('color.border.dropindicator'),
	},
});

type GroupDropIndicatorProps = {
	children: ReactNode;
	isActive: boolean;
	testId?: string;
	/** Token roles to use. Defaults to `standard`. */
	colors?: Colors;
};

/**
 * A drop indicator to be used when dragging over a group of items
 */
export const GroupDropIndicator: ForwardRefExoticComponent<
	GroupDropIndicatorProps & RefAttributes<HTMLDivElement>
> = forwardRef<HTMLDivElement, GroupDropIndicatorProps>(function GroupDropIndicator(
	{ children, isActive, testId, colors = 'standard' },
	forwardedRef,
) {
	return (
		<div
			ref={forwardedRef}
			css={[isActive && styles.active, isActive && styles[colors]]}
			data-testid={testId}
		>
			{children}
		</div>
	);
});
