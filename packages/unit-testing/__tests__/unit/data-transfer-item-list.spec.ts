import invariant from 'tiny-invariant';

test('add(data, format) should add a string item', (done) => {
	const list = new DataTransferItemList();

	list.add('Hello world', 'text/plain');

	const item: DataTransferItem = list[0];
	expect(item.kind).toBe('string');
	expect(item.type).toBe('text/plain');
	item.getAsString((value) => {
		expect(value).toBe('Hello world');
		done();
	});
});

test('add(data, format) should throw a DOMException if there is already an added type', (done) => {
	const list = new DataTransferItemList();

	list.add('First', 'text/plain');

	const item: DataTransferItem = list[0];
	expect(item.kind).toBe('string');
	expect(item.type).toBe('text/plain');

	expect(() => list.add('Second', 'text/plain')).toThrow(DOMException);

	item.getAsString((value) => {
		expect(value).toBe('First');
		done();
	});
});

test('add(data, format) format is converted to lower case', (done) => {
	const list = new DataTransferItemList();

	list.add('First', 'My-Type');

	const item: DataTransferItem = list[0];
	expect(item.kind).toBe('string');
	expect(item.type).toBe('my-type');

	item.getAsString((value) => {
		expect(value).toBe('First');
		done();
	});
});

test('add(data, format) should return the item', (done) => {
	const list = new DataTransferItemList();

	const item: DataTransferItem | null = list.add('First', 'My-Type');
	invariant(item);

	expect(item.kind).toBe('string');
	expect(item.type).toBe('my-type');

	item.getAsString((value) => {
		expect(value).toBe('First');
		done();
	});
});

test('add(File) should add a file item', () => {
	const list = new DataTransferItemList();
	const file = new File(['🕺💃'], 'dance.png', {
		type: 'image/png',
	});

	list.add(file);
	const item: DataTransferItem = list[0];
	const result = item.getAsFile();

	expect(item.kind).toBe('file');
	expect(item.type).toBe('image/png');
	expect(result).toBe(file);
});

test('add(File) can add multiple files', () => {
	const list = new DataTransferItemList();
	const file1 = new File(['🕺💃'], '1.png', {
		type: 'image/png',
	});
	const file2 = new File(['🕺💃'], '2.png', {
		type: 'image/png',
	});
	list.add(file1);
	list.add(file2);

	expect(list.length).toBe(2);

	expect(list[0].getAsFile()).toBe(file1);
	expect(list[1].getAsFile()).toBe(file2);
});

test('add(File) should return the item', () => {
	const list = new DataTransferItemList();
	const file = new File(['🕺💃'], 'dance.png', {
		type: 'image/png',
	});

	const item: DataTransferItem | null = list.add(file);
	invariant(item);

	expect(item.kind).toBe('file');
	expect(item.type).toBe('image/png');
	expect(item.getAsFile()).toBe(file);
});

test('A DataTransferItemList should support .length and index lookup', () => {
	const list = new DataTransferItemList();

	list.add('Hello world', 'text/plain');
	list.add('<h1>hi</h1>', 'text/html');

	expect(list.length).toBe(2);
	expect(list[0]?.type).toBe('text/plain');
	expect(list[1]?.type).toBe('text/html');
});

test('clear() should remove all items (including files)', () => {
	const list = new DataTransferItemList();

	list.add('Hello world', 'text/plain');
	list.add(
		new File(['🕺💃'], 'dance.png', {
			type: 'image/png',
		}),
	);

	expect(list.length).toBe(2);

	list.clear();
	expect(list.length).toBe(0);
});

test('remove(index) should remove an item at an index', (done) => {
	const list = new DataTransferItemList();

	list.add('Hello world', 'text/plain');
	list.add(
		new File(['🕺💃'], 'dance.png', {
			type: 'image/png',
		}),
	);

	expect(list.length).toBe(2);

	list.remove(1);

	expect(list.length).toBe(1);
	const item: DataTransferItem = list[0];
	expect(item.kind).toBe('string');
	expect(item.type).toBe('text/plain');
	item.getAsString((value) => {
		expect(value).toBe('Hello world');
		done();
	});
});

test('remove(index) should do nothing for out of bound indexes', () => {
	const list = new DataTransferItemList();

	list.add('Hello world', 'text/plain');
	list.add(
		new File(['🕺💃'], 'dance.png', {
			type: 'image/png',
		}),
	);

	expect(list.length).toBe(2);

	list.remove(2);

	expect(list.length).toBe(2);
});
