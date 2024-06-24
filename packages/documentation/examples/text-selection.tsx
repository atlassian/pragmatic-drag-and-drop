/** @jsx jsx */
import { useEffect } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { jsx } from '@emotion/react';
import { bindAll } from 'bind-event-listener';

import Button from '@atlaskit/button/new';
import { Stack } from '@atlaskit/primitives';

export default function TextSelection() {
	useEffect(() => {
		return bindAll(window, [
			{
				type: 'dragstart',
				listener(event) {
					const data = {
						target: event.target,
						'text/plain': event.dataTransfer?.getData('text/plain'),
						'text/html': event.dataTransfer?.getData('text/html'),
						selection: window.getSelection(),
					};
					console.log(event.type, data);

					setTimeout(() => {
						console.log('later', data);
					});
				},
			},
		]);
	}, []);
	return (
		<Stack space="space.100">
			<p>This is a paragraph with text</p>
			<p>This is another paragraph with text</p>
			<p>
				Another paragraph{' '}
				<em>
					with some{' '}
					<a href="#foo">
						Link <strong>text</strong>
					</a>
				</em>
			</p>
			<p>
				Another with a <Button>Hello</Button> inside
			</p>
		</Stack>
	);
}
