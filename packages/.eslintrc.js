// Blocking accidental usage of
// - `document.elementFromPoint`
// - `document.elementsFromPoint`
// As we need to use `getElementFromPointWithoutHoneyPot` for this
module.exports = {
	rules: {
		'no-restricted-syntax': [
			'error',
			{
				message:
					'Please do not use `document.elementFromPoint()` directly as it is not aware of the honey pot. Use `getElementFromPointWithoutHoneyPot()`',
				selector:
					"CallExpression[callee.object.name='document'][callee.property.name='elementFromPoint']",
			},
			{
				message:
					'Please do not use `document.elementsFromPoint()` directly as it is not aware of the honey pot. Use `getElementFromPointWithoutHoneyPot()`',
				selector:
					"CallExpression[callee.object.name='document'][callee.property.name='elementsFromPoint']",
			},
		],
	},
};
