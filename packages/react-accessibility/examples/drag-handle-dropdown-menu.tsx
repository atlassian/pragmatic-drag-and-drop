import React, { useRef } from 'react';

import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
// eslint-disable-next-line @atlaskit/design-system/no-banned-imports
import mergeRefs from '@atlaskit/ds-lib/merge-refs';

import { DragHandleButton } from '../src/drag-handle-button';

export default function DragHandleDropdownMenuExample() {
	// This ref can be used to set your `dragHandle` when calling `draggable()`
	const myRef = useRef<HTMLButtonElement>(null);

	return (
		<DropdownMenu
			trigger={({ triggerRef, ...triggerProps }) => (
				<DragHandleButton ref={mergeRefs([myRef, triggerRef])} {...triggerProps} label="Reorder" />
			)}
		>
			<DropdownItemGroup>
				<DropdownItem>Move up</DropdownItem>
				<DropdownItem>Move down</DropdownItem>
			</DropdownItemGroup>
		</DropdownMenu>
	);
}
