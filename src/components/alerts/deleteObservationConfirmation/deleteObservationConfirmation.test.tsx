import { describe, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import DeleteObservationConfirmation from './deleteObservationConfirmation';

// Mock translation hook
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

// Mock AlertDialog to expose the onClose handler
vi.mock('../alertDialog/AlertDialog', () => ({
  default: ({ open, onClose, children }: any) =>
    open ? (
      <div data-testid="mock-alert-dialog">
        <button onClick={onClose}>CANCEL</button>
        {children}
      </div>
    ) : null
}));

describe('<DeleteObservationConfirmation />', () => {
  const mockSetOpen = vi.fn();
  const mockAction = vi.fn();
  const mockObservation = {
    telescope: 'testTelescope',
    subarray: 'testSubArray',
    type: 'testType'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders correctly', () => {
    render(
      <StoreProvider>
        <DeleteObservationConfirmation
          action={vi.fn()}
          observation={{
            id: '',
            telescope: 0,
            subarray: 0,
            linked: '',
            type: 0,
            observingBand: 0,
            weather: undefined,
            elevation: 0,
            centralFrequency: 0,
            centralFrequencyUnits: 0,
            bandwidth: 0,
            continuumBandwidth: 0,
            continuumBandwidthUnits: 0,
            spectralAveraging: undefined,
            tapering: undefined,
            imageWeighting: 0,
            robust: 0,
            supplied: {
              type: 0,
              value: 0,
              units: 0
            },
            spectralResolution: '',
            effectiveResolution: '',
            numSubBands: undefined,
            num15mAntennas: undefined,
            num13mAntennas: undefined,
            numStations: undefined
          }}
          open={true}
          setOpen={vi.fn()}
        />
      </StoreProvider>
    );
  });

  test('calls setOpen(false) when dialog is closed', async () => {
    render(
      <StoreProvider>
        <DeleteObservationConfirmation
          action={mockAction}
          observation={mockObservation}
          open={true}
          setOpen={mockSetOpen}
        />
      </StoreProvider>
    );

    const closeButton = screen.getByRole('button', { name: /CANCEL/i });
    await userEvent.click(closeButton);

    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });
});
