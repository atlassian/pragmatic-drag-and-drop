/* eslint-disable @atlaskit/design-system/no-html-button */
/**
 * @jsxRuntime classic
 * @jsx jsx
 */

import { Fragment, memo, useCallback, useContext, useEffect, useRef, useState } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';
import ReactDOM from 'react-dom';
import invariant from 'tiny-invariant';

import Button from '@atlaskit/button';
import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
// eslint-disable-next-line @atlaskit/design-system/no-banned-imports
import mergeRefs from '@atlaskit/ds-lib/merge-refs';
import FocusRing from '@atlaskit/focus-ring';
import ChevronDownIcon from '@atlaskit/icon/utility/migration/chevron-down';
import ChevronRightIcon from '@atlaskit/icon/utility/migration/chevron-right';
import MoreIcon from '@atlaskit/icon/utility/migration/show-more-horizontal--more';
import { ModalTransition } from '@atlaskit/modal-dialog';
import { type Instruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/list-item';
import { GroupDropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/group';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
	draggable,
	dropTargetForElements,
	type ElementDropTargetEventBasePayload,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { token } from '@atlaskit/tokens';

import { type TreeItem as TreeItemType } from '../../data/tree-legacy';

import { MoveDialog } from './move-dialog';
import { DependencyContext, TreeContext } from './tree-context';

const iconColor = token('color.icon', '#44546F');

function ChildIcon() {
	return (
		<svg aria-hidden={true} width={24} height={24} viewBox="0 0 24 24">
			<circle cx={12} cy={12} r={2} fill={iconColor} />
		</svg>
	);
}

function GroupIcon({ isOpen }: { isOpen: boolean }) {
	const Icon = isOpen ? ChevronDownIcon : ChevronRightIcon;
	return <Icon spacing="spacious" label="" color={iconColor} />;
}

function Icon({ item }: { item: TreeItemType }) {
	if (!item.children.length) {
		return <ChildIcon />;
	}
	return <GroupIcon isOpen={item.isOpen ?? false} />;
}

const outerStyles = css({
	// needed for our action button that uses position:absolute
	position: 'relative',
});

const outerButtonStyles = css({
	/**
	 * Without this Safari renders white text on drag.
	 */
	color: token('color.text', 'currentColor'),

	border: 0,
	width: '100%',
	position: 'relative',
	background: 'transparent',
	margin: 0,
	padding: 0,
	borderRadius: 3,
	cursor: 'pointer',
});

const outerHoverStyles = css({
	borderRadius: 3,
	cursor: 'pointer',
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
	':hover': {
		background: token('color.background.neutral.subtle.hovered', 'rgba(9, 30, 66, 0.06)'),
	},
});

const innerDraggingStyles = css({
	opacity: 0.4,
});

const innerButtonStyles = css({
	padding: token('space.100'),
	paddingRight: 40,
	alignItems: 'center',
	display: 'flex',
	flexDirection: 'row',

	background: token('color.background.neutral.subtle', 'transparent'),
	borderRadius: 3,
});

const idStyles = css({
	margin: 0,
	color: token('color.text.disabled', '#8993A5'),
});

const labelStyles = css({
	flexGrow: 1,
	overflow: 'hidden',
	textAlign: 'left',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
});

const indentPerLevel = token('space.250');

const indentStyles = css({
	paddingLeft: indentPerLevel,
});

const fullWidthStyle = css({
	position: 'absolute',
	inset: 0,
});

const previewStyles = css({
	background: token('elevation.surface.raised', 'red'),
	padding: token('space.100'),
	borderRadius: 3,
});

function Preview({ item }: { item: TreeItemType }) {
	return <div css={previewStyles}>Item {item.id}</div>;
}

function delay({ waitMs: timeMs, fn }: { waitMs: number; fn: () => void }): () => void {
	let timeoutId: number | null = window.setTimeout(() => {
		timeoutId = null;
		fn();
	}, timeMs);
	return function cancel() {
		if (timeoutId) {
			window.clearTimeout(timeoutId);
			timeoutId = null;
		}
	};
}

const TreeItem = memo(function TreeItem({
	item,
	level,
	index,
}: {
	item: TreeItemType;
	level: number;
	index: number;
}) {
	const buttonRef = useRef<HTMLButtonElement | null>(null);
	const groupRef = useRef<HTMLDivElement | null>(null);

	const [state, setState] = useState<'idle' | 'dragging' | 'preview'>('idle');
	const [groupState, setGroupState] = useState<'is-innermost-over' | 'idle'>('idle');
	const [instruction, setInstruction] = useState<Instruction | null>(null);
	const cancelExpandRef = useRef<(() => void) | null>(null);

	const { dispatch, uniqueContextId, getPathToItem, registerTreeItem } = useContext(TreeContext);
	const { DropIndicator, attachInstruction, extractInstruction } = useContext(DependencyContext);
	const toggleOpen = useCallback(() => {
		dispatch({ type: 'toggle', itemId: item.id });
	}, [dispatch, item]);

	const actionMenuTriggerRef = useRef<HTMLButtonElement>(null);
	useEffect(() => {
		invariant(buttonRef.current);
		invariant(actionMenuTriggerRef.current);
		return registerTreeItem({
			itemId: item.id,
			element: buttonRef.current,
			actionMenuTrigger: actionMenuTriggerRef.current,
		});
	}, [item.id, registerTreeItem]);

	const cancelExpand = useCallback(() => {
		cancelExpandRef.current?.();
		cancelExpandRef.current = null;
	}, []);

	useEffect(() => {
		invariant(buttonRef.current);

		function onChange({ self }: ElementDropTargetEventBasePayload) {
			const instruction = extractInstruction(self.data);

			// expand after 500ms if still merging
			if (
				instruction?.operation === 'combine' &&
				item.children.length &&
				!item.isOpen &&
				!cancelExpandRef.current
			) {
				cancelExpandRef.current = delay({
					waitMs: 500,
					fn: () => dispatch({ type: 'expand', itemId: item.id }),
				});
			}
			if (instruction?.operation !== 'combine' && cancelExpandRef.current) {
				cancelExpand();
			}

			setInstruction(instruction);
			return;
		}

		return combine(
			draggable({
				element: buttonRef.current,
				getInitialData: () => ({
					id: item.id,
					type: 'tree-item',
					isOpenOnDragStart: item.isOpen,
					uniqueContextId,
				}),
				onGenerateDragPreview: ({ nativeSetDragImage }) => {
					setCustomNativeDragPreview({
						getOffset: pointerOutsideOfPreview({ x: '16px', y: '8px' }),
						render: ({ container }) => {
							// eslint-disable-next-line react/no-deprecated
							ReactDOM.render(<Preview item={item} />, container);
							// eslint-disable-next-line react/no-deprecated
							return () => ReactDOM.unmountComponentAtNode(container);
						},
						nativeSetDragImage,
					});
				},
				onDragStart: ({ source }) => {
					setState('dragging');
					// collapse open items during a drag
					if (source.data.isOpenOnDragStart) {
						dispatch({ type: 'collapse', itemId: item.id });
					}
				},
				onDrop: ({ source }) => {
					setState('idle');
					if (source.data.isOpenOnDragStart) {
						dispatch({ type: 'expand', itemId: item.id });
					}
				},
			}),
			dropTargetForElements({
				element: buttonRef.current,
				getData: ({ input, element }) => {
					const data = { id: item.id };

					return attachInstruction(data, {
						input,
						element,
						operations: item.isDraft
							? { combine: 'blocked' }
							: {
									combine: 'available',
									'reorder-before': 'available',
									// Don't allow 'reorder-after' on expanded items
									'reorder-after':
										item.isOpen && item.children.length ? 'not-available' : 'available',
								},
					});
				},
				canDrop: ({ source }) =>
					source.data.type === 'tree-item' &&
					source.data.id !== item.id &&
					source.data.uniqueContextId === uniqueContextId,
				onDragEnter: onChange,
				onDrag: onChange,
				onDragLeave: () => {
					cancelExpand();
					setInstruction(null);
				},
				onDrop: () => {
					cancelExpand();
					setInstruction(null);
				},
			}),
		);
	}, [
		dispatch,
		item,
		cancelExpand,
		uniqueContextId,
		extractInstruction,
		attachInstruction,
		getPathToItem,
	]);

	useEffect(() => {
		const group = groupRef.current;
		// item has no children or is not open
		if (!group) {
			return;
		}

		function onChange({ location, self }: ElementDropTargetEventBasePayload) {
			const [innerMost] = location.current.dropTargets.filter(
				(dropTarget) => dropTarget.data.type === 'group',
			);

			setGroupState(innerMost?.element === self.element ? 'is-innermost-over' : 'idle');
		}

		return dropTargetForElements({
			element: group,
			canDrop: ({ source }) =>
				source.data.type === 'tree-item' &&
				source.data.id !== item.id &&
				source.data.uniqueContextId === uniqueContextId,
			getData: () => ({ type: 'group' }),
			getIsSticky: () => false,
			onDragStart: onChange,
			onDropTargetChange: onChange,
			onDragLeave: () => setGroupState('idle'),
			onDrop: () => setGroupState('idle'),
		});
	}, [item.id, uniqueContextId]);

	useEffect(
		function mount() {
			return function unmount() {
				cancelExpand();
			};
		},
		[cancelExpand],
	);

	const aria = (() => {
		if (!item.children.length) {
			return undefined;
		}
		return {
			'aria-expanded': item.isOpen,
			'aria-controls': `tree-item-${item.id}--subtree`,
		};
	})();

	const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
	const openMoveDialog = useCallback(() => {
		setIsMoveDialogOpen(true);
	}, []);
	const closeMoveDialog = useCallback(() => {
		setIsMoveDialogOpen(false);
	}, []);

	return (
		<Fragment>
			<div css={[outerStyles, state === 'idle' ? outerHoverStyles : undefined]}>
				<FocusRing isInset>
					<button
						{...aria}
						css={[outerButtonStyles]}
						id={`tree-item-${item.id}`}
						onClick={toggleOpen}
						ref={buttonRef}
						type="button"
						data-index={index}
						data-level={level}
						data-testid={`tree-item-${item.id}`}
					>
						<span css={[innerButtonStyles, state === 'dragging' ? innerDraggingStyles : undefined]}>
							<Icon item={item} />
							<span css={labelStyles}>Item {item.id}</span>
							<small css={idStyles}>{item.isDraft ? <code>Draft</code> : null}</small>
						</span>
						{instruction ? <DropIndicator instruction={instruction} /> : null}
						<span
							css={fullWidthStyle}
							style={{
								left: `calc(-1 * ${level} * ${indentPerLevel}`,
							}}
						/>
					</button>
				</FocusRing>
				<DropdownMenu
					trigger={({ triggerRef, ...triggerProps }) => (
						<Button
							ref={mergeRefs([triggerRef, actionMenuTriggerRef])}
							iconBefore={
								<MoreIcon
									label="Actions"
									LEGACY_size="small"
									color={token('color.icon.subtle', '#626F86')}
								/>
							}
							{...triggerProps}
							spacing="compact"
							// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
							style={{ position: 'absolute', top: 8, right: 8 }}
							appearance="subtle"
						/>
					)}
				>
					<DropdownItemGroup>
						<DropdownItem onClick={openMoveDialog}>Move</DropdownItem>
					</DropdownItemGroup>
				</DropdownMenu>
			</div>
			{item.children.length && item.isOpen ? (
				<div id={aria?.['aria-controls']} css={indentStyles}>
					<GroupDropIndicator isActive={groupState === 'is-innermost-over'} ref={groupRef}>
						{item.children.map((child, index) => {
							return <TreeItem item={child} key={child.id} level={level + 1} index={index} />;
						})}
					</GroupDropIndicator>
				</div>
			) : null}
			<ModalTransition>
				{isMoveDialogOpen && <MoveDialog onClose={closeMoveDialog} itemId={item.id} />}
			</ModalTransition>
		</Fragment>
	);
});

export default TreeItem;
