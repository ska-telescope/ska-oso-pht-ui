import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
import '@testing-library/jest-dom';
import DataProductType from './dataProductType';

describe('<ChannelsOut />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <DataProductType value={0} />
      </StoreProvider>
    );
  });
});
