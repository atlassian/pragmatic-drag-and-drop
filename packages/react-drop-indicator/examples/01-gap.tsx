import React from 'react';

import Card from './internal/card';
import Layout from './internal/layout';

const gaps = ['32px', '16px', '8px', '4px', '0px'];

export default function ClosestEdgeExample() {
	return (
		<React.StrictMode>
			<Layout testId="layout">
				{gaps.map((gap) => (
					<Card key={gap} edge="right" gap={gap}>
						{gap}
					</Card>
				))}
			</Layout>
		</React.StrictMode>
	);
}
