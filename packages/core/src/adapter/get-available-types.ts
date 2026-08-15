import { type NativeMediaType } from '../internal-types';

import { isAnAvailableType } from './is-an-available-type';

// eslint-disable-next-line @atlaskit/volt-strict-mode/no-multiple-exports
export function getAvailableTypes(transfer: DataTransfer): NativeMediaType[] {
	return Array.from(transfer.types).filter((type) =>
		isAnAvailableType({ type, value: transfer.getData(type) }),
	);
}
