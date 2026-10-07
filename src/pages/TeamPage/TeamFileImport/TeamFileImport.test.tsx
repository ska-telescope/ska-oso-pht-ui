import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@utils/storage/store';
import TeamFileImport from './TeamFileImport';

describe('<TeamFileImport />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <TeamFileImport />
      </StoreProvider>
    );
  });
});
