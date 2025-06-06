import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ObservingBand from './ObservingBand';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

describe('<ObservingBand />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <ObservingBand value={0} />
      </StoreProvider>
    );
  });
});
