import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import ImageWeighting from './imageWeighting';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

describe('<ImageWeighting />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <AppFlowProvider>
          <ImageWeighting value={0} />
        </AppFlowProvider>
      </StoreProvider>
    );
  });
});
