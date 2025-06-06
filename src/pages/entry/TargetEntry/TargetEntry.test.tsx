import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import TargetEntry from './TargetEntry';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

describe('<TargetEntry />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <TargetEntry raType={0} />
      </StoreProvider>
    );
  });
});
