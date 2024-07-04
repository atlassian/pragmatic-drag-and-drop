// Ideally we would use the "@jest-environment node" file pragma,
// but global test setup uses `window` too much
// So we have to 'clean' the JSDOM environment
// (this is how the @atlaskit/ssr package works)

// 0. Turning file into a module so that we can do a top level `window.close()`
// Need to do an `import` or an `export` for this file to be treated as a module
export {};

// 2. Removing globals
// @ts-ignore
delete global.document;
// @ts-ignore
delete global.window;

test('importing all entry points on the server should not cause any exceptions', () => {
	const globby = require('globby');
	const paths = globby.sync('../../src/entry-point/**/*.ts', {
		cwd: __dirname,
	});

	// validate that we are getting some paths!
	expect(paths.length > 0).toBe(true);

	// run the actual test
	for (const path of paths) {
		expect(() => require(path)).not.toThrow();
	}
});

test('`combine` should work on the server', () => {
	const { combine } = require('../../src/entry-point/combine');
	const fn1 = jest.fn();
	const fn2 = jest.fn();
	const combined = combine(fn1, fn2);

	expect(fn1).not.toHaveBeenCalled();
	expect(fn2).not.toHaveBeenCalled();

	combined();

	expect(fn1).toHaveBeenCalled();
	expect(fn2).toHaveBeenCalled();
});

test('`once` should work on the server', () => {
	const { once } = require('../../src/entry-point/once');
	const fn1 = jest.fn();

	const onced = once(fn1);

	onced();
	onced();
	onced();

	expect(fn1).toHaveBeenCalledTimes(1);
});

test('`reorder` should work on the server', () => {
	const { reorder } = require('../../src/entry-point/reorder');

	expect(
		reorder({
			list: ['A', 'B'],
			// Grab A
			startIndex: 0,
			// Move it to where B is
			finishIndex: 1,
		}),
	).toEqual(['B', 'A']);
});
