import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import PstModeField from './PstMode';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';
import {
  DETECTED_FILTER_BANK_VALUE,
  FLOW_THROUGH_VALUE,
  PULSAR_TIMING_VALUE
} from '@/utils/constants';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('<PstMode />', () => {
  test('renders correctly', () => {
    wrapper(<PstModeField value={FLOW_THROUGH_VALUE} />);
  });
  test('renders correctly', () => {
    wrapper(<PstModeField value={DETECTED_FILTER_BANK_VALUE} />);
  });
  test('renders correctly', () => {
    wrapper(<PstModeField value={PULSAR_TIMING_VALUE} />);
  });
});
