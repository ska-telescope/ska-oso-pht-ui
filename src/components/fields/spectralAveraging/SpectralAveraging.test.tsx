import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import SpectralAveraging from './SpectralAveraging';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('<SpectralAveraging />', () => {
  test('renders correctly', () => {
    wrapper(<SpectralAveraging widthLabel={0} value={1} />);
  });
  test('renders correctly', () => {
    wrapper(<SpectralAveraging isLow widthLabel={0} value={1} />);
  });
});
