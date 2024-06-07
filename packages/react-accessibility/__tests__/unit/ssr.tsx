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

test('should ssr then hydrate correctly', async () => {
	const elem = document.createElement('div');
	const { html, styles } = await ssr(examplePath);

	elem.innerHTML = html;
	hydrate(examplePath, elem, styles);

	// No other errors from e.g. hydrate
	// eslint-disable-next-line no-console
	const mockCalls = (console.error as jest.Mock).mock.calls;
	expect(mockCalls.length).toBe(0);
});
