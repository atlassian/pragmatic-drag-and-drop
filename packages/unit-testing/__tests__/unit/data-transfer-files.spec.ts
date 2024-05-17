const dataTransfer = new DataTransfer();
const file1 = new File(['🕺💃'], '1.png', {
  type: 'image/png',
});
const file2 = new File(['🕺💃'], '2.png', {
  type: 'image/png',
});
dataTransfer.items.add(file1);
dataTransfer.items.add(file2);
// adding non file data to ensure it doesn't appear in .files
dataTransfer.setData('text/plain', 'Hello world');

test('dataTransfer.items and dataTransfer.files inclusion', () => {
  // three items, but two will be files
  expect(dataTransfer.items.length).toBe(3);
  expect(dataTransfer.files.length).toBe(2);
});

test('dataTransfer.files.length', () => {
  expect(dataTransfer.files.length).toBe(2);
});

test('dataTransfer.files[index] getters', () => {
  expect(dataTransfer.files[0]).toBe(file1);
  expect(dataTransfer.files[1]).toBe(file2);
  expect(dataTransfer.files[2]).toBe(undefined);
});

test('dataTransfer.files iteration (loops)', () => {
  let count = 0;
  for (const file of dataTransfer.files) {
    if (count === 0) {
      expect(file).toBe(file1);
    }
    if (count === 1) {
      expect(file).toBe(file2);
    }
    count++;
  }
  expect(count).toBe(2);
});

test('dataTransfer.files iteration (iterator)', () => {
  const iterator = dataTransfer.files[Symbol.iterator]();
  expect(iterator.next()).toEqual({ value: file1, done: false });
  expect(iterator.next()).toEqual({ value: file2, done: false });
  expect(iterator.next()).toEqual({ value: undefined, done: true });
});

test('dataTransfer.files.item(index)', () => {
  expect(dataTransfer.files.item(0)).toBe(file1);
  expect(dataTransfer.files.item(1)).toBe(file2);
  // .item return `null` when there is no item at the index
  expect(dataTransfer.files.item(2)).toBe(null);
});
