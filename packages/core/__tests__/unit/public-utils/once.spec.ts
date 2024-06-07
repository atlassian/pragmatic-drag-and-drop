import { once } from '../../../src/entry-point/once';

it('should only call an underlying function once', () => {
	const add = jest.fn(function add(a: number, b: number): number {
		return a + b;
	});

	// create onced fn
	const addOnce = once(add);

	// add not called yet
	expect(add).toHaveBeenCalledTimes(0);

	// add now called
	expect(addOnce(1, 2)).toEqual(3);
	expect(add).toHaveBeenCalledTimes(1);
	add.mockClear();

	// old result returned
	expect(addOnce(2, 3)).toEqual(3);
	expect(addOnce.call({}, 2, 4)).toEqual(3);
	expect(add).not.toHaveBeenCalled();
});

it('should only call an underlying function once (target function returns undefined)', () => {
	const noop = jest.fn(function noop(): void {
		return undefined;
	});

	// create onced fn
	const noopOnce = once(noop);

	// add not called yet
	expect(noop).toHaveBeenCalledTimes(0);

	// add now called
	expect(noopOnce()).toEqual(undefined);
	expect(noop).toHaveBeenCalledTimes(1);
	noop.mockClear();

	// old result returned
	expect(noopOnce()).toEqual(undefined);
	expect(noopOnce.call({})).toEqual(undefined);
	expect(noop).not.toHaveBeenCalled();
});

it('should only call an underlying function once (target function uses `this`)', () => {
	type Person = {
		age: number;
	};
	function getAge(this: Person): number {
		return this.age;
	}

	const getAgeOnce = once(getAge);

	const person1: Person = {
		age: 10,
	};
	expect(getAgeOnce.call(person1)).toEqual(10);

	const person2: Person = {
		age: 20,
	};
	// using old age
	expect(getAgeOnce.call(person2)).toEqual(10);
});

const expectType = <Type>(a: Type): void => {
	expect(true).toBe(true);
};

it('should keep the original function type', () => {
	function add(a: number, b: number): number {
		return a + b;
	}

	const addOnce = once(add);

	expectType<typeof add>(addOnce);
});
