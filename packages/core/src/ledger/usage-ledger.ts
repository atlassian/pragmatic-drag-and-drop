import { type AllDragTypes, type CleanupFn } from '../internal-types';

type Entry<TypeKey extends AllDragTypes['type']> = {
	typeKey: TypeKey;
	unmount: () => void;
	usageCount: number;
};

// Extending `Map` to allow us to link Key and Values together
interface Ledger extends Map<AllDragTypes['type'], Entry<AllDragTypes['type']>> {
	get<Key extends AllDragTypes['type']>(key: Key): Entry<Key> | undefined;
	set<Key extends AllDragTypes['type'], Value extends Entry<Key>>(key: Key, value: Value): this;
}

const ledger: Ledger = new Map();

function registerUsage<TypeKey extends AllDragTypes['type']>({
	typeKey,
	mount,
}: {
	typeKey: TypeKey;
	mount: () => CleanupFn;
}): Entry<TypeKey> {
	const entry: Entry<TypeKey> | undefined = ledger.get(typeKey);

	if (entry) {
		entry.usageCount++;
		return entry;
	}

	const initial: Entry<TypeKey> = {
		typeKey,
		unmount: mount(),
		usageCount: 1,
	};
	ledger.set(typeKey, initial);

	return initial;
}

export function register<TypeKey extends AllDragTypes['type']>(args: {
	typeKey: TypeKey;
	mount: () => CleanupFn;
}): CleanupFn {
	const entry: Entry<TypeKey> = registerUsage(args);

	return function unregister() {
		entry.usageCount--;

		if (entry.usageCount > 0) {
			return;
		}
		// Only a single usage left, remove it
		entry.unmount();
		ledger.delete(args.typeKey);
	};
}
