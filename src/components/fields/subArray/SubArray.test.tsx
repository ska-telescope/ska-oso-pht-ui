import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import SubArray from './SubArray';

describe('<SubArray />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <SubArray observingBand={0} telescope={0} value={1} />
      </StoreProvider>
    );
  });
  test('renders correctly ( telescope > 0 )', () => {
    render(
      <StoreProvider>
        <SubArray observingBand={0} telescope={1} value={1} />
      </StoreProvider>
    );
  });
  test('renders correctly ( invalid observingBand )', () => {
    render(
      <StoreProvider>
        <SubArray observingBand={99} telescope={1} value={1} />
      </StoreProvider>
    );
  });
  test('renders correctly ( suffix )', () => {
    render(
      <StoreProvider>
        <SubArray observingBand={1} suffix={'#'} telescope={2} value={1} />
      </StoreProvider>
    );
  });
});
