import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import PageFooter from './PageFooter';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

describe('<PageFooter />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <PageFooter pageNo={1} />
      </StoreProvider>
    );
  });
});
