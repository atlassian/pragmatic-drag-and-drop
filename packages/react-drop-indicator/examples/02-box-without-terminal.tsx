import React from 'react';

import { DropIndicator } from '../src/box-without-terminal';
import type { Edge } from '../src/types';

import Card from './internal/card';
import Layout from './internal/layout';

const edges: Edge[] = ['bottom', 'left', 'right', 'top'];

export default function BoxWithoutTerminalExample() {
	return (
		<div>
			<Layout testId="layout--without-gap">
				{edges.map((edge) => (
					<Card key={edge} edge={edge} DropIndicator={DropIndicator}>
						{edge}
					</Card>
				))}
			</Layout>
			<Layout testId="layout--with-gap">
				{edges.map((edge) => (
					<Card key={edge} edge={edge} gap="32px" DropIndicator={DropIndicator}>
						{edge}
					</Card>
				))}
			</Layout>
		</div>
	);
}
