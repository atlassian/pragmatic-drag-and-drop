/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import { type ReactElement, useCallback } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';

import Button from '@atlaskit/button';
import DropdownMenu, {
	type CustomTriggerProps,
	DropdownItem,
	DropdownItemGroup,
} from '@atlaskit/dropdown-menu';
import MoreIcon from '@atlaskit/icon/core/show-more-horizontal';
import { fg } from '@atlaskit/platform-feature-flags';

import { usePreventScrollingFromArrowKeys } from '../hooks/use-prevent-scrolling-from-arrow-keys';
import type { ReorderItem } from '../subtasks/hooks/use-top-level-wiring';

// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
const hiddenStyles = css({ opacity: 0, ':focus-within': { opacity: 1 } });

type ChildrenRenderFn = (args: { children: ReactElement; isSelected: boolean }) => ReactElement;

const defaultChildrenRenderFn: ChildrenRenderFn = ({ children }) => children;

export function MenuButton({
	id,
	reorderItem,
	index,
	dataLength,
	size = 'medium',
	isOnlyVisibleWhenFocused = false,
	children = defaultChildrenRenderFn,
}: {
	id: string;
	reorderItem: ReorderItem;
	index: number;
	dataLength: number;
	size?: 'small' | 'medium';
	isOnlyVisibleWhenFocused?: boolean;
	children?: ChildrenRenderFn;
}) {
	const moveUp = useCallback(() => {
		reorderItem({ id, action: 'up' });
	}, [id, reorderItem]);

	const moveDown = useCallback(() => {
		reorderItem({ id, action: 'down' });
	}, [id, reorderItem]);

	const isMoveUpDisabled = index === 0;
	const isMoveDownDisabled = index === dataLength - 1;

	const renderTrigger = useCallback(
		(triggerProps: CustomTriggerProps) => {
			return (
				<MenuButtonTrigger
					size={size}
					children={children}
					isOnlyVisibleWhenFocused={isOnlyVisibleWhenFocused}
					{...triggerProps}
				/>
			);
		},
		[children, isOnlyVisibleWhenFocused, size],
	);

	return (
		<DropdownMenu
			trigger={renderTrigger}
			placement="bottom-start"
			shouldRenderToParent={fg('should-render-to-parent-should-be-true-design-syst')}
		>
			<DropdownItemGroup>
				<DropdownItem onClick={moveUp} isDisabled={isMoveUpDisabled}>
					Move up
				</DropdownItem>
				<DropdownItem onClick={moveDown} isDisabled={isMoveDownDisabled}>
					Move down
				</DropdownItem>
			</DropdownItemGroup>
		</DropdownMenu>
	);
}

type MenuButtonTriggerOwnProps = {
	children: ChildrenRenderFn;
	size: 'small' | 'medium';
	isOnlyVisibleWhenFocused: boolean;
};

type MenuButtonTriggerProps = CustomTriggerProps & MenuButtonTriggerOwnProps;

function MenuButtonTrigger({
	triggerRef,
	children,
	size,
	isOnlyVisibleWhenFocused,
	...props
}: MenuButtonTriggerProps) {
	const spacing = size === 'small' ? 'compact' : 'default';

	const isSelected = Boolean(props.isSelected);

	usePreventScrollingFromArrowKeys({
		shouldPreventScrolling: isSelected,
	});

	return children({
		isSelected,
		children: (
			<Button
				ref={triggerRef}
				{...props}
				iconBefore={
					<MoreIcon
						spacing="compact"
						color="currentColor"
						label="actions"
						LEGACY_size={size}
						size="small"
					/>
				}
				spacing={spacing}
				css={isOnlyVisibleWhenFocused && !props.isSelected && hiddenStyles}
			/>
		),
	});
}
