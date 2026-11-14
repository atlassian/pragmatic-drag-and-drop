import React, { createRef } from 'react';

import { render, screen } from '@testing-library/react';

import type { Instruction as TreeInstruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';
import { token } from '@atlaskit/tokens';

import { DropIndicator as Border } from '../../src/border';
import { DropIndicator as Box } from '../../src/box';
import { GroupDropIndicator } from '../../src/group';
import { DropIndicator as ListItem } from '../../src/list-item';
import { DropIndicator as TreeItem } from '../../src/tree-item';

function stroke(container: HTMLElement): string {
	return (container.querySelector('div') as HTMLElement).style.getPropertyValue('--stroke-color');
}

// Assert token roles without coupling to Compiled's minified fallback values.
function expectTokenStyle(element: HTMLElement, property: string, tokenValue: string): void {
	const selectors = Array.from(element.classList, (name) => `.${name}`);
	const values = Array.from(document.styleSheets).flatMap((sheet) =>
		Array.from(sheet.cssRules)
			.filter((rule): rule is CSSStyleRule => 'selectorText' in rule)
			.filter((rule) => selectors.includes(rule.selectorText))
			.map((rule) => rule.style.getPropertyValue(property)),
	);
	expect(
		values.some((value) => value === tokenValue || value.startsWith(`${tokenValue.slice(0, -1)},`)),
	).toBe(true);
}

describe.each([undefined, 'standard', 'dedicated'] as const)('colors=%s', (colors) => {
	const defaultColor =
		colors === 'dedicated' ? token('color.border.dropindicator') : token('color.border.selected');
	const warningColor =
		colors === 'dedicated'
			? token('color.border.dropindicator.warning')
			: token('color.border.warning');

	it.each([
		['box', <Box edge="top" colors={colors} />, defaultColor],
		['warning box', <Box edge="top" appearance="warning" colors={colors} />, warningColor],
		['border', <Border colors={colors} />, defaultColor],
		['warning border', <Border appearance="warning" colors={colors} />, warningColor],
	] as const)('uses the expected stroke for %s', (_name, indicator, expected) => {
		const { container } = render(indicator);
		expect(stroke(container)).toBe(expected);
	});

	describe.each(['vertical', 'horizontal'] as const)('list axis=%s', (axis) => {
		it.each(['reorder-before', 'reorder-after', 'combine'] as const)(
			'preserves blocked feedback for %s',
			(operation) => {
				const { container, rerender } = render(
					<ListItem colors={colors} instruction={{ operation, axis, blocked: false }} />,
				);
				expect(stroke(container)).toBe(defaultColor);
				rerender(<ListItem colors={colors} instruction={{ operation, axis, blocked: true }} />);
				expect(stroke(container)).toBe(warningColor);
			},
		);
	});

	it.each<Exclude<TreeInstruction, { type: 'instruction-blocked' }>>([
		{ type: 'reorder-above', currentLevel: 1, indentPerLevel: 16 },
		{ type: 'reorder-below', currentLevel: 1, indentPerLevel: 16 },
		{ type: 'make-child', currentLevel: 1, indentPerLevel: 16 },
		{ type: 'reparent', currentLevel: 2, desiredLevel: 1, indentPerLevel: 16 },
	])('preserves blocked feedback for $type', (instruction) => {
		const { container, rerender } = render(<TreeItem colors={colors} instruction={instruction} />);
		expect(stroke(container)).toBe(defaultColor);
		rerender(
			<TreeItem
				colors={colors}
				instruction={{ type: 'instruction-blocked', desired: instruction }}
			/>,
		);
		expect(stroke(container)).toBe(warningColor);
	});

	it('applies group colors only while active and preserves the forwarded ref', () => {
		const ref = createRef<HTMLDivElement>();
		const { rerender } = render(
			<GroupDropIndicator colors={colors} isActive ref={ref} testId="group">
				Content
			</GroupDropIndicator>,
		);
		const group = screen.getByTestId('group');
		expect(ref.current).toBe(group);
		expectTokenStyle(group, 'outline-color', defaultColor);
		expectTokenStyle(
			group,
			'background-color',
			colors === 'dedicated'
				? token('color.background.droptarget')
				: token('color.background.information'),
		);
		rerender(
			<GroupDropIndicator colors={colors} isActive={false} ref={ref} testId="group">
				Content
			</GroupDropIndicator>,
		);
		expect(group.classList).toHaveLength(0);
		expect(ref.current).toBe(group);
	});
});

it('can switch color schemes without changing box geometry', () => {
	const { container, rerender } = render(
		<Box edge="left" gap="8px" indent="16px" type="terminal-no-bleed" />,
	);
	const indicator = container.querySelector('div') as HTMLElement;
	const classes = indicator.className;
	const geometry = Array.from(indicator.style)
		.filter((name) => name !== '--stroke-color')
		.map((name) => [name, indicator.style.getPropertyValue(name)]);

	rerender(<Box edge="left" gap="8px" indent="16px" type="terminal-no-bleed" colors="dedicated" />);
	expect(container.querySelector('div')).toBe(indicator);
	expect(stroke(container)).toBe(token('color.border.dropindicator'));
	expect(indicator.className).toBe(classes);
	for (const [name, value] of geometry) {
		expect(indicator.style.getPropertyValue(name)).toBe(value);
	}

	rerender(<Box edge="left" gap="8px" indent="16px" type="terminal-no-bleed" />);
	expect(stroke(container)).toBe(token('color.border.selected'));
});

it('can render both schemes together', () => {
	const { container } = render(
		<>
			<Box edge="top" />
			<Box edge="bottom" colors="dedicated" />
		</>,
	);
	const [standard, dedicated] = Array.from(container.querySelectorAll('div'));
	expect(standard.style.getPropertyValue('--stroke-color')).toBe(token('color.border.selected'));
	expect(dedicated.style.getPropertyValue('--stroke-color')).toBe(
		token('color.border.dropindicator'),
	);
});

it('can switch group colors while active', () => {
	const { rerender } = render(
		<GroupDropIndicator isActive testId="group">
			Content
		</GroupDropIndicator>,
	);
	const group = screen.getByTestId('group');
	rerender(
		<GroupDropIndicator isActive colors="dedicated" testId="group">
			Content
		</GroupDropIndicator>,
	);
	expect(screen.getByTestId('group')).toBe(group);
	expectTokenStyle(group, 'outline-color', token('color.border.dropindicator'));
	expectTokenStyle(group, 'background-color', token('color.background.droptarget'));
});
