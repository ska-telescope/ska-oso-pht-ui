import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import TimeAveraging from './timeAveraging';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

describe('<TimeAveraging />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <AppFlowProvider>
          <TimeAveraging value={0} />
        </AppFlowProvider>
      </StoreProvider>
    );
  });
});
