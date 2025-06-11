import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import ObservingBand from './ObservingBand';

describe('<ObservingBand />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <ObservingBand value={0} />
      </StoreProvider>
    );
  });
});
