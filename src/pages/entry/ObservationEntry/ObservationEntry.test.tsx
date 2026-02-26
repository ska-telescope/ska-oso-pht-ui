import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import ObservationEntry from './ObservationEntry';

// --------------------------------------------------------------

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({
    osdLOW: {
      basicCapabilities: {
        minFrequencyHz: 100_000_000,
        maxFrequencyHz: 200_000_000
      }
    },
    osdMID: {
      basicCapabilities: {
        receiverInformation: [
          {
            rxId: '1',
            minFrequencyHz: 100_000_000,
            maxFrequencyHz: 200_000_000
          }
        ]
      }
    }
  })
}));

// ---------------------------------------------

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<ObservationEntry />', () => {
  test('renders correctly', () => {
    wrapper(<ObservationEntry />);
  });
});
