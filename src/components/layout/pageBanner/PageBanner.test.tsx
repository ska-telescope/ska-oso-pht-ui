import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import PageBanner from './PageBanner';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

describe('<PageBanner />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <PageBanner pageNo={1} />
      </StoreProvider>
    );
  });
});
