import React from 'react';

import type { Edge } from '../src/types';

import Card from './internal/card';
import Layout from './internal/layout';

const edges: Edge[] = ['bottom', 'left', 'right', 'top'];

export default function ClosestEdgeExample() {
	return (
		<React.StrictMode>
			<div>
				<Layout testId="layout--without-gap">
					{edges.map((edge) => (
						<Card key={edge} edge={edge}>
							{edge}
						</Card>
					))}
				</Layout>
				<Layout testId="layout--with-gap">
					{edges.map((edge) => (
						<Card key={edge} edge={edge} gap="32px">
							{edge}
						</Card>
					))}
				</Layout>
			</div>
		</React.StrictMode>
	);
}
