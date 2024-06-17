/** @jsx jsx */

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
import ChevronDownIcon from '@atlaskit/icon/glyph/chevron-down';
import ChevronRightIcon from '@atlaskit/icon/glyph/chevron-right';
import MoreIcon from '@atlaskit/icon/glyph/more';
import { ModalTransition } from '@atlaskit/modal-dialog';
import {
	type Instruction,
	type ItemMode,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
	draggable,
	dropTargetForElements,
	monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import type { DragLocationHistory } from '@atlaskit/pragmatic-drag-and-drop/types';
import { token } from '@atlaskit/tokens';

import { type TreeItem as TreeItemType } from '../../data/tree';

import { indentPerLevel } from './constants';
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
	return <Icon label="" primaryColor={iconColor} />;
}

function Icon({ item }: { item: TreeItemType }) {
	if (!item.children.length) {
		return <ChildIcon />;
	}
	return <GroupIcon isOpen={item.isOpen ?? false} />;
}

const outerButtonStyles = css({
	'--grid': '8px',
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
	padding: 'var(--grid)',
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

const debugStyles = css({
	position: 'absolute',
	right: 'var(--grid)',
	bottom: 0,
	fontSize: '6px',
});

const previewStyles = css({
	'--grid': '8px',
	background: token('elevation.surface.raised', 'red'),
	padding: 'var(--grid)',
	borderRadius: 3,
});

function Preview({ item }: { item: TreeItemType }) {
	return <div css={previewStyles}>Item {item.id}</div>;
}

const parentOfInstructionStyles = css({
	background: token('color.background.selected.hovered', 'transparent'),
});

function getParentLevelOfInstruction(instruction: Instruction): number {
	if (instruction.type === 'instruction-blocked') {
		return getParentLevelOfInstruction(instruction.desired);
	}
	if (instruction.type === 'reparent') {
		return instruction.desiredLevel - 1;
	}
	return instruction.currentLevel - 1;
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
	mode,
	level,
	index,
}: {
	item: TreeItemType;
	mode: ItemMode;
	level: number;
	index: number;
}) {
	const buttonRef = useRef<HTMLButtonElement>(null);

	const [state, setState] = useState<'idle' | 'dragging' | 'preview' | 'parent-of-instruction'>(
		'idle',
	);
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

	const clearParentOfInstructionState = useCallback(() => {
		setState((current) => (current === 'parent-of-instruction' ? 'idle' : current));
	}, []);

	// When an item has an instruction applied
	// we are highlighting it's parent item for improved clarity
	const shouldHighlightParent = useCallback(
		(location: DragLocationHistory): boolean => {
			const target = location.current.dropTargets[0];

			if (!target) {
				return false;
			}

			const instruction = extractInstruction(target.data);

			if (!instruction) {
				return false;
			}

			const targetId = target.data.id;
			invariant(typeof targetId === 'string');

			const path = getPathToItem(targetId);
			const parentLevel: number = getParentLevelOfInstruction(instruction);
			const parentId = path[parentLevel];
			return parentId === item.id;
		},
		[getPathToItem, extractInstruction, item],
	);

	useEffect(() => {
		invariant(buttonRef.current);

		function updateIsParentOfInstruction({ location }: { location: DragLocationHistory }) {
			if (shouldHighlightParent(location)) {
				setState('parent-of-instruction');
				return;
			}
			clearParentOfInstructionState();
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
							ReactDOM.render(<Preview item={item} />, container);
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
						indentPerLevel,
						currentLevel: level,
						mode,
						block: item.isDraft ? ['make-child'] : [],
					});
				},
				canDrop: ({ source }) =>
					source.data.type === 'tree-item' && source.data.uniqueContextId === uniqueContextId,
				getIsSticky: () => true,
				onDrag: ({ self, source }) => {
					const instruction = extractInstruction(self.data);

					if (source.data.id !== item.id) {
						// expand after 500ms if still merging
						if (
							instruction?.type === 'make-child' &&
							item.children.length &&
							!item.isOpen &&
							!cancelExpandRef.current
						) {
							cancelExpandRef.current = delay({
								waitMs: 500,
								fn: () => dispatch({ type: 'expand', itemId: item.id }),
							});
						}
						if (instruction?.type !== 'make-child' && cancelExpandRef.current) {
							cancelExpand();
						}

						setInstruction(instruction);
						return;
					}
					if (instruction?.type === 'reparent') {
						setInstruction(instruction);
						return;
					}
					setInstruction(null);
				},
				onDragLeave: () => {
					cancelExpand();
					setInstruction(null);
				},
				onDrop: () => {
					cancelExpand();
					setInstruction(null);
				},
			}),
			monitorForElements({
				canMonitor: ({ source }) => source.data.uniqueContextId === uniqueContextId,
				onDragStart: updateIsParentOfInstruction,
				onDrag: updateIsParentOfInstruction,
				onDrop() {
					clearParentOfInstructionState();
				},
			}),
		);
	}, [
		dispatch,
		item,
		mode,
		level,
		cancelExpand,
		uniqueContextId,
		extractInstruction,
		attachInstruction,
		getPathToItem,
		clearParentOfInstructionState,
		shouldHighlightParent,
	]);

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
			<div
				css={[state === 'idle' ? outerHoverStyles : undefined]}
				// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
				style={{ position: 'relative' }}
			>
				<FocusRing isInset>
					<button
						{...aria}
						css={[outerButtonStyles]}
						id={`tree-item-${item.id}`}
						onClick={toggleOpen}
						ref={buttonRef}
						type="button"
						// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values -- Ignored via go/DSP-18766
						style={{ paddingLeft: level * indentPerLevel }}
						data-index={index}
						data-level={level}
						data-testid={`tree-item-${item.id}`}
					>
						<span
							css={[
								innerButtonStyles,
								state === 'dragging'
									? innerDraggingStyles
									: state === 'parent-of-instruction'
										? parentOfInstructionStyles
										: undefined,
							]}
						>
							<Icon item={item} />
							<span css={labelStyles}>Item {item.id}</span>
							<small css={idStyles}>
								{item.isDraft ? <code>Draft</code> : null}
								<code css={debugStyles}>({mode})</code>
							</small>
						</span>
						{instruction ? <DropIndicator instruction={instruction} /> : null}
					</button>
				</FocusRing>
				<DropdownMenu
					trigger={({ triggerRef, ...triggerProps }) => (
						<Button
							ref={mergeRefs([triggerRef, actionMenuTriggerRef])}
							iconBefore={
								<MoreIcon
									label="Actions"
									size="small"
									primaryColor={token('color.icon.subtle', '#626F86')}
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
				<div id={aria?.['aria-controls']}>
					{item.children.map((child, index, array) => {
						const childType: ItemMode = (() => {
							if (child.children.length && child.isOpen) {
								return 'expanded';
							}

							if (index === array.length - 1) {
								return 'last-in-group';
							}

							return 'standard';
						})();
						return (
							<TreeItem
								item={child}
								key={child.id}
								level={level + 1}
								mode={childType}
								index={index}
							/>
						);
					})}
				</div>
			) : null}
			<ModalTransition>
				{isMoveDialogOpen && <MoveDialog onClose={closeMoveDialog} itemId={item.id} />}
			</ModalTransition>
		</Fragment>
	);
});

export default TreeItem;
