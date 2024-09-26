import { screen } from '@testing-library/react';

import { cleanup, hydrate, ssr } from '@atlaskit/ssr/emotion';

function noop() {}

jest.spyOn(global.console, 'error').mockImplementation(noop);

const examplePath = require.resolve('../../examples/drag-handle-button.tsx');

afterEach(() => {
	// Check cleanup
	cleanup();
	// reset mocks
	jest.resetAllMocks();
});

// Skipped due to HOT-111922 Fails for React 18
test.skip('should ssr then hydrate correctly', async () => {
	const elem = document.createElement('div');
	const { html, styles } = await ssr(examplePath);

	elem.innerHTML = html;
	hydrate(examplePath, elem, styles);

	// Jest 29 - Added assertion to fix: Jest worker encountered 4 child process exceptions, exceeding retry limit
	await screen.findAllByRole('button');

	// No other errors from e.g. hydrate
	// eslint-disable-next-line no-console
	const mockCalls = (console.error as jest.Mock).mock.calls;
	expect(mockCalls.length).toBe(0);
});
