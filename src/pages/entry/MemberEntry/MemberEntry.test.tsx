import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import MemberEntry from './MemberEntry';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

describe('<MemberEntry />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <MemberEntry />
      </StoreProvider>
    );
  });
});
