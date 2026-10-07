import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
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
