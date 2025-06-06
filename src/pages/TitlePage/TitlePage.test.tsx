import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import TitlePage from './TitlePage';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

describe('<TitlePage />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <TitlePage />
      </StoreProvider>
    );
  });
});
