// This file has been copied from `react-beautiful-dnd`
// <https://github.com/atlassian/react-beautiful-dnd/blob/v13.1.1/src/dev-warning.js>

function noop() {}

type Log = (type: 'error' | 'warn', message: string) => void;

export const log: Log =
  // no warnings in production
  process.env.NODE_ENV === 'production'
    ? noop
    : /**
       * An Immediately Invoked Function Expression (IIFE) is used to enable
       * dead code elimination while also only having to evaluate these
       * declarations once.
       */
      (() => {
        const isDisabledFlag: string =
          '__react-beautiful-dnd-disable-dev-warnings';

        // not replacing newlines (which \s does)
        const spacesAndTabs: RegExp = /[ \t]{2,}/g;
        const lineStartWithSpaces: RegExp = /^[ \t]*/gm;

        // using .trim() to clear the any newlines before the first text and after last text
        const clean = (value: string): string =>
          value
            .replace(spacesAndTabs, ' ')
            .replace(lineStartWithSpaces, '')
            .trim();

        const getDevMessage = (message: string): string =>
          clean(`
          %creact-beautiful-dnd
          
          %c${clean(message)}
          
          %c👷‍ This is a development only message. It will be removed in production builds.
        `);

        const getFormattedMessage = (message: string): string[] => [
          getDevMessage(message),
          // title (green400)
          'color: #00C584; font-size: 1.2em; font-weight: bold;',
          // message
          'line-height: 1.5',
          // footer (purple300)
          'color: #723874;',
        ];

        return function log(type: 'error' | 'warn', message: string) {
          // manual opt out of warnings
          // @ts-expect-error
          if (typeof window !== 'undefined' && window[isDisabledFlag]) {
            return;
          }

          // eslint-disable-next-line no-console
          console[type](...getFormattedMessage(message));
        };
      })();

export const warning = log.bind(null, 'warn');
export const error = log.bind(null, 'error');
