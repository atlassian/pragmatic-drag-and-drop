test('new DOMRect(x, y, width, height)', () => {
	const x = 10;
	const y = 20;
	const width = 30;
	const height = 40;
	// eslint-disable-next-line compat/compat
	const rect = new DOMRect(x, y, width, height);

	expect(rect.x).toBe(x);
	expect(rect.y).toBe(y);
	expect(rect.width).toBe(width);
	expect(rect.height).toBe(height);
	expect(rect.top).toBe(y);
	expect(rect.right).toBe(x + width);
	expect(rect.bottom).toBe(y + height);
	expect(rect.left).toBe(x);
});

test('new DOMRect()', () => {
	// eslint-disable-next-line compat/compat
	const rect = new DOMRect();

	expect(rect.x).toBe(0);
	expect(rect.y).toBe(0);
	expect(rect.width).toBe(0);
	expect(rect.height).toBe(0);
	expect(rect.top).toBe(0);
	expect(rect.right).toBe(0);
	expect(rect.bottom).toBe(0);
	expect(rect.left).toBe(0);
});

test('DOMRect.fromRect(x, y, width, height)', () => {
	const x = 10;
	const y = 20;
	const width = 30;
	const height = 40;
	const rect = DOMRect.fromRect({ x, y, width, height });

	expect(rect.x).toBe(x);
	expect(rect.y).toBe(y);
	expect(rect.width).toBe(width);
	expect(rect.height).toBe(height);
	expect(rect.top).toBe(y);
	expect(rect.right).toBe(x + width);
	expect(rect.bottom).toBe(y + height);
	expect(rect.left).toBe(x);
});

test('DOMRect.fromRect({x, y, width, height}) same as new Rect(x, y, width, height)', () => {
	const x = 10;
	const y = 20;
	const width = 30;
	const height = 40;

	expect(DOMRect.fromRect({ x, y, width, height })).toEqual(
		// eslint-disable-next-line compat/compat
		new DOMRect(x, y, width, height),
	);
});

test('DOMRect.fromRect()', () => {
	const rect = DOMRect.fromRect();

	expect(rect.x).toBe(0);
	expect(rect.y).toBe(0);
	expect(rect.width).toBe(0);
	expect(rect.height).toBe(0);
	expect(rect.top).toBe(0);
	expect(rect.right).toBe(0);
	expect(rect.bottom).toBe(0);
	expect(rect.left).toBe(0);
});

test('DOMRect.fromRect({})', () => {
	const rect = DOMRect.fromRect({});

	expect(rect.x).toBe(0);
	expect(rect.y).toBe(0);
	expect(rect.width).toBe(0);
	expect(rect.height).toBe(0);
	expect(rect.top).toBe(0);
	expect(rect.right).toBe(0);
	expect(rect.bottom).toBe(0);
	expect(rect.left).toBe(0);
});

test('DOMRect.toJSON()', () => {
	const rect = DOMRect.fromRect({ x: 10, y: 20, width: 30, height: 40 });

	expect(JSON.parse(JSON.stringify(rect))).toStrictEqual({
		x: rect.x,
		y: rect.y,
		width: rect.width,
		height: rect.height,
		top: rect.top,
		right: rect.right,
		bottom: rect.bottom,
		left: rect.left,
	});
});

test('negative values', () => {
	const x = 10;
	const y = 20;
	const width = -30;
	const height = -40;
	const rect = DOMRect.fromRect({ x, y, width, height });

	expect(rect.x).toBe(x);
	expect(rect.y).toBe(y);
	expect(rect.width).toBe(width);
	expect(rect.height).toBe(height);

	// Computed values. There is custom logic
	// when width or height are negative
	// https://developer.mozilla.org/en-US/docs/Web/API/DOMRect
	expect(rect.top).toBe(y + height);
	expect(rect.right).toBe(x);
	expect(rect.bottom).toBe(y);
	expect(rect.left).toBe(x + width);
});
