import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import TargetPage from './TargetPage';

describe('<TargetPage />>', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <TargetPage />
      </StoreProvider>
    );
  });
});
