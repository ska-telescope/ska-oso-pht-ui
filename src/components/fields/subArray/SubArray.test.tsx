import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import SubArray from './SubArray';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

describe('<SubArray />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <SubArray observingBand={0} telescope={0} value={0} />
      </StoreProvider>
    );
  });
});
