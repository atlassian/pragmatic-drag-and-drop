// This file polyfills DragEvent for jsdom
// https://github.com/jsdom/jsdom/issues/2913
// This file is in JS rather than TS, as our jsdom setup files currently need to be in JS
// Good news: DragEvents are almost the same as MouseEvents

(() => {
	if (typeof window === 'undefined') {
		return;
	}

	// Polyfill not needed

	if (typeof window.DragEvent !== 'undefined') {
		return;
	}

	// Let's create what we need for DragEvent's!

	if (window.DataTransferItemList) {
		throw new Error(`Unexpected global found: "DataTransferItemList"`);
	}

	if (window.DataTransfer) {
		throw new Error(`Unexpected global found: "DataTransfer"`);
	}

	// Note: window.FileList will be created by jsdom

	// Using this so we can quickly look up an items
	// data without needing to go through the public async API
	// to get item values
	const fastItemValueLookup = Symbol('item-value');

	/**
	 * Note: this polyfill does not implement "read/write", "read-only" or "protected"
	 * permissions for `DataTransferItemList` or `DataTransfer`.
	 * Adding these permissions in make it impossible to set values like `.types` or `.items`
	 * in events other than `"dragstart"`, which we commonly want to be able to set in tests
	 *
	 * Examples:
	 *
	 * - You often want to add `.items` for a `"drop"` event (to test you can pull the `.items` out)
	 * but `.items` can only be set in `"dragstart"`.
	 *
	 * - Similarly, you often want to access `.types` in drag events,
	 * but they can only be set in `"dragstart"`
	 */

	/**
	 * Cheating an making `DataTransferItemList` extend an `Array` so we can get:
	 * - `list.length` for free (could create a getter)
	 * - indexed lookup (`list[0]`) for free (otherwise need a Proxy)
	 */
	window.DataTransferItemList = class DataTransferItemList extends Array {
		/**
		 * https://html.spec.whatwg.org/multipage/dnd.html#dom-datatransferitemlist-add
		 */
		add(stringValueOrFile: string | File, stringMimeType?: string): DataTransferItem {
			if (stringValueOrFile instanceof File) {
				const item: DataTransferItem = {
					kind: 'file',
					// The type of file being dragged (eg "image/jpeg")
					type: stringValueOrFile.type,
					getAsFile: () => {
						return stringValueOrFile;
					},
					getAsString: (/* callback */) => {
						// callback will never be resolved for files
					},
					webkitGetAsEntry() {
						throw new Error('webkitGetAsEntry() not implemented');
					},
					// This allows us to lookup items synchronously with `dataTransfer.getData()`
					// @ts-expect-error: custom property
					[fastItemValueLookup]: stringValueOrFile,
				};
				this.push(item);
				return item;
			}
			if (
				typeof stringValueOrFile === 'string' &&
				// TODO: what if first argument is a string, and second is not provided?
				typeof stringMimeType === 'string'
			) {
				// `type` gets converted to lowercase according to the spec
				const type = stringMimeType.toLocaleLowerCase();
				// Throws if adding data to a type that already has data
				const exists = this.some((item) => item.kind === 'string' && item.type === type);
				if (exists) {
					throw new DOMException('NotSupportedError');
				}

				const item: DataTransferItem = {
					kind: 'string',
					type,
					getAsFile: () => {
						// this will be `null` for non-files
						return null;
					},
					getAsString: (callback) => {
						setTimeout(() => {
							callback?.(stringValueOrFile);
						});
					},
					webkitGetAsEntry() {
						throw new Error('webkitGetAsEntry() not implemented');
					},
					// This allows us to lookup items synchronously with `dataTransfer.getData()`
					// @ts-expect-error: custom property
					[fastItemValueLookup]: stringValueOrFile,
				};
				this.push(item);
				return item;
			}
			throw new Error(
				'Unexpected arguments. Expected: .add(file: File) or .add(data: string, type: string)',
			);
		}

		/**
		 * Removes an item at a given index
		 */
		remove(index: number): void {
			this.splice(index, 1);
		}

		/**
		 * Removes all items
		 */
		clear(): void {
			this.length = 0;
		}
	};

	/**
	 * Get the full media type, adjusting for shorthand lookup values.
	 * https://html.spec.whatwg.org/multipage/dnd.html#dom-datatransfer-getdata
	 */
	function getFullFormat(formatOrShorthand: string): {
		format: string;
		convertToURL: boolean;
	} {
		const lower = formatOrShorthand.toLocaleLowerCase();

		// shorthands

		if (lower === 'text') {
			return { format: 'text/plain', convertToURL: false };
		}
		// From spec:
		// If format equals "url", change it to "text/uri-list" and set convert-to-URL to true.
		if (lower === 'url') {
			return { format: 'text/uri-list', convertToURL: true };
		}
		return { format: lower, convertToURL: false };
	}

	/**
	 * https://html.spec.whatwg.org/multipage/dnd.html#the-datatransfer-interface
	 */
	window.DataTransfer = class {
		dropEffect: DataTransfer['dropEffect'];
		effectAllowed: DataTransfer['effectAllowed'];
		items: DataTransferItemList;

		constructor() {
			// From spec:
			// > Set the dropEffect and effectAllowed to "none".
			this.dropEffect = 'none';

			// Not implementing mode restrictions so this can be set in testing
			// for any event
			this.effectAllowed = 'none';

			// DataTransferItemList() is usually a hidden constructor
			this.items = new DataTransferItemList();
		}

		/**
		 * Get unique types of `.items`
		 * https://html.spec.whatwg.org/multipage/dnd.html#concept-datatransfer-types
		 */
		get types(): string[] {
			const all = Array.from(this.items).map((item) => {
				if (item.kind === 'string') {
					return item.type;
				}
				return 'Files';
			});
			// it is possible to have multiple 'Files' entries
			// so we need to strip them out
			const unique = Array.from(new Set(all));
			// sorting for consistency
			return unique.sort();
		}

		/**
		 * Get files being dragged
		 */
		get files(): FileList {
			/**
			 * JSDOM polyfills `FileList`, but we cannot create a `FileList` directly
			 * with `new FileList()` as it is an illegal constructor.
			 * Instead, creating an object that satisfies the `FileList` type
			 */

			const files: File[] = Array.from(this.items)
				.filter((item) => item.kind === 'file')
				.map((item) => item.getAsFile())
				.filter((item): item is File => item !== null);

			const list: FileList = {
				// will spread out to be { [index]: file }
				...files,
				length: files.length,
				item: (index: number) => list[index] ?? null,
				[Symbol.iterator]: function* generator() {
					for (let i = 0; i < list.length; i++) {
						yield list[i];
					}
				},
			};

			return list;
		}

		/**
		 * Clears string items. Note: cannot be used to clear files
		 * https://html.spec.whatwg.org/multipage/dnd.html#dom-datatransfer-cleardata
		 */
		clearData(format?: string): void {
			if (format) {
				const actualFormat = getFullFormat(format).format;
				const index = Array.from(this.items).findIndex((item) => {
					// Note: can never clear files with `clearData`
					return item.type === actualFormat;
				});
				if (index !== -1) {
					this.items.remove(index);
				}
				return;
			}

			// According to the spec, `.clearData()` does not remove files.
			// However, in Chrome it does remove files...

			// Looping backwards so that we can safely remove
			// items without messing up indexes
			for (let i = this.items.length - 1; i >= 0; i--) {
				const item = this.items[i];
				if (item.kind === 'string') {
					this.items.remove(i);
				}
			}
		}

		/**
		 * This function is only used to get the value of string items
		 * https://html.spec.whatwg.org/multipage/dnd.html#dom-datatransfer-getdata
		 */
		getData(format: string): string {
			const result = getFullFormat(format);
			const match = Array.from(this.items).find(
				(item) => item.kind === 'string' && item.type === result.format,
			);
			if (!match) {
				return '';
			}

			// @ts-expect-error - cannot usually look up a value using a symbol
			const value: string = match[fastItemValueLookup];

			if (!result.convertToURL) {
				return value;
			}

			// From spec:
			// If convert-to-URL is true, then parse result as appropriate for text/uri-list data, and then set result to the first URL from the list, if any, or the empty string otherwise. [RFC2483]

			const urls = value
				// You can have multiple urls split by CR+LF (EOL)
				// - CR: Carriage Return '\r'
				// - LF: Line Feed '\n'
				// - EOL: End of Line '\r\n'
				.split('\r\n')
				// a uri-list can have comment lines starting with '#'
				// so we need to remove those
				.filter((piece) => !piece.startsWith('#'));

			return urls[0] ?? '';
		}

		/** This function is only used to set string items
		 *
		 * @see https://html.spec.whatwg.org/multipage/dnd.html#dom-datatransfer-setdata
		 */
		setData(format: string, data: string): void {
			const actualFormat = getFullFormat(format).format;

			// clear existing item with matching format
			this.clearData(actualFormat);

			this.items.add(data, actualFormat);
		}

		setDragImage() {
			// doesn't do anything for our polyfill
		}
	};

	window.DragEvent = class DragEvent extends MouseEvent {
		private _pageX: number;
		private _pageY: number;
		dataTransfer: DataTransfer;
		constructor(
			type: string,
			eventInitDict: DragEventInit & { pageX?: number; pageY?: number } = {},
		) {
			super(type, eventInitDict);
			// Use private fields to store the values
			this._pageX = eventInitDict.pageX ?? 0;
			this._pageY = eventInitDict.pageY ?? 0;
			this.dataTransfer = new DataTransfer();
			// Define getters and setters for pageX and pageY
			Object.defineProperty(this, 'pageX', {
				get: () => this._pageX,
				set: (value: number) => {
					this._pageX = value;
				},
				configurable: true,
				enumerable: true,
			});
			Object.defineProperty(this, 'pageY', {
				get: () => this._pageY,
				set: (value: number) => {
					this._pageY = value;
				},
				configurable: true,
				enumerable: true,
			});
		}

		get pageX() {
			return this._pageX;
		}
		get pageY() {
			return this._pageY;
		}
	};
})();
