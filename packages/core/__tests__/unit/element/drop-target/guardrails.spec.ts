import { dropTargetForElements } from '../../../../src/entry-point/element/adapter';
import { dropTargetForExternal } from '../../../../src/entry-point/external/adapter';
import { getElements, reset } from '../../_util';

const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

beforeEach(async () => {
	warn.mockClear();
	await reset();
});

it('should warn if registering two drop targets of the same type on an element', () => {
	const [A] = getElements('div');

	const unbind1 = dropTargetForElements({
		element: A,
	});

	expect(warn).not.toHaveBeenCalled();

	const unbind2 = dropTargetForElements({
		element: A,
	});

	expect(warn).toHaveBeenCalled();

	unbind1();
	unbind2();
});

it('should not warn if registering two drop targets of different types on an element', () => {
	const [A] = getElements('div');

	const unbind1 = dropTargetForElements({
		element: A,
	});

	expect(warn).not.toHaveBeenCalled();

	const unbind2 = dropTargetForExternal({
		element: A,
	});

	expect(warn).not.toHaveBeenCalled();

	unbind1();
	unbind2();
});

// this can mess with detecting when entering / leaving an iframe
it('should warn if registering an iframe element as a drop target', () => {
	const [iframe] = getElements('iframe');

	const unbind = dropTargetForElements({
		element: iframe,
	});

	expect(warn).toHaveBeenCalled();

	unbind();
});
