import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import CycleSelection from './CycleSelection';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import * as accessors from '@/utils/osd/useOSDAccessors/useOSDAccessors';

// Wrapper to include providers
const wrapper = (component: React.ReactElement) =>
  render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );

// --- Mocks ---

// Translation hook
vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'cycle.label': 'Cycle',
        'id.label': 'Cycle ID',
        'cycleDescription.label': 'Description',
        'cycleOpens.label': 'Opens',
        'cycleCloses.label': 'Closes',
        'confirmBtn.label': 'Confirm',
        'closeBtn.label': 'Close'
      };
      return map[key] || key;
    }
  })
}));

// Base mock policy
const mockPolicy = {
  cycleNumber: 1,
  cycleDescription: 'Science Verification',
  cycleInformation: {
    cycleId: 'SKAO_2027_1',
    proposalOpen: '27-03-2026 12:00:00',
    proposalClose: '12-05-2026 04:00:00'
  }
};

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: vi.fn()
}));

describe('CycleSelection component', () => {
  beforeEach(() => {
    // Default return value: single policy
    (accessors.useOSDAccessors as Mock).mockReturnValue({
      osdPolicies: [mockPolicy],
      selectedPolicy: mockPolicy,
      setSelectedPolicy: vi.fn(),
      osdCycleId: mockPolicy.cycleInformation.cycleId,
      osdCycleDescription: mockPolicy?.cycleDescription,
      osdOpens: () => mockPolicy.cycleInformation.proposalOpen,
      osdCloses: () => mockPolicy.cycleInformation.proposalClose,
      osdCyclePolicy: { maxTargets: 1, maxObservations: 1 }
    });
  });

  it('renders cycle details correctly when open', () => {
    wrapper(<CycleSelection open={true} onClose={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.getByText('Cycle')).toBeInTheDocument();
    expect(screen.getByText('Cycle ID')).toBeInTheDocument();
    expect(screen.getByText(/SKAO_2027_1/)).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Science Verification')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    wrapper(<CycleSelection open={false} onClose={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.queryByText('Cycle')).not.toBeInTheDocument();
  });

  it('calls onClose when cancel button clicked', () => {
    const onClose = vi.fn();
    wrapper(<CycleSelection open={true} onClose={onClose} onConfirm={vi.fn()} />);
    fireEvent.click(screen.getByTestId('cancelButtonTestId'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onConfirm with selectedPolicy when confirm button clicked', () => {
    const onConfirm = vi.fn();
    wrapper(<CycleSelection open={true} onClose={vi.fn()} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByTestId('cycleConfirmationButton'));
    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining(mockPolicy));
  });

  it('has correct accessibility attributes', () => {
    wrapper(<CycleSelection open={true} onClose={vi.fn()} onConfirm={vi.fn()} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'alert-dialog-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'alert-dialog-description');
    expect(screen.getByText('Cycle')).toHaveAttribute('id', 'alert-dialog-title');
    expect(screen.getByTestId('cycleConfirmationButton')).toHaveAttribute('aria-label', 'Confirm');
    expect(screen.getByTestId('cancelButtonTestId')).toHaveAttribute('aria-label', 'Close');
  });

  it('renders multiple policies and allows selection of second', () => {
    const secondPolicy = {
      cycleNumber: 2,
      cycleDescription: 'Cycle Two',
      cycleInformation: {
        cycleId: 'FAKE_ID_FOR_TESTING',
        proposalOpen: '01-01-2027 00:00:00',
        proposalClose: '01-02-2027 00:00:00'
      }
    };
    (accessors.useOSDAccessors as Mock).mockReturnValue({
      osdPolicies: [mockPolicy, secondPolicy],
      selectedPolicy: mockPolicy,
      setSelectedPolicy: vi.fn(),
      osdCycleId: mockPolicy.cycleInformation.cycleId,
      osdCycleDescription: mockPolicy?.cycleDescription,
      osdOpens: () => mockPolicy.cycleInformation.proposalOpen,
      osdCloses: () => mockPolicy.cycleInformation.proposalClose,
      osdCyclePolicy: { maxTargets: 1, maxObservations: 1 }
    });

    const onConfirm = vi.fn();
    wrapper(<CycleSelection open={true} onClose={vi.fn()} onConfirm={onConfirm} />);

    // Both policies visible
    expect(screen.getByText(/SKAO_2027_1/)).toBeInTheDocument();
    expect(screen.getByText(c => c.includes('FAKE_ID_FOR_TESTING'))).toBeInTheDocument();

    // Click second card
    fireEvent.click(screen.getByText(c => c.includes('FAKE_ID_FOR_TESTING')));

    // Confirm should be called with second policy
    fireEvent.click(screen.getByTestId('cycleConfirmationButton'));
    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining(secondPolicy));
  });
});
