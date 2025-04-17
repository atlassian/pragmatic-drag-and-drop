/**
 * This is a vastly simplified version of the style marshal in `react-beautiful-dnd`.
 *
 * Most of the styles have been removed, as they are not required for native dragging.
 * They were only required in `react-beautiful-dnd` because it emulated dragging.
 */

import type { CSSProperties } from 'react';

import type { ContextId } from 'react-beautiful-dnd';

import { useLayoutEffect } from '../../hooks/use-isomorphic-layout-effect';
import type { CleanupFn } from '../../internal-types';
import { attributes } from '../../utils/attributes';

/**
 * Used to uniquely identify the style element.
 */
const styleContextIdAttribute = 'data-rbd-style-context-id';

/**
 * Returns the CSS string for the rule with the given selector and style
 * declarations.
 */
function getRuleString({ selector, styles }: { selector: string; styles: CSSProperties }) {
	const concatString = Object.entries(styles)
		.map(([property, value]) => `${property}: ${value};`)
		.join(' ');
	return `${selector} { ${concatString} }`;
}

/**
 * Returns the rule string for drag handle styles.
 */
export function getDragHandleRuleString(contextId: ContextId) {
	const selector = `[${attributes.dragHandle.contextId}="${contextId}"]`;
	const styles = {
		/**
		 * Indicates the element is draggable.
		 *
		 * Although this is always applied, it will not be visible during drags
		 * because the browser will override the cursor.
		 */
		cursor: 'grab',
		/**
		 * Improves the UX when dragging links on iOS.
		 *
		 * Without this a preview of the link will open. Although it is still
		 * draggable, it is inconsistent with `react-beautiful-dnd`.
		 */
		'-webkit-touch-callout': 'none',
	};
	return getRuleString({ selector, styles });
}

type ContextIdAndNonce = {
	contextId: ContextId;
	nonce?: string;
};

function createStyleEl({ contextId, nonce }: ContextIdAndNonce): HTMLStyleElement {
	const el: HTMLStyleElement = document.createElement('style');
	if (nonce) {
		el.setAttribute('nonce', nonce);
	}
	el.setAttribute(styleContextIdAttribute, contextId);
	document.head.appendChild(el);
	return el;
}

function createStyleManager({ contextId, nonce }: ContextIdAndNonce): CleanupFn {
	const el = createStyleEl({ contextId, nonce });

	/**
	 * Inject the style content.
	 */
	el.textContent = getDragHandleRuleString(contextId);

	return function cleanup() {
		el.remove();
	};
}

export default function useStyleMarshal({ contextId, nonce }: ContextIdAndNonce) {
	useLayoutEffect(() => {
		return createStyleManager({ contextId, nonce });
	}, [contextId, nonce]);
}
