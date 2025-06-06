import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import SrcDataPage from './SrcDataPage';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

describe('<SrcDataPage />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <SrcDataPage />
      </StoreProvider>
    );
  });
});
