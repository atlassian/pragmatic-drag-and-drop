/**
 * @jest-environment node
 */
import React from 'react';

import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import invariant from 'tiny-invariant';

import { resetServerContext } from '../../../../../../src';
import App from '../_utils/app';

const consoleFunctions = [
	jest.spyOn(console, 'warn'),
	jest.spyOn(console, 'error'),
	jest.spyOn(console, 'log'),
];

beforeEach(() => {
	// Reset server context between tests to prevent state being shared between them
	resetServerContext();
});

afterEach(() => {
	consoleFunctions.forEach((fn) => {
		fn.mockRestore();
	});
});

const expectConsoleNotCalled = () => {
	consoleFunctions.forEach((fn) => {
		expect(fn).not.toHaveBeenCalled();
	});
};

// Checking that the browser globals are not available in this test file
invariant(
	typeof window === 'undefined' && typeof document === 'undefined',
	'browser globals found in node test',
);

it('should support rendering to a string', async () => {
	const result: string = renderToString(<App />);

	expect(result).toEqual(expect.any(String));
	expect(result).toMatchSnapshot();
	expectConsoleNotCalled();
});

it('should support rendering to static markup', async () => {
	const result: string = renderToStaticMarkup(<App />);

	expect(result).toEqual(expect.any(String));
	expect(result).toMatchSnapshot();
	expectConsoleNotCalled();
});

it('should render identical content when resetting context between renders', async () => {
	const firstRender = renderToString(<App />);
	const nextRenderBeforeReset = renderToString(<App />);
	expect(firstRender).not.toEqual(nextRenderBeforeReset);

	resetServerContext();
	const nextRenderAfterReset = renderToString(<App />);
	expect(firstRender).toEqual(nextRenderAfterReset);
	expectConsoleNotCalled();
});
