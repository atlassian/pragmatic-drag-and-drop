import React, { type Ref } from 'react';

import IconButton from '@atlaskit/button/icon/button';
import DropdownMenu from '@atlaskit/dropdown-menu/dropdown-menu';
import DropdownItem from '@atlaskit/dropdown-menu/dropdown-menu-item';
import DropdownItemGroup from '@atlaskit/dropdown-menu/dropdown-menu-item-group';
import EditorMoreIcon from '@atlaskit/icon/core/show-more-horizontal';

export function ActionMenu(): React.JSX.Element {
	return (
		<DropdownMenu
			trigger={({ triggerRef, ...triggerProps }) => (
				<IconButton
					ref={triggerRef as Ref<HTMLButtonElement>}
					label="More actions"
					icon={EditorMoreIcon}
					spacing="compact"
					{...triggerProps}
				/>
			)}
			shouldRenderToParent
		>
			<DropdownItemGroup>
				<DropdownItem>Move to top</DropdownItem>
				<DropdownItem>Move up</DropdownItem>
				<DropdownItem>Move down</DropdownItem>
				<DropdownItem>Move to bottom</DropdownItem>
			</DropdownItemGroup>
			<DropdownItemGroup hasSeparator>
				<DropdownItem>Add label</DropdownItem>
				<DropdownItem>Change parent</DropdownItem>
			</DropdownItemGroup>
			<DropdownItemGroup hasSeparator>
				<DropdownItem>Remove from sprint</DropdownItem>
				<DropdownItem>Delete</DropdownItem>
			</DropdownItemGroup>
		</DropdownMenu>
	);
}
