import '@component-name@/loader';
import * as Context from 'ojs/ojcontext';
import * as ko from 'knockout';
import 'ojs/ojknockout';

declare const expect: Chai.ExpectStatic;

describe('Knockout sample test', () => {
  const markup = `<@component-name@></@component-name@>`;
  describe('sample test', () => {
    it('Markup should not be null', () => {
      expect(markup).not.null;
    });
  });
});