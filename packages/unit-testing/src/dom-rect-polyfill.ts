// This file polyfills DOMRect
// DOMRect is currently not polyfilled by jsdom

(() => {
	if (typeof window === 'undefined') {
		return;
	}
	if (window.DOMRect) {
		return;
	}

	class DOMRect {
		x: number;
		y: number;
		width: number;
		height: number;
		top: number;
		right: number;
		bottom: number;
		left: number;

		constructor(x = 0, y = 0, width = 0, height = 0) {
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;

			// Computed values.
			// See https://developer.mozilla.org/en-US/docs/Web/API/DOMRect
			this.top = height < 0 ? y + height : y;
			this.right = width < 0 ? x : x + width;
			this.bottom = height < 0 ? y : y + height;
			this.left = width < 0 ? x + width : x;
		}

		static fromRect(rectangle: DOMRectInit | undefined) {
			return new DOMRect(rectangle?.x, rectangle?.y, rectangle?.width, rectangle?.height);
		}

		toJSON() {
			return this;
		}
	}

	window.DOMRect = DOMRect;
})();
