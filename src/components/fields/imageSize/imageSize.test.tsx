import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import ImageSize from './imageSize';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

describe('<ImageSize />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <AppFlowProvider>
          <ImageSize value={0} />
        </AppFlowProvider>
      </StoreProvider>
    );
  });
});
