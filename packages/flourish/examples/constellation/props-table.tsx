/** @jsx jsx */

import { css, jsx } from '@emotion/react';

import { N20, N300, N500, N800, R500 } from '@atlaskit/theme/colors';
import { token } from '@atlaskit/tokens';

const containerStyles = css({
	margin: `${token('space.400', '24px')}px -${token('space.200', '16px')}px 0`,
	padding: `${token('space.100', '8px')} ${token('space.200', '16px')}px`,
	borderRadius: token('space.100', '8px'),
});

const tableStyles = css({
	width: '100%',
	borderCollapse: 'collapse',
});

const tbodyStyles = css({
	borderBottom: 'none',
});

const tableHeaderStyles = css({
	padding: `${token('space.050', '4px')} ${token('space.200', '16px')} ${token(
		'space.050',
		'4px',
	)} ${token('space.100', '8px')}`,
	textAlign: 'left',
	verticalAlign: 'top',
	whiteSpace: 'nowrap',
});

const tableCellStyles = css({
	width: '100%',
	padding: `${token('space.050', '4px')} 0 ${token('space.050', '4px')} ${token(
		'space.100',
		'8px',
	)}`,
});

const headerStyles = css({
	margin: `0 0 ${token('space.050', '4px')} 0`,
	paddingBottom: token('space.100', '8px'),
	borderBottom: `1px solid ${token('color.border', '#EBECF0')}`,
	fontSize: '1em',
	fontWeight: 'normal',
	lineHeight: '1.4',
});

const codeStyles = css({
	display: 'inline-block',
	backgroundColor: token('color.background.neutral', N20),
	borderRadius: token('border.radius.100', '3px'),
	color: `${token('color.text', N800)}`,
	fontSize: '1em',
	lineHeight: '20px',
	paddingBlock: token('space.050', '4px'),
	paddingInline: token('space.100', '8px'),
});

const typeStyles = css({
	background: token('color.background.neutral', N20),
	color: token('color.text.subtle', N300),
	borderRadius: token('border.radius.100', '3px'),
	display: 'inline-block',
	padding: '0 0.2em',
	whiteSpace: 'pre-wrap',
});

const captionStyles = css({
	textAlign: 'left',
	margin: '0',
	fontSize: '1em',
});

const requiredLabelStyles = css({
	marginLeft: '1em',
	color: `${token('color.text.danger', R500)}`,
});

const deprecatedLabelStyles = css({
	marginLeft: '1em',
	color: `${token('color.text.disabled', N500)}`,
});

const defaultValueStyles = css({
	color: `${token('color.text.subtle', N300)}`,
});

const FunctionPropsTable = ({
	propName,
	description,
	typing,
	required,
	defaultValue,
	deprecated,
}: {
	propName: string;
	description: string;
	typing: string;
	required?: boolean;
	defaultValue?: any;
	deprecated?: boolean;
}) => {
	return (
		<div css={containerStyles}>
			<table css={tableStyles}>
				<caption css={captionStyles}>
					<h3 css={headerStyles}>
						<code css={codeStyles}>{propName}</code>
						{required && defaultValue === undefined && (
							<code css={requiredLabelStyles}>required</code>
						)}
						{deprecated && <code css={deprecatedLabelStyles}>deprecated</code>}
					</h3>
				</caption>
				<tbody css={tbodyStyles}>
					<tr>
						<th css={tableHeaderStyles} scope="row">
							Description
						</th>
						<td css={tableCellStyles}>{description}</td>
					</tr>
					{defaultValue !== undefined && (
						<tr>
							<th css={tableHeaderStyles} scope="row">
								Default
							</th>
							<td css={tableCellStyles}>
								<code css={defaultValueStyles}>{defaultValue}</code>
							</td>
						</tr>
					)}
					<tr>
						<th css={tableHeaderStyles}>Type</th>
						<td css={[tableCellStyles]}>
							<span>
								<code css={typeStyles}>{typing}</code>
							</span>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
};

export default FunctionPropsTable;
