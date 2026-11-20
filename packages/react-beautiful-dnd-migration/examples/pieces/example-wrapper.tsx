/**
 * @jsxRuntime classic
 * @jsx jsx
 */

import {
	type ComponentType,
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useState,
} from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';
import * as rbd from 'react-beautiful-dnd';
import type { DragDropContextProps, DraggableProps, DroppableProps } from 'react-beautiful-dnd';

import { DragDropContext as MigrationDragDropContextBase } from '@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration/drag-drop-context';
import { Draggable as MigrationDraggable } from '@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration/draggable';
import { Droppable as MigrationDroppable } from '@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration/droppable';
import type { Colors } from '@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration/types';
import RadioGroup from '@atlaskit/radio/radio-group';
import type { OptionsPropType } from '@atlaskit/radio/types';

import { GlobalStyles } from './global-styles';

type SwitcherProps = {
	children: ReactNode;
	colors?: Colors;
};

const ExampleContext = createContext<{ library: Library; colors: Colors }>({
	library: 'migration',
	colors: 'standard',
});

type Library = 'migration' | 'rbd';

const options: OptionsPropType = [
	{ name: 'library', value: 'migration', label: 'Migration layer' },
	{ name: 'library', value: 'rbd', label: 'react-beautiful-dnd' },
];

const wrapperStyles = css({
	display: 'flex',
	gap: 'calc(3 * var(--grid))',
});

export function ExampleWrapper({
	children,
	colors = 'standard',
}: SwitcherProps): React.JSX.Element {
	const [library, setLibrary] = useState<Library>('migration');

	const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setLibrary(event.target.value as Library);
	}, []);

	return (
		<ExampleContext.Provider value={{ library, colors }}>
			<GlobalStyles />
			<div css={wrapperStyles}>
				<div>
					<RadioGroup options={options} value={library} onChange={onChange} />
				</div>
				<div>{children}</div>
			</div>
		</ExampleContext.Provider>
	);
}

type Components = {
	DragDropContext: ComponentType<DragDropContextProps>;
	Draggable: ComponentType<DraggableProps>;
	Droppable: ComponentType<DroppableProps>;
};

function MigrationDragDropContext(props: DragDropContextProps): React.JSX.Element {
	const colors = useExampleColors();
	return <MigrationDragDropContextBase {...props} colors={colors} />;
}

const componentMap: Record<Library, Components> = {
	migration: {
		DragDropContext: MigrationDragDropContext,
		Draggable: MigrationDraggable,
		Droppable: MigrationDroppable,
	},
	rbd,
};

export function useDependency(): Components {
	const { library } = useContext(ExampleContext);

	return componentMap[library];
}

export function useExampleColors(): Colors {
	return useContext(ExampleContext).colors;
}
