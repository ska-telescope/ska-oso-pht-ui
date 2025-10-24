import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import ObservingBand from './ObservingBand';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('<ObservingBand />', () => {
  test('renders correctly', () => {
    wrapper(<ObservingBand value={0} />);
  });
  test('renders correctly ( suffix )', () => {
    wrapper(<ObservingBand suffix={'#'} value={0} />);
  });
});
