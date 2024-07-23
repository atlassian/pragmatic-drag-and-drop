/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import { type CSSProperties, Fragment, memo, useEffect, useRef, useState } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';
import invariant from 'tiny-invariant';

import { ButtonItem, MenuGroup, Section } from '@atlaskit/menu';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { disableNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/disable-native-drag-preview';
import { preventUnhandled } from '@atlaskit/pragmatic-drag-and-drop/prevent-unhandled';
import type { DragLocationHistory } from '@atlaskit/pragmatic-drag-and-drop/types';
import { token } from '@atlaskit/tokens';

import battery from './icons/battery.png';
import cloud from './icons/cloud.png';
import drill from './icons/drill.png';
import koala from './icons/koala.png';
import ui from './icons/ui.png';
import wallet from './icons/wallet.png';
import yeti from './icons/yeti.png';
import { GlobalStyles } from './util/global-styles';

// The list example we have here was lifted from
// packages/design-system/menu/examples/menu.tsx
const iconStyles = css({
	height: 'calc(var(--grid) * 3)',
	width: 'calc(var(--grid) * 3)',
	borderRadius: 'var(--border-width)',
});
function Icon({ src, alt }: { src: string; alt: string }) {
	return <img alt={alt} src={src} css={iconStyles} />;
}
const Menu = memo(function Menu() {
	return (
		<MenuGroup>
			<Section title="Starred">
				<ButtonItem
					iconBefore={<Icon src={yeti} alt={'Yeti'} />}
					description="Next-gen software project"
				>
					Navigation System
				</ButtonItem>
				<ButtonItem
					iconBefore={<Icon src={drill} alt={'Drill'} />}
					description="Next-gen service desk"
				>
					Analytics Platform
				</ButtonItem>
			</Section>
			<Section title="Recent">
				<ButtonItem
					iconBefore={<Icon src={battery} alt={'Battery'} />}
					description="Next-gen software project"
				>
					Fabric Editor
				</ButtonItem>
				<ButtonItem
					iconBefore={<Icon src={cloud} alt={'Cloud'} />}
					description="Classic business project"
				>
					Content Services
				</ButtonItem>
				<ButtonItem
					iconBefore={<Icon src={wallet} alt={'Wallet'} />}
					description="Next-gen software project"
				>
					Trinity Mobile
				</ButtonItem>
				<ButtonItem
					iconBefore={<Icon src={koala} alt={'Koala'} />}
					description="Classic service desk"
				>
					Customer Feedback
				</ButtonItem>
				<ButtonItem
					iconBefore={<Icon src={ui} alt={'UI icon'} />}
					description="Classic software project"
				>
					Design System
				</ButtonItem>
			</Section>
			<Section hasSeparator>
				<ButtonItem>View all projects</ButtonItem>
				<ButtonItem>Create project</ButtonItem>
			</Section>
		</MenuGroup>
	);
});

const sidebarStyles = css({
	width: 'var(--local-width)',
	flexShrink: '0',
	flexGrow: '0',
	boxSizing: 'border-box',
	display: 'flex',
	flexDirection: 'row',
});

const sidebarContentStyles = css({
	flexGrow: '1',
	flexShrink: '1',
	width: 'var(--local-resizing-width, var(--local-initial-width))',
});

// Quite a large draggable area,
// but the line itself is fairly small
const sidebarDividerStyles = css({
	width: 'calc(var(--grid) * 4)',
	cursor: 'ew-resize',
	flexGrow: '0',
	flexShrink: '0',
	position: 'relative',
	background: 'transparent',
	'&::before': {
		background: token('color.border.brand', '#0C66E4'),
		content: '""',
		position: 'absolute',
		top: 0,
		bottom: 0,
		width: 'var(--border-width)',
	},
});

// Preventing items getting :hover effects during a drag
const noPointerEventsStyles = css({
	pointerEvents: 'none',
});

type State =
	| {
			type: 'idle';
	  }
	| {
			type: 'dragging';
	  };

const widths = {
	start: 260,
	min: 150,
	max: 450,
};

function getProposedWidth({
	initialWidth,
	location,
}: {
	initialWidth: number;
	location: DragLocationHistory;
}): number {
	const diffX = location.current.input.clientX - location.initial.input.clientX;
	const proposedWidth = initialWidth + diffX;

	// ensure we don't go below the min or above the max allowed widths
	return Math.min(Math.max(widths.min, proposedWidth), widths.max);
}

function Sidebar() {
	// note: initial width could be a prop, just using local state for this example
	const [initialWidth, setInitialWidth] = useState(widths.start);
	const dividerRef = useRef<HTMLDivElement | null>(null);
	const [state, setState] = useState<State>({
		type: 'idle',
	});
	const contentRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const divider = dividerRef.current;
		invariant(divider);

		return draggable({
			element: divider,
			onGenerateDragPreview: ({ nativeSetDragImage }) => {
				// we will be moving the line to indicate a drag
				// we can disable the native drag preview
				disableNativeDragPreview({ nativeSetDragImage });
				// we don't want any native drop animation for when the user
				// does not drop on a drop target. we want the drag to finish immediately
				preventUnhandled.start();
			},
			onDragStart() {
				setState({ type: 'dragging' });
			},
			onDrag({ location }) {
				contentRef.current?.style.setProperty(
					'--local-resizing-width',
					`${getProposedWidth({ initialWidth, location })}px`,
				);
			},
			onDrop({ location }) {
				preventUnhandled.stop();
				setState({ type: 'idle' });

				setInitialWidth(getProposedWidth({ initialWidth, location }));
				contentRef.current?.style.removeProperty('--local-resizing-width');
			},
		});
	}, [initialWidth]);

	return (
		<div css={sidebarStyles}>
			<div
				ref={contentRef}
				css={[sidebarContentStyles, state.type === 'dragging' ? noPointerEventsStyles : undefined]}
				// eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop, @atlaskit/ui-styling-standard/no-imported-style-values -- Ignored via go/DSP-18766
				style={{ '--local-initial-width': `${initialWidth}px` } as CSSProperties}
			>
				<Menu />
			</div>
			<div
				css={[
					sidebarDividerStyles,
					// Disabling the cursor on the sidebar line while dragging
					// Otherwise the cursor can flash between resizing and the default cursor repeatedly
					state.type === 'dragging' ? noPointerEventsStyles : undefined,
				]}
				ref={dividerRef}
			></div>
		</div>
	);
}

const itemStyles = css({
	width: '40px',
	height: '40px',
	border: `1px solid ${token('color.border')}`,
	borderRadius: 'var(--border-radius)',
	'&:hover': {
		background: token('color.background.accent.green.subtle'),
	},
	'&:active': {
		background: token('color.background.accent.blue.subtle'),
	},
});

function Item({ itemId }: { itemId: string }) {
	return <div css={itemStyles} />;
}

const gridStyles = css({
	display: 'flex',
	flexWrap: 'wrap',
	gap: 'var(--grid)',
});

const stackStyles = css({
	display: 'flex',
	flexDirection: 'column',
	gap: 'calc(var(--grid) * 2)',
	padding: 'calc(var(--grid) * 2) 0',
});

function Content() {
	const [itemIds] = useState(() => Array.from({ length: 40 }, (_, index) => `item: ${index}`));

	return (
		<div css={stackStyles}>
			{/* <h2>Code review</h2> */}
			<div css={gridStyles}>
				{itemIds.map((itemId) => (
					<Item itemId={itemId} key={itemId} />
				))}
			</div>
		</div>
	);
}

const containerStyles = css({
	display: 'flex',
	flexDirection: 'row',
	overflow: 'hidden',
	width: '100%',
	border: `var(--border-width) solid ${token('color.border', '#091E4224')}`,
	borderRadius: 'var(--border-radius)',
	background: token('elevation.surface', '#FFF'),
});

export default function Container() {
	return (
		<Fragment>
			<GlobalStyles />
			<div css={containerStyles}>
				<Sidebar />
				<Content />
			</div>
		</Fragment>
	);
}
