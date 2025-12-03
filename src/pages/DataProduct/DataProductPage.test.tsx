import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import DataProductPage from './DataProductPage';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({
    osdCycleId: 'CYCLE-1',
    osdCyclePolicy: {
      linkObservationToObservingMode: true
    }
  })
}));

describe('<DataProductPage />', () => {
  test('renders correctly', () => {
    wrapper(<DataProductPage />);
  });
});

// TODO : Test for no observations message
// TODO : Test for DataProduct table rendering
// TODO : Test for single DataProduct rendering
