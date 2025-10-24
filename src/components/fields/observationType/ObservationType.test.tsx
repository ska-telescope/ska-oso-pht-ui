import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import ObservationType from './ObservationType';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('<ObservationType />', () => {
  test('renders correctly', () => {
    wrapper(<ObservationType value={1} />);
  });
  test('renders correctly ( isContinuumOnly )', () => {
    wrapper(<ObservationType suffix={'#'} value={1} isContinuumOnly />);
  });
});
