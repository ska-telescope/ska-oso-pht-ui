import { describe, test } from 'vitest';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { render } from '@testing-library/react';
import Elevation from './Elevation';

describe('<Elevation />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <Elevation testId={''} value={20} />
      </StoreProvider>
    );
  });
  test('renders correctly, isLow', () => {
    render(
      <StoreProvider>
        <Elevation isLow testId={''} value={0} />
      </StoreProvider>
    );
  });
  test('renders correctly, value > max', () => {
    render(
      <StoreProvider>
        <Elevation isLow testId={''} value={100} />
      </StoreProvider>
    );
  });
});
