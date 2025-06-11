import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import NumStations from './NumStations';

describe('<NumStations />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <NumStations value={0} />
      </StoreProvider>
    );
  });
});
