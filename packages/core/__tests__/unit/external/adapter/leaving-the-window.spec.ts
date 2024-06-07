import { combine } from '../../../../src/entry-point/combine';
import {
	dropTargetForExternal,
	monitorForExternal,
} from '../../../../src/entry-point/external/adapter';
import { appendToBody, getBubbleOrderedTree, nativeDrag, reset, userEvent } from '../../_util';

afterEach(reset);

it('should end an external drag when dragging out of the window', () => {
	const [A] = getBubbleOrderedTree();
	const types: string[] = [];
	const ordered: string[] = [];
	const cleanup = combine(
		appendToBody(A),
		dropTargetForExternal({
			element: A,
		}),
		monitorForExternal({
			onDragStart(args) {
				ordered.push(`start:external`);
				types.push(...args.source.types);
			},
			onDrop(args) {
				ordered.push(`drop:external`);
			},
		}),
	);

	// First enter event is into A
	nativeDrag.startExternal({
		items: [{ data: 'Hi there', type: 'plain/text' }],
		target: A,
	});

	expect(types).toEqual(['plain/text']);
	expect(ordered).toEqual(['start:external']);
	ordered.length = 0;

	userEvent.leaveWindow();

	expect(ordered).toEqual(['drop:external']);

	cleanup();
});
