import { type unsafeOverflowAutoScrollForElements } from '../../../src/entry-point/unsafe-overflow/element';

const isEqual = <T>(a: T): void => {
	expect(true).toBe(true);
};

type GetOverflowFn = Parameters<typeof unsafeOverflowAutoScrollForElements>[0]['getOverflow'];
type ProvidedHitboxSpacing = ReturnType<GetOverflowFn>;

it('should allow to main axis edge', () => {
	isEqual<ProvidedHitboxSpacing>({ forTopEdge: { top: 5 } });
	isEqual<ProvidedHitboxSpacing>({ forRightEdge: { right: 5 } });
	isEqual<ProvidedHitboxSpacing>({ forBottomEdge: { bottom: 5 } });
	isEqual<ProvidedHitboxSpacing>({ forLeftEdge: { left: 5 } });
});

it('should allow cross axis definitions', () => {
	isEqual<ProvidedHitboxSpacing>({ forTopEdge: { top: 100, left: 2, right: 3 } });
	isEqual<ProvidedHitboxSpacing>({ forRightEdge: { right: 100, top: 2, bottom: 3 } });
	isEqual<ProvidedHitboxSpacing>({ forBottomEdge: { bottom: 100, left: 2, right: 3 } });
	isEqual<ProvidedHitboxSpacing>({ forLeftEdge: { left: 100, top: 2, bottom: 3 } });
});

it('should not allow stretching back into the element', () => {
	// @ts-expect-error
	isEqual<ProvidedHitboxSpacing>({ forTopEdge: { top: 100, bottom: 10 } });
	// @ts-expect-error
	isEqual<ProvidedHitboxSpacing>({ forRightEdge: { right: 100, left: 2 } });
	// @ts-expect-error
	isEqual<ProvidedHitboxSpacing>({ forBottomEdge: { bottom: 100, top: 3 } });
	// @ts-expect-error
	isEqual<ProvidedHitboxSpacing>({ forLeftEdge: { left: 100, right: 4 } });
});
