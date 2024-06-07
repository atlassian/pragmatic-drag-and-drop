import { type ContainsSource } from './native-types';

export function containsFiles({ source }: ContainsSource): boolean {
	return source.types.includes('Files');
}

/** Obtain an array of the dragged `File`s */
export function getFiles({ source }: ContainsSource): File[] {
	return (
		source.items
			// unlike other media types, for files:
			// item.kind is 'file'
			// item.type is the type of file eg 'image/jpg'
			// for other media types, item.type is the mime format
			.filter((item) => item.kind === 'file')
			.map((item) => item.getAsFile())
			.filter((file: File | null): file is File => file != null)
	);
}
