import React, { useRef } from 'react';

import DropdownMenu from '@atlaskit/dropdown-menu/dropdown-menu';
import DropdownItem from '@atlaskit/dropdown-menu/dropdown-menu-item';
import DropdownItemGroup from '@atlaskit/dropdown-menu/dropdown-menu-item-group';
// eslint-disable-next-line @atlaskit/design-system/no-banned-imports
import mergeRefs from '@atlaskit/ds-lib/merge-refs';

import { DragHandleButton } from '../src/drag-handle-button';

export default function DragHandleDropdownMenuExample(): React.JSX.Element {
	// This ref can be used to set your `dragHandle` when calling `draggable()`
	const myRef = useRef<HTMLButtonElement>(null);

	return (
		<React.StrictMode>
			<DropdownMenu
				trigger={({ triggerRef, ...triggerProps }) => (
					<DragHandleButton
						ref={mergeRefs([myRef, triggerRef])}
						{...triggerProps}
						label="Reorder"
					/>
				)}
				shouldRenderToParent
			>
				<DropdownItemGroup>
					<DropdownItem>Move up</DropdownItem>
					<DropdownItem>Move down</DropdownItem>
				</DropdownItemGroup>
			</DropdownMenu>
		</React.StrictMode>
	);
}
