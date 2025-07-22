import React, {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';

import invariant from 'tiny-invariant';

import Avatar from '@atlaskit/avatar';
import Button from '@atlaskit/button/new';
import {
	draggable,
	dropTargetForElements,
	monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
// eslint-disable-next-line @atlaskit/design-system/no-emotion-primitives -- to be migrated to @atlaskit/primitives/compiled – go/akcss
import { Box, Inline, Stack, xcss } from '@atlaskit/primitives';

const teamAreaStyles = xcss({
	// backgroundColor: 'elevation.surface.sunken',
	borderWidth: 'border.width',
	borderStyle: 'solid',
	borderColor: 'color.border.accent.blue',
	borderRadius: 'border.radius.100',
	height: '240px',
	width: '240px',
	padding: 'space.300',
});

type TeamId = 'blue' | 'red';

const teamAreaBorderColorStyles: Record<TeamId, ReturnType<typeof xcss>> = {
	blue: xcss({ borderColor: 'color.border.accent.blue' }),
	red: xcss({ borderColor: 'color.border.accent.red' }),
};

const teamAreaLabelStyles = xcss({
	fontSize: '20px',
	fontWeight: 'font.weight.medium',
});

const fullHeightStyles = xcss({ height: '100%' });

function TeamArea({
	children,
	teamId,
	label,
}: {
	children?: ReactNode;
	teamId: TeamId;
	label: string;
}) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		invariant(ref.current);
		return dropTargetForElements({
			element: ref.current,
			getData() {
				return { teamId };
			},
		});
	}, [teamId]);

	return (
		<Box ref={ref} xcss={[teamAreaStyles, teamAreaBorderColorStyles[teamId]]}>
			<Stack alignInline="center" spread="space-between" xcss={fullHeightStyles}>
				<Box xcss={teamAreaLabelStyles}>{label}</Box>
				{children}
			</Stack>
		</Box>
	);
}

type State = {
	teams: Record<TeamId, { label: string }>;
	chosenTeam: TeamId;
};

const initialState: State = {
	teams: {
		blue: { label: 'Blue team' },
		red: { label: 'Red team' },
	},
	chosenTeam: 'blue',
};

function getInstanceId() {
	return Symbol('instance-id');
}

const InstanceIdContext = createContext<symbol | null>(null);

export default function ManualFocusRestoration() {
	const [state, setState] = useState(initialState);
	const [instanceId] = useState(getInstanceId);

	const buttonRef = useRef<HTMLButtonElement>(null);
	const shouldRestoreFocusToButton = useRef(false);
	/**
	 * Restores focus to the button when the team changes,
	 * but only if we've marked it for focus restoration.
	 */
	useEffect(() => {
		if (shouldRestoreFocusToButton.current) {
			buttonRef.current?.focus();
			shouldRestoreFocusToButton.current = false;
		}
	}, [state.chosenTeam]);

	const swapTeam = useCallback(() => {
		if (document.activeElement === buttonRef.current) {
			/**
			 * If the button is focused when it is being clicked,
			 * we should mark it for focus restoration.
			 */
			shouldRestoreFocusToButton.current = true;
		}

		setState((state) => ({
			...state,
			chosenTeam: state.chosenTeam === 'blue' ? 'red' : 'blue',
		}));
	}, []);

	useEffect(() => {
		return monitorForElements({
			canMonitor({ source }) {
				return source.data.instanceId === instanceId;
			},
			onDrop({ location }) {
				const dropTarget = location.current.dropTargets[0];

				setState((state) => {
					const { teamId } = dropTarget.data;

					if (teamId === state.chosenTeam) {
						// Avoid an unnecessary update
						return state;
					}

					if (teamId === 'red' || teamId === 'blue') {
						return { ...state, chosenTeam: teamId };
					}

					return state;
				});
			},
		});
	}, [instanceId]);

	return (
		<InstanceIdContext.Provider value={instanceId}>
			<Inline>
				{Object.entries(state.teams).map(([teamId, teamEntry]) => (
					<TeamArea teamId={teamId as TeamId} label={teamEntry.label}>
						{state.chosenTeam === teamId && (
							<Stack alignBlock="center" space="space.100" alignInline="center">
								<Player />
								<Button ref={buttonRef} onClick={swapTeam} appearance="primary">
									Swap team
								</Button>
							</Stack>
						)}
					</TeamArea>
				))}
			</Inline>
		</InstanceIdContext.Provider>
	);
}

function Player() {
	const instanceId = useContext(InstanceIdContext);

	const avatarRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		invariant(avatarRef.current);
		invariant(avatarRef.current.firstElementChild instanceof HTMLElement);
		return draggable({
			element: avatarRef.current.firstElementChild,
			getInitialData() {
				return { instanceId };
			},
		});
	}, [instanceId]);

	return (
		<div ref={avatarRef}>
			<Avatar size="xlarge" />
		</div>
	);
}
