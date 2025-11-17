import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import BitDepth from './bitDepth';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

describe('<BitDepth />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <AppFlowProvider>
          <BitDepth value={0} />
        </AppFlowProvider>
      </StoreProvider>
    );
  });
});
