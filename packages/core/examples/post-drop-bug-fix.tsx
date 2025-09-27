/**
 * @jsxRuntime classic
 * @jsx jsx
 */
import { createContext, Fragment, useContext, useEffect, useRef, useState } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';
import invariant from 'tiny-invariant';

import { Stack } from '@atlaskit/primitives/compiled';
import { token } from '@atlaskit/tokens';

import {
	draggable,
	dropTargetForElements,
	monitorForElements,
} from '../src/entry-point/element/adapter';
import { dropTargetForExternal } from '../src/entry-point/external/adapter';
import { dropTargetForTextSelection } from '../src/entry-point/text-selection/adapter';
import { combine } from '../src/public-utils/combine';
import { reorder } from '../src/public-utils/reorder';

import { fallbackColor } from './_util/fallback';
import { GlobalStyles } from './_util/global-styles';

// I was hoping to use this example for browser testing,
// but puppeteer does not replicate the browser bug.
// I think it best to keep this example around as it makes it
// easy to debug the browser bug and the fix

const interactiveStyles = css({
	position: 'relative',
	'&::before': {
		content: '""',
		position: 'absolute',
		pointerEvents: 'none',
		// zIndex: ,
		top: 0,
		left: 0,
		padding: 'var(--grid)',
	},
	'&:hover::before': {
		content: '":hover"',
		background: token('color.background.accent.green.subtler', 'transparent'),
	},
	'&:active::before': {
		content: '":active"',
		background: token('color.background.accent.blue.subtler', 'transparent'),
	},
});

const cardStyles = css({
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values -- Ignored via go/DSP-18766
	boxShadow: token('elevation.shadow.raised', fallbackColor),
	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-imported-style-values -- Ignored via go/DSP-18766
	background: token('elevation.surface.raised', fallbackColor),
	justifyContent: 'center',
	borderRadius: 'var(--border-radius)',
	padding: 'var(--grid)',
	textAlign: 'center',

	position: 'relative',
	// userSelect: 'none',
	flexShrink: 0,
});

const listStyles = css({
	display: 'flex',
	alignItems: 'stretch',
	flexDirection: 'column',
	// gap: 'calc(var(--grid)* 2)',
	width: 240,
	margin: '0 auto',
	padding: 'calc(var(--grid) * 6)',
	background: token('elevation.surface.sunken', '#F7F8F9'),

	height: '500px',
	overflow: 'scroll',

	position: 'relative',
});

// const stackStyles = css({
// 	display: 'flex',
// 	flexDirection: 'column',
// 	gap: 'var(--grid)',

// 	// eslint-disable-next-line @atlaskit/ui-styling-standard/no-nested-selectors -- Ignored via go/DSP-18766
// 	'> *': {
// 		margin: 0,
// 	},
// });

const TypeContext = createContext<string>('unknown');

const isOverCardStyles = css({
	background: token('color.interaction.hovered', 'transparent'),
});

function Card({
	cardId,
	isSticky,
	isDraggable,
}: {
	cardId: string;
	isSticky: boolean;
	isDraggable: boolean;
}) {
	const [counts, setCounts] = useState<{
		click: number;
		enter: number;
		leave: number;
	}>({
		click: 0,
		enter: 0,
		leave: 0,
	});
	const [state, setState] = useState<'idle' | 'is-over'>('idle');
	const ref = useRef<HTMLDivElement | null>(null);
	const typeContext = useContext(TypeContext);

	useEffect(() => {
		const element = ref.current;
		invariant(element);

		return combine(
			draggable({
				element,
				getInitialData: () => ({ cardId, typeContext }),
				onGenerateDragPreview(args) {
					// console.warn('onGenerateDragPreview');
				},
				onDragStart(args) {
					// console.warn('onDragStart');
				},
				onDrop(args) {
					// console.warn('onDrop');
				},
				onDropTargetChange({ location }) {
					// console.warn('onDropTargetChange', location);
				},
			}),
			dropTargetForElements({
				element,
				getData: () => ({ cardId }),
				canDrop: (args) => args.source.data.typeContext === typeContext,
				getIsSticky: () => isSticky,
				onDragStart: () => setState('is-over'),
				onDragEnter: () => setState('is-over'),
				onDragLeave: () => setState('idle'),
				onDrop: () => setState('idle'),
			}),
			dropTargetForTextSelection({
				element,
				getData: () => ({ cardId }),
				getIsSticky: () => isSticky,
				onDragStart: () => setState('is-over'),
				onDragEnter: () => setState('is-over'),
				onDragLeave: () => setState('idle'),
				onDrop: () => setState('idle'),
			}),
			dropTargetForExternal({
				element,
				getData: () => ({ cardId }),
				getIsSticky: () => isSticky,
				onDragEnter: () => setState('is-over'),
				onDragLeave: () => setState('idle'),
				onDrop: () => setState('idle'),
			}),
		);
	}, [cardId, typeContext, isSticky, isDraggable]);

	return (
		// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, @atlassian/a11y/interactive-element-not-keyboard-focusable
		<div
			ref={ref}
			css={[cardStyles, interactiveStyles, state === 'is-over' ? isOverCardStyles : undefined]}
			data-testid={`${typeContext}-${cardId}`}
			// eslint-disable-next-line @atlassian/a11y/mouse-events-have-key-events
			onMouseEnter={(event) => {
				console.log('onMouseEnter', cardId, { clientX: event.clientX, clientY: event.clientY });
				setCounts((current) => ({ ...current, enter: current.enter + 1 }));
				// }
			}}
			// eslint-disable-next-line @atlassian/a11y/mouse-events-have-key-events
			onMouseLeave={() => {
				setCounts((current) => ({ ...current, leave: current.leave + 1 }));
			}}
			onClick={() => setCounts((current) => ({ ...current, click: current.click + 1 }))}
		>
			{cardId}{' '}
			<small>
				click {counts.click} enter {counts.enter} leave {counts.leave}
			</small>
		</div>
	);
}

type Card = {
	id: string;
};
function getCards() {
	return Array.from({ length: 30 }, (_, index) => ({
		id: `card-${index}`,
	}));
}

const rowStyles = css({
	flexDirection: 'row',
	height: 'auto',
	width: '70vw',
});

function DropTest({ layout }: { layout: 'vertical' | 'horizontal' }) {
	const [cards, setCards] = useState<Card[]>(() => getCards());
	const [typeContext] = useState<string>('drop');
	useEffect(() => {
		return monitorForElements({
			canMonitor: ({ source }) => source.data.typeContext === typeContext,
			onDrop(args) {
				const destination = args.location.current.dropTargets[0];
				if (!destination) {
					return;
				}
				const startIndex = cards.findIndex((card) => card.id === args.source.data.cardId);
				const finishIndex = cards.findIndex((card) => card.id === destination.data.cardId);

				// swapping
				const newList = [...cards];
				newList[startIndex] = cards[finishIndex];
				newList[finishIndex] = cards[startIndex];

				setCards(newList);
			},
		});
	}, [typeContext, cards]);

	return (
		<TypeContext.Provider value={typeContext}>
			<Stack space="space.100">
				<h3>Drop test</h3>
				<strong>Swap items on drop</strong>
				<div css={[listStyles, interactiveStyles, layout === 'horizontal' ? rowStyles : undefined]}>
					{cards.map((card, index) => {
						return (
							<Card key={card.id} cardId={card.id} isSticky={false} isDraggable={index % 2 === 0} />
						);
					})}
				</div>
			</Stack>
		</TypeContext.Provider>
	);
}

function DragEndTest() {
	const [cards, setCards] = useState<Card[]>(() => getCards());
	const [typeContext] = useState<string>('dragend');

	useEffect(() => {
		return monitorForElements({
			canMonitor: ({ source }) => source.data.typeContext === typeContext,
			onDrop(args) {
				if (!args.location.current.dropTargets.length) {
					setCards(reorder({ list: cards, startIndex: 0, finishIndex: 1 }));
				}
			},
		});
	}, [typeContext, cards]);

	return (
		<TypeContext.Provider value={typeContext}>
			<Stack space="space.100">
				<h3>Dragend test</h3>
				<strong>Swap first two cards on unsuccessful drag</strong>
				{/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
				<div
					css={[listStyles, interactiveStyles]}
					// eslint-disable-next-line jsx-a11y/mouse-events-have-key-events, @atlassian/a11y/mouse-events-have-key-events
					onMouseOver={(event) => console.error(event.type, event.target)}
					onMouseEnter={(event) => console.error(event.type, event.target)}
					// eslint-disable-next-line @atlassian/a11y/mouse-events-have-key-events
					onMouseLeave={(event) => console.error(event.type, event.target)}
				>
					{cards.map((card) => {
						return <Card key={card.id} cardId={card.id} isSticky={false} isDraggable={true} />;
					})}
				</div>
			</Stack>
		</TypeContext.Provider>
	);
}

const exampleStyles = css({
	display: 'flex',
	flexWrap: 'wrap',
	flexDirection: 'row',
	textAlign: 'center',
	justifyContent: 'center',
	gap: 'calc(var(--grid) * 2)',
});

export default function Example() {
	// useTest();
	// useKillCPU();
	// useDebug();
	// usePrintAllEvents();
	// usePrintSomeEvents();

	return (
		<Fragment>
			<GlobalStyles />
			<div css={[exampleStyles, interactiveStyles]}>
				<DropTest layout="vertical" />
			</div>
			<div css={[exampleStyles, interactiveStyles]}>
				<DropTest layout="horizontal" />
			</div>
			<div css={[exampleStyles, interactiveStyles]}>
				<DragEndTest />
			</div>
		</Fragment>
	);
}

// function usePrintSomeEvents() {
// 	useEffect(() => {
// 		let pointerDown: { x: number; y: number } | null = null;
// 		return bindAll(window, [
// 			{
// 				type: 'pointerdown',
// 				listener(event) {
// 					pointerDown = { x: event.clientX, y: event.clientY };
// 					console.warn(event.type, pointerDown);

// 					function cleanup() {
// 						unbindPointerMove();
// 					}

// 					const unbindPointerMove = bindAll(window, [
// 						{
// 							type: 'pointermove',
// 							listener(event) {
// 								console.log('useDebug()', event.type, { x: event.clientX, y: event.clientY });
// 							},
// 						},
// 						{
// 							type: 'pointerup',
// 							listener: cleanup,
// 						},
// 						// {
// 						// 	type: 'dragstart',
// 						// 	listener: cleanup,
// 						// },
// 					]);
// 				},
// 			},

// 			{
// 				type: 'dragstart',
// 				listener(event) {
// 					const dragStart = { x: event.clientX, y: event.clientY };
// 					const isEqual = Boolean(
// 						pointerDown &&
// 							Math.floor(pointerDown.x) === dragStart.x &&
// 							Math.floor(pointerDown.y) === dragStart.y,
// 					);
// 					console.group('DRAGSTART');
// 					console.log(event.type, dragStart, 'is equal to pointer down?', isEqual);

// 					bindAll(window, [
// 						{
// 							type: 'drag',
// 							listener(event) {
// 								console.log('first', event.type, { x: event.clientX, y: event.clientY });
// 							},
// 							options: { once: true },
// 						},
// 						{
// 							type: 'dragover',
// 							listener(event) {
// 								console.log('first', event.type, { x: event.clientX, y: event.clientY });
// 							},
// 							options: { once: true },
// 						},
// 					]);
// 				},
// 			},

// 			{
// 				type: 'dragend',
// 				listener() {
// 					console.groupEnd();
// 				},
// 			},
// 		]);
// 	}, []);
// }

// function usePrintAllEvents() {
// 	useEffect(() => {
// 		const keys = Object.keys(window)
// 			.filter((key) => key.startsWith('on'))
// 			.map((key) => key.split('on')[1]);

// 		console.log('keys', keys);

// 		return bindAll(
// 			window,
// 			keys.map((key): Binding<Window, any> => {
// 				return {
// 					type: key as any,
// 					listener(event) {
// 						console.log(event.type, event.target, {
// 							clientX: event.clientX ?? 0,
// 							clientY: event.clientY ?? 0,
// 						});
// 					},
// 					options: { capture: true },
// 				};
// 			}),
// 		);
// 	}, []);
// }

// function useDebug() {
// 	useEffect(() => {
// 		const events = [
// 			// 'mousemove',
// 			// 'mouseup',
// 			// 'mousedown',
// 			// 'mouseover',
// 			// 'mouseout',
// 			// 'mouseleave',
// 			// 'mouseenter',
// 			// 'click',
// 			// 'focusin',
// 			// 'focusout',
// 			'pointermove',
// 			'pointercancel',
// 			'drop',
// 			'dragend',
// 			// 'drag',
// 			'dragstart',
// 			'dragleave',
// 		] as const;

// 		return bindAll(
// 			window,
// 			events.map((v) => ({
// 				type: v,
// 				listener: (event: Event) => {
// 					console.log('event:', event.type, {
// 						target: event.target,
// 						relatedTarget: (event as MouseEvent).relatedTarget,
// 						clientX: (event as MouseEvent).clientX,
// 						clientY: (event as MouseEvent).clientY,
// 					});
// 				},
// 				options: { capture: true },
// 			})),
// 		);
// 	}, []);
// }

// function useTest() {
// 	useEffect(() => {
// 		let lastDragOver: Position = { x: 0, y: 0 };

// 		function isEqual(a: Position, b: Position): boolean {
// 			return a.x === b.x && a.y === b.y;
// 		}

// 		function check(event: DragEvent) {
// 			const current = {
// 				x: event.clientX,
// 				y: event.clientY,
// 			};
// 			console.log(event.type, current, {
// 				current: document.elementFromPoint(current.x, current.y),
// 				lastDragOver: document.elementFromPoint(lastDragOver.x, lastDragOver.y),
// 			});
// 			if (!isEqual(lastDragOver, current)) {
// 				const message = `"${event.type}" does not match`;
// 				console.error(message, { lastDragOver, current });
// 				alert(message);
// 			}
// 		}

// 		return bindAll(window, [
// 			{
// 				type: 'dragover',
// 				listener(event) {
// 					const current = {
// 						x: event.clientX,
// 						y: event.clientY,
// 					};
// 					lastDragOver = current;
// 				},
// 			},
// 			{
// 				type: 'drop',
// 				listener: check,
// 			},
// 			{
// 				type: 'dragend',
// 				listener: check,
// 			},
// 		]);
// 	}, []);
// }

// function useKillCPU() {
// 	useEffect(() => {
// 		// let timeSinceLastFrame = performance.now();
// 		let frameId = requestAnimationFrame(loop);
// 		function loop() {
// 			// timeSinceLastFrame = performance.now() - timeSinceLastFrame;
// 			// console.log({ framesPerSecond = timeSinceLastFrame / 60 });

// 			const start = Date.now();
// 			while (Date.now() - start < 100) {
// 				// burn
// 			}
// 			// console.log('done');
// 			frameId = requestAnimationFrame(loop);
// 		}

// 		return () => cancelAnimationFrame(frameId);
// 	}, []);
// }
