import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import GroupObservations from './groupObservations';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

describe('<Bandwidth />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <GroupObservations value={0} obsId={''} />
      </StoreProvider>
    );
  });
});
