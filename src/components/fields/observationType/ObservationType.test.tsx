import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ObservationType from './ObservationType';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

describe('<ObservationType />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <ObservationType value={0} />
      </StoreProvider>
    );
  });
});
