import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, it, vi, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import {
  DEFAULT_CONTINUUM_OBSERVATION_LOW,
  DEFAULT_ZOOM_OBSERVATION_LOW,
  ZOOM_BANDWIDTH_DEFAULT_LOW,
  ZOOM_CHANNELS_DEFAULT_LOW
} from '@utils/constants';
import ObservationEntry from './ObservationEntry';

// ---- Module mocks ----

// Setting `state=null` ensures that we can define some non "edit mode" tests.
// (If we didn't do this the testing environment created state would
// look as though it had some content so the component would always think
// it's in edit mode.)
// Edit-mode tests supply a `data` prop instead to explicitly trigger edit mode.
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({ pathname: '/', state: null, search: '', hash: '' }),
    useNavigate: () => vi.fn()
  };
});

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', async () => {
  const { OSD_CONSTANTS } =
    await vi.importActual<typeof import('@utils/OSDConstants')>('@utils/OSDConstants');
  return {
    useOSDAccessors: () => ({
      osdLOW: {
        basicCapabilities: {
          minFrequencyHz: 50_000_000,
          maxFrequencyHz: 350_000_000
        },
        subArrays: []
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
        },
        subArrays: []
      },
      observatoryConstants: OSD_CONSTANTS,
      telescopeBand: vi.fn(() => 2),
      findBand: vi.fn(() => ({
        minFrequencyHz: 50_000_000,
        maxFrequencyHz: 350_000_000
      })),
      isSV: false,
      selectedPolicy: null,
      osdCyclePolicy: null
    })
  };
});

vi.mock('@ska-telescope/ska-login-page', () => ({
  isLoggedIn: () => true
}));

const mockUpdateAppContent2 = vi.fn();
const mockHelpComponent = vi.fn();
const mockHelpComponentURL = vi.fn();

vi.mock('@ska-telescope/ska-gui-local-storage', () => ({
  storageObject: {
    useStore: () => ({
      application: {
        content2: {
          observations: [],
          dataProductSDP: [],
          targetObservation: []
        }
      },
      updateAppContent2: mockUpdateAppContent2,
      helpComponent: mockHelpComponent,
      helpComponentURL: mockHelpComponentURL
    })
  },
  StoreProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// Force a spectral zoom observation type for all tests, so we can verify bandwidth changes
vi.mock('@utils/helpers.ts', async () => {
  const actual = await vi.importActual<typeof import('@utils/helpers')>('@utils/helpers.ts');
  return {
    ...actual,
    obTypeTransform: () => ['spectral']
  };
});

// Replace BandwidthField with a button so tests can drive setBandwidth
// without needing to operate a full MUI Select.
const NEW_BANDWIDTH = 6; // must differ from ZOOM_BANDWIDTH_DEFAULT_LOW (8), and be a legal coarse zoom value (5-8)
vi.mock('@/components/fields/bandwidthFields/bandwidth/bandwidth', () => ({
  default: ({ setValue }: { setValue: (v: number) => void }) => (
    <button data-testid="bandwidth-change-btn" onClick={() => setValue(NEW_BANDWIDTH)}>
      change bandwidth
    </button>
  )
}));

// ---- Helpers ----

const wrapper = (component: React.ReactElement) =>
  render(<StoreProvider>{component}</StoreProvider>);

// ---- Tests ----

describe('<ObservationEntry />', () => {
  test('renders correctly', async () => {
    await act(async () => {
      wrapper(<ObservationEntry />);
    });
  });

  test('defaults a new LOW zoom observation to the coarsest resolution, 1000 channels, and the band centre frequency', async () => {
    vi.clearAllMocks();

    await act(async () => {
      wrapper(<ObservationEntry />);
    });

    expect(mockUpdateAppContent2).toHaveBeenCalledWith(
      expect.objectContaining({
        observations: expect.arrayContaining([
          expect.objectContaining({
            bandwidth: ZOOM_BANDWIDTH_DEFAULT_LOW,
            zoomChannels: ZOOM_CHANNELS_DEFAULT_LOW,
            centralFrequency: 200
          })
        ])
      })
    );
  });

  describe('bandwidth propagation to storage', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('saves updated zoom bandwidth to storage when bandwidth is changed (add mode)', async () => {
      const user = userEvent.setup();

      // Add mode (no data prop, state=null) → updateStorageProposal routes through
      // the synchronous addObservationToProposal path.
      await act(async () => {
        wrapper(<ObservationEntry />);
      });
      mockUpdateAppContent2.mockClear();

      await user.click(screen.getByTestId('bandwidth-change-btn'));
      await act(async () => {});

      expect(mockUpdateAppContent2).toHaveBeenCalledWith(
        expect.objectContaining({
          observations: expect.arrayContaining([
            expect.objectContaining({ bandwidth: NEW_BANDWIDTH })
          ])
        })
      );
    });

    it('saves updated zoom bandwidth to storage when bandwidth is changed (edit mode)', async () => {
      const user = userEvent.setup();

      // Edit mode: passing an existing observation as `data` makes isEdit()=true,
      // so updateStorageProposal routes through the async
      // updateObservationOnProposal path. setProposal is mocked (no React state
      // update), so the async function resolves cleanly without scheduler noise.
      await act(async () => {
        wrapper(<ObservationEntry data={DEFAULT_ZOOM_OBSERVATION_LOW} />);
      });
      mockUpdateAppContent2.mockClear();

      await user.click(screen.getByTestId('bandwidth-change-btn'));
      await act(async () => {});

      expect(mockUpdateAppContent2).toHaveBeenCalledWith(
        expect.objectContaining({
          observations: expect.arrayContaining([
            expect.objectContaining({ bandwidth: NEW_BANDWIDTH })
          ])
        })
      );
    });
  });

  describe('central frequency rounding and grid-snapping', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('rounds central frequency to the nearest Hz when saving to storage', async () => {
      const observation = {
        ...DEFAULT_CONTINUUM_OBSERVATION_LOW,
        centralFrequency: 200.0000006 // 200,000,000.6 Hz
      };

      await act(async () => {
        wrapper(<ObservationEntry data={observation} />);
      });
      await act(async () => {});

      expect(mockUpdateAppContent2).toHaveBeenCalledWith(
        expect.objectContaining({
          observations: expect.arrayContaining([
            expect.objectContaining({ centralFrequency: 200.000001 }) // rounds up to 200,000,001 Hz
          ])
        })
      );
    });

    it('snaps a misaligned central frequency to the channel grid when loading a LOW zoom observation', async () => {
      const observation = {
        ...DEFAULT_ZOOM_OBSERVATION_LOW,
        centralFrequency: 200.001 // not aligned to the 1808.449074-Hz channel grid
      };

      await act(async () => {
        wrapper(<ObservationEntry data={observation} />);
      });
      await act(async () => {});

      expect(mockUpdateAppContent2).toHaveBeenCalledWith(
        expect.objectContaining({
          observations: expect.arrayContaining([
            expect.objectContaining({ centralFrequency: 200.001808 })
          ])
        })
      );
    });
  });
});
