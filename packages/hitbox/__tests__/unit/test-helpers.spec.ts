import { between, getElements } from './_util';

test('between()', () => {
	expect(between(3, 5)).toBe(4);
	expect(between(-3, -5)).toBe(-4);
	expect(between(0, 0)).toBe(0);
	expect(between(0, 10)).toBe(5);
	expect(between(-2, 2)).toBe(0);
});

test('getElements()', () => {
	const [first, second] = getElements();
	expect(first).toBeInstanceOf(HTMLElement);
	expect(second).toBeInstanceOf(HTMLElement);
});
