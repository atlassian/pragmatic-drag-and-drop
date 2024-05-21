import { urlMediaType } from '../../util/media-types/url-media-type';

import { type ContainsSource } from './native-types';

export function containsURLs({ source }: ContainsSource): boolean {
  return source.types.includes(urlMediaType);
}

export function getURLs({ source }: ContainsSource): string[] {
  const value: string | null = source.getStringData(urlMediaType);

  // no values found
  if (value == null) {
    return [];
  }

  const urls: string[] = value
    // You can have multiple urls split by CR+LF (EOL)
    // - CR: Carriage Return '\r'
    // - LF: Line Feed '\n'
    // - EOL: End of Line '\r\n'
    .split('\r\n')
    // a uri-list can have comment lines starting with '#'
    // so we need to remove those
    .filter(piece => !piece.startsWith('#'));

  return urls;
}
