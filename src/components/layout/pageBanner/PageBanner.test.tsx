import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import PageBanner from './PageBanner';

describe('<PageBanner />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <PageBanner pageNo={1} />
      </StoreProvider>
    );
  });
});
