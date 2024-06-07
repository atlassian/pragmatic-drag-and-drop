import React, { type ReactNode } from 'react';

type PatternTableProps = {
	image: ReactNode;
	description: string;
};

const PatternTable = ({ image, description }: PatternTableProps) => {
	return (
		<table>
			<tbody>
				<tr>
					<th>Image</th>
					<td>{image}</td>
				</tr>
				<tr>
					<th>Description</th>
					<td>{description}</td>
				</tr>
			</tbody>
		</table>
	);
};

export default PatternTable;
