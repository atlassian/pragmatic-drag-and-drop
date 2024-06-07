/**
 * Avoids a warning being printed during SSR.
 *
 * See article for further information:
 * <https://medium.com/@alexandereardon/uselayouteffect-and-ssr-192986cdcf7a>
 */

import { useEffect, useLayoutEffect } from 'react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Ensure the name used in components is useLayoutEffect
export { useIsomorphicLayoutEffect as useLayoutEffect };
