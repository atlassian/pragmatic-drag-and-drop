import { type ContainsSource } from './native-types';

export function containsFiles({ source }: ContainsSource): boolean {
	return source.types.includes('Files');
}
