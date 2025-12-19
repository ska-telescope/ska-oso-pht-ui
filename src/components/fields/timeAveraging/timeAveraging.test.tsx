import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import TimeAveraging from './timeAveraging';

describe('<TimeAveraging />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <TimeAveraging value={0} />
      </StoreProvider>
    );
  });
});
