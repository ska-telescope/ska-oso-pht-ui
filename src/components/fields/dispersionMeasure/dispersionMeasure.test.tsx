import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import DispersionMeasureField from './dispersionMeasure';

describe('<DispersionMeasureField />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <DispersionMeasureField value={1} />
      </StoreProvider>
    );
  });
  test('renders correctly with out of range value', () => {
    render(
      <StoreProvider>
        <DispersionMeasureField value={100000} />
      </StoreProvider>
    );
  });
});
