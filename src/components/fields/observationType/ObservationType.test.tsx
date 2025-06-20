import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import ObservationType from './ObservationType';

describe('<ObservationType />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <ObservationType value={1} />
      </StoreProvider>
    );
  });
  test('renders correctly ( isContinuumOnly )', () => {
    render(
      <StoreProvider>
        <ObservationType suffix={'#'} value={1} isContinuumOnly />
      </StoreProvider>
    );
  });
});
