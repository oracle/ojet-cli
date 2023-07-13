import { h } from 'preact';
import { render } from '@testing-library/preact';
import { @camelcasecomponent-name@ } from '@component-name@/@component-name@';

describe('Test description', () => {
  test('Your test title', async () => {
    const content = render(
      <div data-oj-binding-provider='preact'>
        <@camelcasecomponent-name@ />
      </div>
    );
    expect(true).not.toBeUndefined;
  });
});
