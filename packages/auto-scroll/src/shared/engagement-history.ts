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

export function markEngagement(element: Element) {
  requested.add(element);
}

export function clearUnusedEngagements(fn: () => void) {
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

export function clearEngagementHistory() {
  ledger.clear();
}
