function noop() {}

type ConsoleFunction = 'warn' | 'error';

function withConsole(type: ConsoleFunction, fn: () => void, message?: string) {
	const mock = jest.spyOn(console, type).mockImplementation(noop);

	fn();

	expect(mock).toHaveBeenCalled();

	if (message) {
		expect(mock).toHaveBeenCalledWith(expect.stringContaining(message));
	}

	mock.mockReset();
}

export const withError: (fn: () => void, message?: string | undefined) => void = withConsole.bind(
	null,
	'error',
);
export const withWarn: (fn: () => void, message?: string | undefined) => void = withConsole.bind(
	null,
	'warn',
);

function withoutConsole(type: ConsoleFunction, fn: () => void) {
	const mock = jest.spyOn(console, type).mockImplementation(noop);

	fn();

	expect(mock).not.toHaveBeenCalled();
	mock.mockReset();
}

export const withoutError: (fn: () => void) => void = withoutConsole.bind(null, 'error');
export const withoutWarn: (fn: () => void) => void = withoutConsole.bind(null, 'warn');
