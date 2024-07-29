test('types() should return a list of item types', () => {
	const dataTransfer = new DataTransfer();
	dataTransfer.items.add('Hello world', 'text/plain');
	dataTransfer.items.add('<h1>hello</h1>', 'text/html');

	expect(dataTransfer.items.length).toBe(2);

	expect(Array.from(dataTransfer.types).sort()).toEqual(['text/plain', 'text/html'].sort());
});

test('types() should return a unique type list', () => {
	const dataTransfer = new DataTransfer();
	dataTransfer.items.add('Hello world', 'text/plain');
	dataTransfer.items.add(
		new File(['🕺💃'], '1.png', {
			type: 'image/png',
		}),
	);
	dataTransfer.items.add(
		new File(['🕺💃'], '2.png', {
			type: 'image/jpg',
		}),
	);

	// 2 files, 1 plain text
	expect(dataTransfer.items.length).toBe(3);
	expect(dataTransfer.types.length).toBe(2);

	expect(Array.from(dataTransfer.types).sort()).toEqual(['text/plain', 'Files'].sort());
});

test('clearData(format) should remove any matching items (single item match)', (done) => {
	const dataTransfer = new DataTransfer();
	dataTransfer.items.add('Hello world', 'text/plain');
	dataTransfer.items.add('<h1>hello</h1>', 'text/html');

	expect(dataTransfer.items.length).toBe(2);

	dataTransfer.clearData('text/plain');

	expect(dataTransfer.items.length).toBe(1);
	expect(Array.from(dataTransfer.types).sort()).toEqual(['text/html']);
	const item: DataTransferItem = dataTransfer.items[0];
	expect(item.kind).toBe('string');
	expect(item.type).toBe('text/html');
	item.getAsString((value) => {
		expect(value).toBe('<h1>hello</h1>');
		done();
	});
});

test('clearData(format) should remove nothing if there is no matching item', () => {
	const dataTransfer = new DataTransfer();
	dataTransfer.items.add('<h1>hello</h1>', 'text/html');

	expect(dataTransfer.items.length).toBe(1);

	dataTransfer.clearData('text/plain');

	expect(dataTransfer.items.length).toBe(1);
	expect(Array.from(dataTransfer.types).sort()).toEqual(['text/html']);
});

test('clearData("Files") should not remove files', () => {
	const dataTransfer = new DataTransfer();
	const file = new File(['🕺💃'], '1.png', {
		type: 'image/png',
	});
	dataTransfer.items.add(file);

	expect(dataTransfer.items.length).toBe(1);

	dataTransfer.clearData();

	expect(dataTransfer.items.length).toBe(1);
	expect(Array.from(dataTransfer.types).sort()).toEqual(['Files']);
});

test('clearData() should remove all non-file items', () => {
	const dataTransfer = new DataTransfer();
	const file = new File(['🕺💃'], '1.png', {
		type: 'image/png',
	});
	dataTransfer.items.add('Hello world', 'text/plain');
	dataTransfer.items.add(file);
	dataTransfer.items.add('<h1>hello</h1>', 'text/html');

	expect(dataTransfer.items.length).toBe(3);

	dataTransfer.clearData();

	expect(dataTransfer.items.length).toBe(1);
	expect(Array.from(dataTransfer.types).sort()).toEqual(['Files']);

	const item: DataTransferItem = dataTransfer.items[0];
	const result = item.getAsFile();
	expect(item.kind).toBe('file');
	expect(item.type).toBe('image/png');
	expect(result).toBe(file);
});

test('clearData("text") should clear a "text/plain" item', () => {
	const dataTransfer = new DataTransfer();
	dataTransfer.items.add('Hello world', 'text/plain');
	dataTransfer.items.add('<h1>hello</h1>', 'text/html');

	dataTransfer.clearData('text');

	expect(dataTransfer.items.length).toBe(1);
	expect(Array.from(dataTransfer.types).sort()).toEqual(['text/html']);
});

test('clearData("url") should clear a "text/uri-list" item', () => {
	const dataTransfer = new DataTransfer();
	dataTransfer.items.add('https://hello-world', 'text/uri-list');
	dataTransfer.items.add('<h1>hello</h1>', 'text/html');

	dataTransfer.clearData('url');

	expect(dataTransfer.items.length).toBe(1);
	expect(Array.from(dataTransfer.types).sort()).toEqual(['text/html']);
});

test('clearData(format) should convert the format to lowercase', () => {
	const dataTransfer = new DataTransfer();
	dataTransfer.items.add('Hello world', 'My-Type');

	expect(dataTransfer.items[0]?.type).toBe('my-type');

	dataTransfer.clearData('My-Type');

	expect(dataTransfer.items.length).toBe(0);
});

test('getData(format) should return an item of matching format', () => {
	const dataTransfer = new DataTransfer();
	dataTransfer.items.add('Hello world', 'text/plain');
	dataTransfer.items.add('<h1>hello</h1>', 'text/html');

	expect(dataTransfer.getData('text/plain')).toEqual('Hello world');
	expect(dataTransfer.getData('text/html')).toEqual('<h1>hello</h1>');
});

test('getData(format) should return "" when there is no match', () => {
	const dataTransfer = new DataTransfer();
	dataTransfer.items.add('<h1>hello</h1>', 'text/html');

	expect(dataTransfer.getData('text/plain')).toEqual('');
});

test('getData("Files") should return "" even if there are file items', () => {
	const dataTransfer = new DataTransfer();
	const file = new File(['🕺💃'], '1.png', {
		type: 'image/png',
	});
	dataTransfer.items.add(file);

	expect(dataTransfer.items.length).toBe(1);
	expect(Array.from(dataTransfer.types).sort()).toEqual(['Files']);

	expect(dataTransfer.getData('Files')).toEqual('');
});

test('getData("text") should return a "text/plain" entry', () => {
	const dataTransfer = new DataTransfer();
	dataTransfer.items.add('Hi', 'text/plain');

	expect(dataTransfer.getData('text')).toEqual('Hi');
});

test('getData("url") should return a "text/uri-list" entry', () => {
	const dataTransfer = new DataTransfer();
	dataTransfer.items.add('https://atlassian.design/', 'text/uri-list');

	expect(dataTransfer.getData('url')).toEqual('https://atlassian.design/');
});

test('getData("url") should only return the first url', () => {
	const dataTransfer = new DataTransfer();
	dataTransfer.items.add(
		'#first\r\nhttps://atlassian.design/\r\n#second\r\nhttps://www.atlassian.com/\r\n#third',
		'text/uri-list',
	);

	expect(dataTransfer.getData('url')).toEqual('https://atlassian.design/');
});

test('getData("text") should return all urls (if it contained urls)', () => {
	const dataTransfer = new DataTransfer();
	const text =
		'#first\r\nhttps://atlassian.design/\r\n#second\r\nhttps://www.atlassian.com/\r\n#third';
	// adding this as text data even though it's url data
	dataTransfer.items.add(text, 'text/plain');

	expect(dataTransfer.getData('text')).toEqual(text);
});

test('getData(format) should convert the format to lowercase for lookup', () => {
	const dataTransfer = new DataTransfer();
	dataTransfer.items.add('Hello world', 'My-Type');

	// stored as a lowercase type
	expect(dataTransfer.items[0]?.type).toBe('my-type');

	expect(dataTransfer.getData('My-Type')).toEqual('Hello world');
});

test('setData(format, data) should add a relevant item', (done) => {
	const dataTransfer = new DataTransfer();
	dataTransfer.setData('text/plain', 'Hello world');

	expect(dataTransfer.items.length).toBe(1);
	const item = dataTransfer.items[0];
	expect(item.kind).toBe('string');
	expect(item.type).toBe('text/plain');
	item.getAsString((value) => {
		expect(value).toBe('Hello world');
		done();
	});
});

test('setData(format, data) should convert the format to lower case', (done) => {
	const dataTransfer = new DataTransfer();
	dataTransfer.setData('My-Type', 'Hello world');

	expect(dataTransfer.items.length).toBe(1);
	const item = dataTransfer.items[0];
	expect(item.kind).toBe('string');
	expect(item.type).toBe('my-type');
	item.getAsString((value) => {
		expect(value).toBe('Hello world');
		done();
	});
});

test('setData("text", data) should convert the format to lower "text/plain"', (done) => {
	const dataTransfer = new DataTransfer();
	dataTransfer.setData('text', 'Hello world');

	expect(dataTransfer.items.length).toBe(1);
	const item = dataTransfer.items[0];
	expect(item.kind).toBe('string');
	expect(item.type).toBe('text/plain');
	item.getAsString((value) => {
		expect(value).toBe('Hello world');
		done();
	});
});

test('setData("url", data) should convert the format to lower "text/uri-list"', (done) => {
	const dataTransfer = new DataTransfer();
	dataTransfer.setData('text/uri-list', 'https://atlassian.design/');

	expect(dataTransfer.items.length).toBe(1);
	const item = dataTransfer.items[0];
	expect(item.kind).toBe('string');
	expect(item.type).toBe('text/uri-list');
	item.getAsString((value) => {
		expect(value).toBe('https://atlassian.design/');
		done();
	});
});
