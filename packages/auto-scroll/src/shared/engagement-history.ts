import { type EngagementHistoryEntry } from '../internal-types';

const ledger: Map<Element, EngagementHistoryEntry> = new Map();
const requested: Set<Element> = new Set();

export function markAndGetEngagement(element: Element): EngagementHistoryEntry {
	markEngagement(element);

	const entry = ledger.get(element);
	if (entry) {
		return entry;
	}
	const fresh: EngagementHistoryEntry = {
		timeOfEngagementStart: Date.now(),
	};
	ledger.set(element, fresh);
	return fresh;
}

// eslint-disable-next-line @atlaskit/volt-strict-mode/no-multiple-exports
export function markEngagement(element: Element): void {
	requested.add(element);
}

// eslint-disable-next-line @atlaskit/volt-strict-mode/no-multiple-exports
export function clearUnusedEngagements(fn: () => void): void {
	// make sure previous engagement requests don't linger
	requested.clear();

	// perform the required work
	fn();

	// if engagements where not requested, purge it
	ledger.forEach((_, element) => {
		if (!requested.has(element)) {
			ledger.delete(element);
		}
	});

	// cleaning up after ourselves
	requested.clear();
}

// eslint-disable-next-line @atlaskit/volt-strict-mode/no-multiple-exports
export function clearEngagementHistory(): void {
	ledger.clear();
}
