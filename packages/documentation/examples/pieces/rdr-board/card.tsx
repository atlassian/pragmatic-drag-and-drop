/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import {
	forwardRef,
	Fragment,
	memo,
	type Ref,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';
import ReactDOM from 'react-dom';
import invariant from 'tiny-invariant';

import Avatar from '@atlaskit/avatar';
import Badge from '@atlaskit/badge';
import Button from '@atlaskit/button';
import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
// eslint-disable-next-line @atlaskit/design-system/no-banned-imports
import mergeRefs from '@atlaskit/ds-lib/merge-refs';
import { IconTile } from '@atlaskit/icon';
import StoryIcon16 from '@atlaskit/icon-object/glyph/story/16';
import PullRequestIcon from '@atlaskit/icon/core/migration/pull-request--bitbucket-pullrequests';
import MoreIcon from '@atlaskit/icon/core/migration/show-more-horizontal--more';
import StoryIcon from '@atlaskit/icon/core/story';
import {
	attachClosestEdge,
	type Edge,
	extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
	draggable,
	dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { dropTargetForExternal } from '@atlaskit/pragmatic-drag-and-drop/external/adapter';
import { Box, Inline, Stack, xcss } from '@atlaskit/primitives';

import { useBoardContext } from './board-context';
import { CardStack } from './card-stack';
import { useColumnContext } from './column-context';
import { type CardData, type ColumnType } from './data';
import { EpicLozenge } from './epic-lozenge';

type DraggableState =
	| { type: 'idle' }
	| {
			type: 'preview';
			container: HTMLElement;
			rect: DOMRect;
			numSelected: number;
	  }
	| { type: 'dragging' };

const idleState: DraggableState = { type: 'idle' };
const draggingState: DraggableState = { type: 'dragging' };

const noPointerEventsStyles = css({ pointerEvents: 'none' });
const containerStyles = xcss({
	width: '100%',
	boxShadow: 'elevation.shadow.raised',
	position: 'relative',

	backgroundColor: 'elevation.surface.raised',
	borderRadius: '4px',
	paddingInline: 'space.200',
	paddingBlock: 'space.150',
	cursor: 'grab',

	borderWidth: 'border.width',
	borderStyle: 'solid',
	// @ts-expect-error
	borderColor: 'transparent',

	'--action-opacity': 0,
	':hover': {
		// @ts-expect-error
		'--action-opacity': 1,
		backgroundColor: 'elevation.surface.raised.hovered',
	},
});

const selectedStyles = xcss({
	backgroundColor: 'color.background.selected',
	borderColor: 'color.border.selected',
	':hover': {
		backgroundColor: 'color.background.selected.hovered',
	},
});

const actionStyles = xcss({
	opacity: 'var(--action-opacity)',
	':focus-within': {
		opacity: 1,
	},
});

const draggingStyles = xcss({
	opacity: 0.6,
});

type CardPrimitiveProps = {
	closestEdge: Edge | null;
	item: CardData;
	state: DraggableState;
	actionMenuTriggerRef?: Ref<HTMLButtonElement>;
	isSelected?: boolean;
	onClick?: React.MouseEventHandler;
};

function MoveToOtherColumnItem({
	targetColumn,
	startIndex,
}: {
	targetColumn: ColumnType;
	startIndex: number;
}) {
	const { moveCard } = useBoardContext();
	const { columnId } = useColumnContext();

	const onClick = useCallback(() => {
		moveCard({
			startColumnId: columnId,
			finishColumnId: targetColumn.columnId,
			itemIndexInStartColumn: startIndex,
		});
	}, [columnId, moveCard, startIndex, targetColumn.columnId]);

	return <DropdownItem onClick={onClick}>{targetColumn.title}</DropdownItem>;
}

function LazyDropdownItems({ item }: { item: CardData }) {
	const { getColumns, reorderCard } = useBoardContext();
	const { columnId, getCardIndex, getNumCards } = useColumnContext();

	const numCards = getNumCards();
	const startIndex = getCardIndex(item.key);

	const moveUp = useCallback(() => {
		reorderCard({ columnId, startIndex, finishIndex: startIndex - 1 });
	}, [columnId, reorderCard, startIndex]);

	const moveDown = useCallback(() => {
		reorderCard({ columnId, startIndex, finishIndex: startIndex + 1 });
	}, [columnId, reorderCard, startIndex]);

	const isMoveUpDisabled = startIndex === 0;
	const isMoveDownDisabled = startIndex === numCards - 1;

	const moveColumnOptions = getColumns().filter((column) => column.columnId !== columnId);

	return (
		<Fragment>
			<DropdownItemGroup title="Reorder">
				<DropdownItem onClick={moveUp} isDisabled={isMoveUpDisabled}>
					Increase rank
				</DropdownItem>
				<DropdownItem onClick={moveDown} isDisabled={isMoveDownDisabled}>
					Decrease rank
				</DropdownItem>
			</DropdownItemGroup>
			<DropdownItemGroup title="Move to">
				{moveColumnOptions.map((column) => (
					<MoveToOtherColumnItem
						key={column.columnId}
						targetColumn={column}
						startIndex={startIndex}
					/>
				))}
			</DropdownItemGroup>
		</Fragment>
	);
}

const CardPrimitive = forwardRef<HTMLDivElement, CardPrimitiveProps>(function CardPrimitive(
	{ closestEdge, item, state, actionMenuTriggerRef, isSelected = false, onClick },
	ref,
) {
	const { summary, epic, key } = item;

	return (
		<div onClick={onClick}>
			<Stack
				ref={ref}
				testId={`item-${key}`}
				xcss={[
					containerStyles,
					state === draggingState && draggingStyles,
					isSelected && selectedStyles,
				]}
				space="space.200"
			>
				<Inline spread="space-between" space="space.200">
					<Stack space="space.150" alignInline="start">
						<Box>{summary}</Box>
						<EpicLozenge epic={epic} />
					</Stack>
					<Box xcss={actionStyles} style={{ marginInline: -8, marginBlock: -4 }}>
						<DropdownMenu
							trigger={({ triggerRef, ...triggerProps }) => (
								<Button
									ref={
										actionMenuTriggerRef
											? mergeRefs([triggerRef, actionMenuTriggerRef])
											: triggerRef
									}
									iconBefore={
										<MoreIcon spacing="spacious" color="currentColor" label={`Move ${name}`} />
									}
									appearance="subtle"
									{...triggerProps}
								/>
							)}
						>
							<LazyDropdownItems item={item} />
						</DropdownMenu>
					</Box>
				</Inline>
				<Inline spread="space-between" alignBlock="center">
					<Inline space="space.050" alignBlock="center">
						<IconTile
							appearance="greenBold"
							size="16"
							label=""
							icon={StoryIcon}
							// eslint-disable-next-line @atlaskit/design-system/no-legacy-icons
							LEGACY_fallbackComponent={<StoryIcon16 label="story" />}
						/>
						<Box>{key}</Box>
					</Inline>
					<Inline space="space.050" alignBlock="center">
						<Badge>{1}</Badge>
						<PullRequestIcon color="currentColor" label="" LEGACY_size="small" />
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M12.017 11.1819L5.56302 15.0469C5.45029 15.1163 5.32491 15.1626 5.19415 15.1832C5.06339 15.2037 4.92985 15.1981 4.80128 15.1667C4.67271 15.1352 4.55165 15.0786 4.44514 15C4.33864 14.9214 4.24879 14.8224 4.18081 14.7088C4.11284 14.5953 4.06809 14.4693 4.04916 14.3383C4.03023 14.2073 4.0375 14.0739 4.07054 13.9457C4.10358 13.8175 4.16174 13.6972 4.24164 13.5916C4.32155 13.4861 4.42161 13.3975 4.53602 13.3309L11.506 9.15694C11.6618 9.06395 11.84 9.0151 12.0214 9.01563C12.2029 9.01616 12.3808 9.06604 12.536 9.15994L19.442 13.3329C19.669 13.4702 19.8322 13.692 19.8957 13.9496C19.9592 14.2072 19.9178 14.4794 19.7805 14.7064C19.6433 14.9335 19.4215 15.0967 19.1639 15.1602C18.9063 15.2236 18.634 15.1822 18.407 15.0449L12.017 11.1819Z"
								fill="#EF5C48"
							/>
						</svg>

						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<rect x="0.5" y="9.5" width="5" height="5" rx="2.5" fill="#CA3521" />
							<rect x="6.5" y="9.5" width="5" height="5" rx="2.5" fill="#CA3521" />
							<rect x="12.5" y="9.5" width="5" height="5" rx="2.5" fill="#CA3521" />
							<rect x="18.5" y="9.5" width="5" height="5" rx="2.5" fill="#DCDFE4" />
						</svg>

						<Avatar size="small">
							{(props) => (
								<div
									{...props}
									ref={props.ref as React.Ref<HTMLDivElement>}
									css={noPointerEventsStyles}
								/>
							)}
						</Avatar>
					</Inline>
				</Inline>

				{closestEdge && <DropIndicator edge={closestEdge} gap={`10px`} />}
			</Stack>
		</div>
	);
});

export const Card = memo(function Card({ item }: { item: CardData }) {
	const ref = useRef<HTMLDivElement | null>(null);
	const { key } = item;
	const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
	const [state, setState] = useState<DraggableState>(idleState);
	const [isSelected, setIsSelected] = useState(false);

	const { registerCard, getSelectedCards } = useBoardContext();

	const onClick = useCallback(() => {
		setIsSelected((isSelected) => !isSelected);
	}, []);

	const actionMenuTriggerRef = useRef<HTMLButtonElement>(null);
	useEffect(() => {
		if (!actionMenuTriggerRef.current) {
			return;
		}
		return registerCard({
			cardId: key,
			actionMenuTrigger: actionMenuTriggerRef.current,
			isSelected,
		});
	}, [registerCard, key, isSelected]);

	useEffect(() => {
		invariant(ref.current);
		console.log('recreating draggable');
		return combine(
			draggable({
				element: ref.current,
				getInitialData: () => ({ type: 'card', itemId: key }),
				onGenerateDragPreview: ({ location, source, nativeSetDragImage }) => {
					const rect = source.element.getBoundingClientRect();

					setCustomNativeDragPreview({
						nativeSetDragImage,
						getOffset() {
							/**
							 * This offset ensures that the preview is positioned relative to
							 * the cursor based on where you drag from.
							 *
							 * This creates the effect of it being picked up.
							 */
							return {
								x: location.current.input.clientX - rect.x,
								y: location.current.input.clientY - rect.y,
							};
						},
						render({ container }) {
							setState({
								type: 'preview',
								container,
								rect,
								numSelected: getSelectedCards().length,
							});
							return () => setState(draggingState);
						},
					});
				},

				onDragStart: () => setState(draggingState),
				onDrop: () => setState(idleState),
			}),
			dropTargetForExternal({
				element: ref.current,
			}),
			dropTargetForElements({
				element: ref.current,
				canDrop: (args) => args.source.data.type === 'card',
				getIsSticky: () => true,
				getData: ({ input, element }) => {
					const data = { type: 'card', itemId: key };

					return attachClosestEdge(data, {
						input,
						element,
						allowedEdges: ['top', 'bottom'],
					});
				},
				onDragEnter: (args) => {
					if (args.source.data.itemId !== key) {
						setClosestEdge(extractClosestEdge(args.self.data));
					}
				},
				onDrag: (args) => {
					if (args.source.data.itemId !== key) {
						setClosestEdge(extractClosestEdge(args.self.data));
					}
				},
				onDragLeave: () => {
					setClosestEdge(null);
				},
				onDrop: () => {
					setClosestEdge(null);
				},
			}),
		);
	}, [getSelectedCards, item, key]);

	return (
		<Fragment>
			<CardPrimitive
				ref={ref}
				item={item}
				state={state}
				closestEdge={closestEdge}
				actionMenuTriggerRef={actionMenuTriggerRef}
				isSelected={isSelected}
				onClick={onClick}
			/>
			{state.type === 'preview' &&
				ReactDOM.createPortal(
					<CardStack numCards={state.numSelected}>
						<div
							style={{
								/**
								 * Ensuring the preview has the same dimensions as the original.
								 *
								 * Using `border-box` sizing here is not necessary in this
								 * specific example, but it is safer to include generally.
								 */
								// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766
								boxSizing: 'border-box',
								width: state.rect.width,
								height: state.rect.height,
							}}
						>
							<CardPrimitive item={item} state={state} closestEdge={null} />
						</div>
					</CardStack>,
					state.container,
				)}
		</Fragment>
	);
});
