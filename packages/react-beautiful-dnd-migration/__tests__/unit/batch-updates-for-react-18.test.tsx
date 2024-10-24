type BatchFunction = (callback: () => void) => void;

async function setupMocks({
	version,
	unstable_batchedUpdates,
}: {
	version: string | undefined;
	unstable_batchedUpdates: BatchFunction | undefined;
}): Promise<BatchFunction> {
	jest.setMock('react-dom', { version, unstable_batchedUpdates });

	// Chunk name doesn't make sense in a test
	// eslint-disable-next-line import/dynamic-import-chunkname
	const { batchUpdatesForReact16 } = await import('../../src/utils/batch-updates-for-react-16');
	return batchUpdatesForReact16;
}

describe('batchUpdatesForReact16()', () => {
	beforeEach(() => {
		jest.resetModules();
	});

	it('should use unstable_batchedUpdates for react 16', async () => {
		const mockUnstableBatchedUpdates = jest.fn();
		const batchUpdatesForReact16 = await setupMocks({
			version: '16.13.0',
			unstable_batchedUpdates: mockUnstableBatchedUpdates,
		});

		const callback = jest.fn();
		batchUpdatesForReact16(callback);

		expect(mockUnstableBatchedUpdates).toHaveBeenCalledTimes(1);
		expect(mockUnstableBatchedUpdates).toHaveBeenCalledWith(callback);
	});

	/**
	 * The version export was only added in `react-dom@16.13.0`
	 *
	 * Because we support `react-dom@^16.8.0` we need to handle when the version is `undefined`
	 */
	it('should use unstable_batchedUpdates if no version is available', async () => {
		const mockUnstableBatchedUpdates = jest.fn();
		const batchUpdatesForReact16 = await setupMocks({
			version: undefined,
			unstable_batchedUpdates: mockUnstableBatchedUpdates,
		});

		const callback = jest.fn();
		batchUpdatesForReact16(callback);

		expect(mockUnstableBatchedUpdates).toHaveBeenCalledTimes(1);
		expect(mockUnstableBatchedUpdates).toHaveBeenCalledWith(callback);
	});

	it('should call the callback directly for react 18', async () => {
		const mockUnstableBatchedUpdates = jest.fn();
		const batchUpdatesForReact16 = await setupMocks({
			version: '18.0.0',
			unstable_batchedUpdates: mockUnstableBatchedUpdates,
		});

		const callback = jest.fn();
		batchUpdatesForReact16(callback);

		expect(mockUnstableBatchedUpdates).not.toHaveBeenCalled();
		expect(callback).toHaveBeenCalledTimes(1);
	});

	/**
	 * `unstable_batchedUpdates` should exist in all versions we support,
	 * but it's possible it will be removed in the future.
	 *
	 * This is just a defensive behavior, it is not currently needed.
	 */
	it('should call the callback directly if unstable_batchedUpdates is not available', async () => {
		const mockUnstableBatchedUpdates = jest.fn();
		const batchUpdatesForReact16 = await setupMocks({
			version: undefined,
			unstable_batchedUpdates: undefined,
		});

		const callback = jest.fn();
		batchUpdatesForReact16(callback);

		expect(mockUnstableBatchedUpdates).not.toHaveBeenCalled();
		expect(callback).toHaveBeenCalledTimes(1);
	});
});
