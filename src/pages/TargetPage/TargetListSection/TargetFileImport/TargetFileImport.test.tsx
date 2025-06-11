import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import TargetFileImport from './TargetFileImport';

describe('<TargetFileImport />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <TargetFileImport raType={0} />
      </StoreProvider>
    );
  });
});
