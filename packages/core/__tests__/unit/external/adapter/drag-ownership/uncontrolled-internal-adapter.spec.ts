import { skipAutoA11yFile } from '@atlassian/a11y-jest-testing';

import { combine } from '../../../../../src/entry-point/combine';
import { draggable } from '../../../../../src/entry-point/element/adapter';
import { monitorForExternal } from '../../../../../src/entry-point/external/adapter';
import { appendToBody, getBubbleOrderedTree, getElements, nativeDrag, reset } from '../../../_util';

// This file exposes one or more accessibility violations. Testing is currently skipped but violations need to
// be fixed in a timely manner or result in escalation. Once all violations have been fixed, you can remove
// the next line and associated import. For more information, see go/afm-a11y-tooling:jest
skipAutoA11yFile();

afterEach(reset);

test('uncontrolled internal native drags should not trigger the external adapter', () => {
	const [draggableEl, A] = getBubbleOrderedTree();
	const [link] = getElements('a');
	link.href = '#hello';
	const ordered: string[] = [];

	A.appendChild(link);
	const cleanup = combine(
		appendToBody(A),
		draggable({
			element: draggableEl,
			onDragStart: () => ordered.push('draggable:start'),
		}),
		monitorForExternal({
			onDragStart: () => ordered.push('monitor(external):start'),
		}),
	);

	nativeDrag.startInternal({
		target: link,
		items: [{ data: 'Plain text', type: 'text/plain' }],
	});

	expect(ordered).toEqual([]);

	cleanup();
});
