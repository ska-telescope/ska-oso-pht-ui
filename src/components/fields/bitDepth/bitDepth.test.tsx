import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
import '@testing-library/jest-dom';
import BitDepth from './bitDepth';

describe('<BitDepth />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <BitDepth value={0} />
      </StoreProvider>
    );
  });
});
