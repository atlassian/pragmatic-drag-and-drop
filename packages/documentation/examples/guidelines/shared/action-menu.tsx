import React, { type Ref } from 'react';

import { IconButton } from '@atlaskit/button/new';
import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
import EditorMoreIcon from '@atlaskit/icon/core/migration/show-more-horizontal--editor-more';
import { fg } from '@atlaskit/platform-feature-flags';

export function ActionMenu() {
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
			shouldRenderToParent={fg('should-render-to-parent-should-be-true-design-syst')}
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
