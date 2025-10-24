import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import SpectralAveragingMID from './SpectralAveragingMID';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('<SpectralAveragingMID />', () => {
  test('renders correctly', () => {
    wrapper(<SpectralAveragingMID value={1} />);
  });
});
