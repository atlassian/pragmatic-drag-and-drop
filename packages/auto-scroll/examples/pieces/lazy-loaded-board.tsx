import React, { useEffect, useRef, useState } from 'react';

import { bind } from 'bind-event-listener';
import invariant from 'tiny-invariant';

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
// eslint-disable-next-line @atlaskit/design-system/no-emotion-primitives -- to be migrated to @atlaskit/primitives/compiled – go/akcss
import { Box, Flex, Inline, Stack, xcss } from '@atlaskit/primitives';

import { Card } from './card';

type TItem = { id: string };
type TColumn = {
	id: string;
	items: TItem[];
};

const columnStyles = xcss({
	overflowY: 'auto',
	height: '300px',
	width: '140px',
	backgroundColor: 'elevation.surface',
	borderColor: 'color.border.accent.purple',
	borderRadius: 'radius.small',
	borderWidth: 'border.width',
	borderStyle: 'solid',
	flexShrink: 0,
});

function Column({ column }: { column: TColumn }) {
	const ref = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const element = ref.current;
		invariant(element);

		let operation = new AbortController();

		return monitorForElements({
			onDragStart: async () => {
				operation = new AbortController();

				const { autoScrollForElements, autoScrollWindowForElements } =
					// eslint-disable-next-line import/dynamic-import-chunkname
					await import('../../src/entry-point/element');

				console.log('scroller loaded');
				if (operation.signal.aborted) {
					return;
				}
				const cleanup = combine(
					autoScrollForElements({
						element,
					}),
					autoScrollWindowForElements(),
				);

				bind(operation.signal, {
					type: 'abort',
					listener: cleanup,
					options: { once: true },
				});
			},
			onDrop() {
				operation.abort();
			},
		});
	}, []);

	return (
		<Box ref={ref} xcss={columnStyles} padding="space.100" testId={column.id}>
			<Stack space="space.100">
				{column.items.map((item) => (
					<Card key={item.id} item={item} />
				))}
			</Stack>
		</Box>
	);
}

const boardStyles = xcss({
	overflowX: 'auto',
	borderWidth: 'border.width',
	borderColor: 'color.border.accent.purple',
	borderStyle: 'solid',
	borderRadius: 'radius.small',
	padding: 'space.200',
	backgroundColor: 'elevation.surface.sunken',
});

type LoadingState = 'pending' | 'loading' | 'loaded';

const loadingStyles: { [Key in LoadingState]: ReturnType<typeof xcss> } = {
	pending: xcss({
		color: 'color.text.warning',
	}),
	loading: xcss({
		color: 'color.text.discovery',
	}),
	loaded: xcss({
		color: 'color.text.success',
	}),
};

function getColumns({ count }: { count: number }): TColumn[] {
	return Array.from({ length: count }, (_, columnIndex) => {
		const columnId = `column-${columnIndex}`;
		const items = Array.from({ length: 50 }, (_, itemIndex) => {
			return {
				id: `${columnId}::item-${itemIndex}`,
			};
		});
		return { id: columnId, items };
	});
}

const columnContainerStyles = xcss({
	width: 'min-content', // so we can have padding around the board
});

export function Board(): React.JSX.Element {
	const ref = useRef<HTMLDivElement | null>(null);
	const [columns] = useState<TColumn[]>(() => getColumns({ count: 8 }));
	const [state, setState] = useState<LoadingState>('pending');

	useEffect(() => {
		const element = ref.current;
		invariant(element);
		let operation: AbortController | null = null;

		return combine(
			monitorForElements({
				onDragStart: async () => {
					operation = new AbortController();
					setState((current) => {
						if (current === 'pending') {
							return 'loading';
						}
						return current;
					});

					// Note: for example simplicity we are not handling errors
					const { autoScrollForElements, autoScrollWindowForElements } =
						// eslint-disable-next-line import/dynamic-import-chunkname
						await import('../../src/entry-point/element');

					if (operation.signal.aborted) {
						return;
					}

					setState((current) => {
						if (current === 'loading') {
							return 'loaded';
						}
						return current;
					});

					const cleanup = combine(
						autoScrollForElements({
							element,
						}),
						autoScrollWindowForElements(),
					);

					bind(operation.signal, {
						type: 'abort',
						listener: cleanup,
						options: { once: true },
					});
				},
				onDrop() {
					operation?.abort();
				},
			}),
		);
	}, []);

	return (
		<Stack space="space.100">
			<Box xcss={boardStyles} ref={ref}>
				<Flex gap="space.200" xcss={columnContainerStyles}>
					{columns.map((column) => (
						<Column key={column.id} column={column} />
					))}
				</Flex>
			</Box>
			<Inline space="space.050">
				<Box>Auto scrolling:</Box>
				<Box xcss={loadingStyles[state]}>
					{/* eslint-disable-next-line @atlaskit/design-system/no-html-code */}
					<code>{state}</code>
				</Box>
			</Inline>
		</Stack>
	);
}
