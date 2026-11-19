import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import DeleteObservationConfirmation from './deleteObservationConfirmation';
import { newSvObservation, OBSERVING_MODE } from '@/models/proposals/observations';

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

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<DeleteObservationConfirmation />', () => {
  const mockSetOpen = vi.fn();
  const mockAction = vi.fn();
  const mockObservation = newSvObservation(OBSERVING_MODE.SPECTRAL, 15);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("shows the observation's telescope, subarray and observing mode", () => {
    wrapper(
      <DeleteObservationConfirmation
        action={mockAction}
        observation={mockObservation}
        open={true}
        setOpen={mockSetOpen}
      />
    );

    expect(screen.getByText('arrayConfiguration.ska_low')).toBeInTheDocument();
    expect(screen.getByText('subArrayConfiguration.aa2_sv')).toBeInTheDocument();
    expect(screen.getByText('observationType.spectral')).toBeInTheDocument();
  });

  test('calls setOpen(false) when dialog is closed', async () => {
    wrapper(
      <DeleteObservationConfirmation
        action={mockAction}
        observation={mockObservation}
        open={true}
        setOpen={mockSetOpen}
      />
    );

    const closeButton = screen.getByRole('button', { name: /CANCEL/i });
    await userEvent.click(closeButton);

    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });
});
