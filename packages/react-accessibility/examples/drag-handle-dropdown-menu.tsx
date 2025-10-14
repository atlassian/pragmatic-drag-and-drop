import React, { useRef } from 'react';

import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
// eslint-disable-next-line @atlaskit/design-system/no-banned-imports
import mergeRefs from '@atlaskit/ds-lib/merge-refs';
import { fg } from '@atlaskit/platform-feature-flags';

import { DragHandleButton } from '../src/drag-handle-button';

export default function DragHandleDropdownMenuExample() {
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
				shouldRenderToParent={fg('should-render-to-parent-should-be-true-design-syst')}
			>
				<DropdownItemGroup>
					<DropdownItem>Move up</DropdownItem>
					<DropdownItem>Move down</DropdownItem>
				</DropdownItemGroup>
			</DropdownMenu>
		</React.StrictMode>
	);
}
