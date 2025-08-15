import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import MemberAccess from './MemberAccess';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

describe('<MemberAccess />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <MemberAccess />
      </StoreProvider>
    );
  });
});
