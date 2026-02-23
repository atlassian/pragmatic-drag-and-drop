export function setup(): void {
	HTMLElement.prototype.scrollIntoView = jest.fn();
}
