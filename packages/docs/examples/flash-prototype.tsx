import React, { type ReactNode, useCallback, useState } from 'react';

import invariant from 'tiny-invariant';

import { Code } from '@atlaskit/code';
import Lozenge from '@atlaskit/lozenge';
import {
  easeIn,
  easeInOut,
  easeOut,
  largeDurationMs,
  mediumDurationMs,
  smallDurationMs,
} from '@atlaskit/motion';
import { Inline, Stack, xcss } from '@atlaskit/primitives';
import { RadioGroup } from '@atlaskit/radio';
import { type OptionsPropType } from '@atlaskit/radio/types';
import { token } from '@atlaskit/tokens';

import List from './pieces/post-drop-flash/list';

const durationMap = {
  largeDurationMs,
  mediumDurationMs,
  smallDurationMs,
};

function isDurationKey(value: unknown): value is keyof typeof durationMap {
  return typeof value === 'string' && durationMap.hasOwnProperty(value);
}

const easingMap = {
  easeIn,
  easeInOut,
  easeOut,
  linear: 'linear',
  browserDefault: 'ease',
};

function isEasingKey(value: unknown): value is keyof typeof easingMap {
  return typeof value === 'string' && easingMap.hasOwnProperty(value);
}

const layoutStyles = xcss({
  justifyContent: 'center',
  gap: 'space.400',
  padding: 'space.400',
});

export default function PostDropFlashPrototype() {
  const [params, setParams] = useState<{
    duration: keyof typeof durationMap;
    easing: keyof typeof easingMap;
  }>({
    duration: 'smallDurationMs',
    easing: 'easeInOut',
  });

  const triggerPostMoveFlash = useCallback(
    (element: HTMLElement) => {
      element.animate(
        [
          {
            backgroundColor: token('color.background.selected', 'transparent'),
          },
          {},
        ],
        {
          duration: durationMap[params.duration],
          easing: easingMap[params.easing],
          iterations: 1,
        },
      );
    },
    [params],
  );

  const onChange = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    const formData = new FormData(form);

    const { duration, easing } = Object.fromEntries(formData.entries());

    invariant(isDurationKey(duration));
    invariant(isEasingKey(easing));

    setParams({ duration, easing });
  }, []);

  return (
    <Inline xcss={layoutStyles}>
      <List triggerPostMoveFlash={triggerPostMoveFlash} />
      <FlashParameterForm onChange={onChange} />
    </Inline>
  );
}

function OptionLabel({
  children,
  description,
}: {
  children: ReactNode;
  description?: ReactNode;
}) {
  return (
    <Stack space="space.050">
      <Inline alignBlock="center" space="space.100">
        {children}
      </Inline>
{/* eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766 */}
      {description && <small style={{ margin: 0 }}>{description}</small>}
    </Stack>
  );
}

const durationOptions: OptionsPropType = [
  {
    name: 'duration',
    value: 'smallDurationMs',
    label: <OptionLabel description={<>Equal to 100ms</>}>Small</OptionLabel>,
  },
  {
    name: 'duration',
    value: 'mediumDurationMs',
    label: <OptionLabel description={<>Equal to 350ms</>}>Medium</OptionLabel>,
  },
  {
    name: 'duration',
    value: 'largeDurationMs',
    label: (
      <OptionLabel description={<>Equal to 700ms</>}>
        <span>Large</span>
        <Lozenge appearance="inprogress">Current</Lozenge>
      </OptionLabel>
    ),
  },
];

const easingOptions: OptionsPropType = [
  {
    name: 'easing',
    value: 'easeInOut',
    label: (
      <OptionLabel
        description={
          <>
            Equal to <Code>cubic-bezier(0.15, 1, 0.3, 1)</Code>
          </>
        }
      >
        easeInOut
      </OptionLabel>
    ),
  },
  {
    name: 'easing',
    value: 'easeIn',
    label: (
      <OptionLabel
        description={
          <>
            Equal to <Code>cubic-bezier(0.8, 0, 0, 0.8)</Code>
          </>
        }
      >
        easeIn
      </OptionLabel>
    ),
  },
  {
    name: 'easing',
    value: 'easeOut',
    label: (
      <OptionLabel
        description={
          <>
            Equal to <Code>cubic-bezier(0.2, 0, 0, 1)</Code>
          </>
        }
      >
        easeOut
      </OptionLabel>
    ),
  },
  {
    name: 'easing',
    value: 'linear',
    label: (
      <OptionLabel
        description={
          <>
            Equal to <Code>cubic-bezier(0.0, 0.0, 1.0, 1.0)</Code>
          </>
        }
      >
        <span>Linear</span>
        <Lozenge appearance="removed">Not @atlaskit/motion</Lozenge>
      </OptionLabel>
    ),
  },
  {
    name: 'easing',
    value: 'browserDefault',
    label: (
      <OptionLabel
        description={
          <>
            Equal to <Code>cubic-bezier(0.25, 0.1, 0.25, 1.0)</Code>
          </>
        }
      >
        <span>Browser default</span>
        <Lozenge appearance="inprogress">Current</Lozenge>
        <Lozenge appearance="removed">Not @atlaskit/motion</Lozenge>
      </OptionLabel>
    ),
  },
];

function FlashParameterForm({
  onChange,
}: {
  onChange: React.FormEventHandler<HTMLFormElement>;
}) {
  return (
    <form onChange={onChange}>
      <Stack>
        <Stack>
          <strong id="duration-label">Duration</strong>
          <RadioGroup
            options={durationOptions}
            aria-labelledby="duration-label"
            defaultValue={durationOptions[0].value}
          />
        </Stack>
        <Stack>
          <strong id="easing-label">Easing</strong>
          <RadioGroup
            options={easingOptions}
            aria-labelledby="easing-label"
            defaultValue={easingOptions[0].value}
          />
        </Stack>
      </Stack>
    </form>
  );
}
