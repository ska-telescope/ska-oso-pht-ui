import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import GroupObservations from './groupObservations';

describe('<groupObservations />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <GroupObservations value={0} obsId={''} />
      </StoreProvider>
    );
  });
});
