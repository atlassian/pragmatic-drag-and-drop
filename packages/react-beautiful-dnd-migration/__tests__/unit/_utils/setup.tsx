export function setup() {
  HTMLElement.prototype.scrollIntoView = jest.fn();
}
