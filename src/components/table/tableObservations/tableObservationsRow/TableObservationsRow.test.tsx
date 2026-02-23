// ------------------------------------------------------------
// 1. MOCKS MUST COME BEFORE IMPORTS
// ------------------------------------------------------------
import { vi } from 'vitest';

// Mock OSD accessors
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

// Partial mock of constants — keeps all real exports
vi.mock('@/utils/constants', async () => {
  const actual = await vi.importActual<any>('@/utils/constants');
  return {
    ...actual
  };
});

vi.mock('@/utils/helpers', async () => {
  const actual = await vi.importActual<any>('@/utils/helpers');
  return {
    ...actual,
    frequencyConversion: (val: number, from: number, to: number) => {
      if (from === FREQUENCY_HZ && to === FREQUENCY_MHZ) return val / 1e6;
      if (from === FREQUENCY_HZ && to === FREQUENCY_GHZ) return val / 1e9;
      return val;
    }
  };
});

// ------------------------------------------------------------
// 2. IMPORTS (AFTER MOCKS)
// ------------------------------------------------------------
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import TableObservationsRow from './TableObservationsRow';
import { MockProposalFrontend } from '@/services/axios/get/getProposal/mockProposalFrontend';
import { FREQUENCY_GHZ, FREQUENCY_HZ, FREQUENCY_MHZ } from '@/utils/constants';

// ------------------------------------------------------------
// 3. TEST DATA
// ------------------------------------------------------------
const mockItem = {
  id: 1,
  id2: 'group-1',
  type: 'CONTINUUM',
  telescope: 1,
  subarray: 'A',
  bandwidth: 1,
  rec: {
    observingBand: '1',
    centralFrequency: 1_000_000_000,
    centralFrequencyUnits: 'Hz',
    continuumBandwidth: 1_000_000
  }
};

const wrapper = (component: React.ReactElement) =>
  render(<StoreProvider>{component}</StoreProvider>);

// ------------------------------------------------------------
// 4. TESTS
// ------------------------------------------------------------
describe('TableObservationsRow', () => {
  const defaultProps = {
    item: mockItem,
    proposal: MockProposalFrontend,
    index: 0,
    expanded: false,
    deleteClicked: vi.fn(),
    editClicked: vi.fn(),
    toggleRow: vi.fn(),
    expandButtonRef: () => null,
    updateItem: vi.fn(),
    tableLength: 1,
    t: (key: string) => key
  };

  it('renders without crashing', () => {
    wrapper(<TableObservationsRow {...defaultProps} />);
    expect(screen.getByText('group-1')).toBeInTheDocument();
  });
});
