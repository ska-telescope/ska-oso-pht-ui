import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import SubArray from './SubArray';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('<SubArray />', () => {
  test('renders correctly', () => {
    wrapper(<SubArray observingBand={0} telescope={0} value={1} />);
  });
  test('renders correctly ( telescope > 0 )', () => {
    wrapper(<SubArray observingBand={0} telescope={1} value={1} />);
  });
  test('renders correctly ( invalid observingBand )', () => {
    wrapper(<SubArray observingBand={99} telescope={1} value={1} />);
  });
  test('renders correctly ( suffix )', () => {
    wrapper(<SubArray observingBand={1} suffix={'#'} telescope={2} value={1} />);
  });
});
