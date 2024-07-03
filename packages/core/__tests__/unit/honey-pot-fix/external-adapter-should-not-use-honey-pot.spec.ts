import { fireEvent } from '@testing-library/dom';

import { monitorForExternal } from '../../../src/entry-point/external/adapter';
import { nativeDrag, reset } from '../_util';

import { findHoneyPot } from './_util';

afterEach(reset);

it('should not apply the honey pot fix for external drags', () => {
	const ordered: string[] = [];
	const cleanup = monitorForExternal({
		onDragStart: () => ordered.push('monitor:start'),
		onDropTargetChange: () => ordered.push('monitor:change'),
		onDrop: () => ordered.push('monitor:drop'),
	});

	nativeDrag.startExternal({ items: [{ type: 'text/plain', data: 'Hello' }] });
	expect(ordered).toEqual(['monitor:start']);
	ordered.length = 0;

	expect(findHoneyPot()).toBeFalsy();

	fireEvent.dragEnd(document.body);

	expect(ordered).toEqual(['monitor:drop']);

	expect(findHoneyPot()).toBe(null);

	cleanup();
});
