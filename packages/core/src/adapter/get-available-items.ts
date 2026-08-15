import { isAnAvailableType } from './is-an-available-type';

// eslint-disable-next-line @atlaskit/volt-strict-mode/no-multiple-exports
export function getAvailableItems(dataTransfer: DataTransfer): DataTransferItem[] {
	// item.kind is 'string' | 'file'
	// For 'string' item.type is the mimeType (eg 'text/plain')
	// For 'file' item.type is the file type (eg 'image/jpg')

	return Array.from(dataTransfer.items).filter(
		(item) =>
			item.kind === 'file' ||
			isAnAvailableType({
				type: item.type,
				value: dataTransfer.getData(item.type),
			}),
	);
}
