import stylelint from 'stylelint';

import { getDragHandleRuleString } from '../../../../../../src/drag-drop-context/hooks/use-style-marshal';

it('should generate valid styles', () => {
  return stylelint
    .lint({
      code: getDragHandleRuleString('0'),
      config: {
        // just using the recommended config as it only checks for errors and not formatting
        extends: ['stylelint-config-recommended'],
        // basic semi colon rules
        rules: {
          'no-extra-semicolons': true,
          'declaration-block-semicolon-space-after': 'always-single-line',
        },
      },
    })
    .then(result => {
      expect(result.errored).toBe(false);
      // asserting that some CSS was actually generated!
      // eslint-disable-next-line no-underscore-dangle
      // @ts-expect-error
      expect(result.results[0]._postcssResult.css.length).toBeGreaterThan(1);
    });
});
