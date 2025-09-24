import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import CoordinateEntry from '@pages/entry/CoordinateEntry/CoordinateEntry.tsx';

describe('<CoordinateEntry />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <CoordinateEntry raType={0} />
      </StoreProvider>
    );
  });
});
