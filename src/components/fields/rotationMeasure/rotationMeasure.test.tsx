import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import RotationMeasureField from './rotationMeasure';

describe('<RotationMeasureField />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <RotationMeasureField value={1} />
      </StoreProvider>
    );
  });
  test('renders correctly with out of range value', () => {
    render(
      <StoreProvider>
        <RotationMeasureField value={3e9} />
      </StoreProvider>
    );
  });
});
