/** @jsx jsx */

import {
  ComponentType,
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';

import { css, jsx } from '@emotion/react';
import * as rbd from 'react-beautiful-dnd';
import type {
  DragDropContextProps,
  DraggableProps,
  DroppableProps,
} from 'react-beautiful-dnd';

import { RadioGroup } from '@atlaskit/radio';
import type { OptionsPropType } from '@atlaskit/radio/types';

import * as migration from '../../src';

import { GlobalStyles } from './global-styles';

type SwitcherProps = {
  children: ReactNode;
};

const DependencyContext = createContext<Library>('migration');

type Library = 'migration' | 'rbd';

const options: OptionsPropType = [
  { name: 'library', value: 'migration', label: 'Migration layer' },
  { name: 'library', value: 'rbd', label: 'react-beautiful-dnd' },
];

const wrapperStyles = css({
  display: 'flex',
  gap: 'calc(3 * var(--grid))',
});

export function ExampleWrapper({ children }: SwitcherProps) {
  const [library, setLibrary] = useState<Library>('migration');

  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setLibrary(event.target.value as Library);
  }, []);

  return (
    <DependencyContext.Provider value={library}>
      <GlobalStyles />
      <div css={wrapperStyles}>
        <div>
          <RadioGroup options={options} value={library} onChange={onChange} />
        </div>
        <div>{children}</div>
      </div>
    </DependencyContext.Provider>
  );
}

type Components = {
  DragDropContext: ComponentType<DragDropContextProps>;
  Draggable: ComponentType<DraggableProps>;
  Droppable: ComponentType<DroppableProps>;
};

const componentMap: Record<Library, Components> = {
  migration,
  rbd,
};

export function useDependency(): Components {
  const library = useContext(DependencyContext);

  return componentMap[library];
}
