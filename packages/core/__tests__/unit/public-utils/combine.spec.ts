import { combine } from '../../../src/entry-point/combine';

it('should call all combined functions', () => {
  const ordered: string[] = [];
  const first = () => ordered.push('first');
  const second = () => ordered.push('second');
  const third = () => ordered.push('third');

  const combined = combine(first, second, third);

  combined();

  expect(ordered).toEqual(['first', 'second', 'third']);
});
