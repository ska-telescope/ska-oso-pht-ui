import { describe, test } from 'vitest';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { render } from '@testing-library/react';
import Elevation from './Elevation';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('<Elevation />', () => {
  test('renders correctly', () => {
    wrapper(<Elevation testId={''} value={20} />);
  });
  test('renders correctly, isLow', () => {
    wrapper(<Elevation isLow testId={''} value={0} />);
  });
  test('renders correctly, value > max', () => {
    wrapper(<Elevation isLow testId={''} value={100} />);
  });
});
