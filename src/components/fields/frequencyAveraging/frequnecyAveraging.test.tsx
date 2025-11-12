import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import FrequencyAveraging from './frequencyAveraging';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

describe('<FrequencyAveraging />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <AppFlowProvider>
          <FrequencyAveraging value={0} />
        </AppFlowProvider>
      </StoreProvider>
    );
  });
});
