import React from 'react';

import { BacklogContainer } from './container';
import List from './list';

export default function BacklogPrototype(): React.JSX.Element {
	return (
		<BacklogContainer>
			<List />
		</BacklogContainer>
	);
}
