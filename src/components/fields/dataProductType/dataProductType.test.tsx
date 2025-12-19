import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
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
