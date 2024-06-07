export type Epic = 'forms' | 'accounts' | 'billing';

export type CardData = {
	summary: string;
	epic: Epic;
	key: string;
};

export type ColumnType = {
	title: string;
	columnId: string;
	items: CardData[];
};
export type ColumnMap = { [columnId: string]: ColumnType };

export function getInitialData() {
	const columnMap: ColumnMap = {
		todo: {
			title: 'To do',
			columnId: 'todo',
			items: [
				{
					summary: 'Billing system integration — frontend',
					epic: 'forms',
					key: 'NUC-339',
				},
				{
					summary: 'Onboard workout options (OWO)',
					epic: 'accounts',
					key: 'NUC-360',
				},
				{
					summary: 'Optimize experience for mobile web',
					epic: 'billing',
					key: 'NUC-344',
				},
			],
		},
		'in-progress': {
			title: 'In progress',
			columnId: 'in-progress',
			items: [
				{
					summary: 'Revise and streamline booking flow',
					epic: 'forms',
					key: 'NUC-343',
				},
				{
					summary: 'Onboard workout options (OWO)',
					epic: 'accounts',
					key: 'NUC-362',
				},
			],
		},
		done: {
			title: 'Done',
			columnId: 'done',
			items: [
				{
					summary: 'Optimize experience for mobile web',
					epic: 'billing',
					key: 'NUC-351',
				},
			],
		},
	};

	const orderedColumnIds = ['todo', 'in-progress', 'done'];

	return {
		columnMap,
		orderedColumnIds,
		lastOperation: null,
	};
}
