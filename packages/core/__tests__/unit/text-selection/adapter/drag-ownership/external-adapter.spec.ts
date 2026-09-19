import { monitorForExternal } from '../../../../../src/adapter/monitor-for-external';
import { combine } from '../../../../../src/public-utils/combine';
import { appendToBody, getElements, nativeDrag, reset } from '../../../_util';

afterEach(reset);

test('text selection drags should not trigger the external adapter', () => {
	const [A] = getElements('div');
	const [paragraph] = getElements('div');
	paragraph.textContent = 'Hello world';
	const ordered: string[] = [];

	const cleanup = combine(
		appendToBody(A),
		appendToBody(paragraph),
		monitorForExternal({
			onDragStart: () => ordered.push('a(external):start'),
		}),
	);

	nativeDrag.startTextSelectionDrag({
		element: paragraph,
	});

	expect(ordered).toEqual([]);

	cleanup();
});
