/**
 * Structured MCP docs for `@atlaskit/pragmatic-drag-and-drop-live-region`.
 *
 * ⚠️ Pilot / not yet final. This file is part of the libraries-content pilot
 * for the "Libraries, hooks, utilities in structured content" RFC. The
 * container schema and per-kind shapes are still in review — expect breaking
 * changes before this is rolled out broadly. Do not depend on the format yet.
 *
 * This package has zero React components — just two utility functions and a
 * constant. It is a clean test case for utilities-only documentation.
 *
 * Contact #dst-structured-content in Slack with questions.
 */

import path from 'path';

import type { StructuredContentSource } from '@atlassian/structured-docs-types';

import packageJson from './package.json';

const packagePath = path.resolve(__dirname);

const documentation: StructuredContentSource = {
	package: {
		package: '@atlaskit/pragmatic-drag-and-drop-live-region',
		packagePath,
		packageJson,
		overview:
			'Singleton ARIA live region for the Pragmatic drag-and-drop ecosystem. Use `announce()` to push messages to assistive tech (e.g. "Card 3 picked up", "Dropped on column 2") during drag interactions where there is no visual focus change to convey progress.',
	},
	utilities: [
		{
			kind: 'function',
			name: 'announce',
			description:
				'Pushes a message to the shared visually-hidden live region (creating it lazily on first call). The update is debounced by ~1s so that focus-change events around the drag do not interrupt the announcement.',
			status: 'general-availability',
			signature: '(message: string) => void',
			parameters: [
				{
					name: 'message',
					type: 'string',
					description: 'Plain text to be read by screen readers.',
				},
			],
			returns: { type: 'void' },
			usageGuidelines: [
				'Call `announce` from drag lifecycle callbacks (`onDragStart`, `onDrop`, custom keyboard shortcuts) when the next state change has no other accessible signal.',
				'Keep messages short and use the imperative ("Picked up card 3", "Moved to top of list") — long sentences are likely to be interrupted by the next focus change.',
				'Localise messages at the call site; this package does no translation.',
			],
			accessibilityGuidelines: [
				'Pairs with the rest of `@atlaskit/pragmatic-drag-and-drop-react-accessibility`. Use this when neither focus movement nor visible text already communicates the change to assistive tech.',
			],
			keywords: ['pragmatic-drag-and-drop', 'pdnd', 'live-region', 'a11y', 'announce', 'screen-reader'],
			categories: ['drag-and-drop', 'accessibility', 'utilities'],
			examples: [],
		},
		{
			kind: 'function',
			name: 'cleanup',
			description:
				'Removes the singleton live-region node from the DOM. No-op if `announce` has never been called. Mostly useful in tests to reset state between cases.',
			status: 'general-availability',
			signature: '() => void',
			parameters: [],
			returns: { type: 'void' },
			usageGuidelines: [
				'Call from a test teardown to keep the DOM tidy between runs. Production apps rarely need this — the node is harmless to leave in place.',
			],
			keywords: ['pragmatic-drag-and-drop', 'pdnd', 'live-region', 'cleanup', 'teardown'],
			categories: ['drag-and-drop', 'utilities', 'testing'],
			examples: [],
		},
	],
};

export default documentation;
