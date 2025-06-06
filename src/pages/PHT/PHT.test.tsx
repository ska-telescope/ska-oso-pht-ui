import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import PHT from './PHT';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

describe('<PHT />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <PHT />
      </StoreProvider>
    );
  });
});
