/**
 * @jsxRuntime classic
 * @jsx jsx
 */

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { css, jsx } from '@emotion/react';

import { token } from '@atlaskit/tokens';

const containerStyles = css({
	margin: `${token('space.400')}px -${token('space.200')}px 0`,
	padding: `${token('space.100')} ${token('space.200')}px`,
	borderRadius: token('space.100'),
});

const tableStyles = css({
	width: '100%',
	borderCollapse: 'collapse',
});

const tbodyStyles = css({
	borderBottom: 'none',
});

const tableHeaderStyles = css({
	padding: `${token('space.050')} ${token('space.200')} ${token('space.050')} ${token('space.100')}`,
	textAlign: 'left',
	verticalAlign: 'top',
	whiteSpace: 'nowrap',
});

const tableCellStyles = css({
	width: '100%',
	padding: `${token('space.050')} 0 ${token('space.050')} ${token('space.100')}`,
});

const headerStyles = css({
	margin: `0 0 ${token('space.050')} 0`,
	paddingBottom: token('space.100'),
	borderBottom: `${token('border.width')} solid ${token('color.border')}`,
	fontSize: '1em',
	fontWeight: token('font.weight.regular'),
	lineHeight: '1.4',
});

const codeStyles = css({
	display: 'inline-block',
	backgroundColor: token('color.background.neutral'),
	borderRadius: token('radius.small'),
	color: `${token('color.text')}`,
	fontSize: '1em',
	lineHeight: '20px',
	paddingBlock: token('space.050'),
	paddingInline: token('space.100'),
});

const typeStyles = css({
	background: token('color.background.neutral'),
	color: token('color.text.subtle'),
	borderRadius: token('radius.small'),
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
	color: `${token('color.text.danger')}`,
});

const deprecatedLabelStyles = css({
	marginLeft: '1em',
	color: `${token('color.text.disabled')}`,
});

const defaultValueStyles = css({
	color: `${token('color.text.subtle')}`,
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
						{/* eslint-disable-next-line @atlaskit/design-system/no-html-code */}
						<code css={codeStyles}>{propName}</code>
						{required && defaultValue === undefined && (
							// eslint-disable-next-line @atlaskit/design-system/no-html-code
							<code css={requiredLabelStyles}>required</code>
						)}
						{/* eslint-disable-next-line @atlaskit/design-system/no-html-code */}
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
								{/* eslint-disable-next-line @atlaskit/design-system/no-html-code */}
								<code css={defaultValueStyles}>{defaultValue}</code>
							</td>
						</tr>
					)}
					<tr>
						<th css={tableHeaderStyles}>Type</th>
						<td css={[tableCellStyles]}>
							<span>
								{/* eslint-disable-next-line @atlaskit/design-system/no-html-code */}
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
