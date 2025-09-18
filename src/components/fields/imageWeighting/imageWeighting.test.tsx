import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import ImageWeighting from './imageWeighting';

describe('<ImageWeighting />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <ImageWeighting value={0} />
      </StoreProvider>
    );
  });
});
