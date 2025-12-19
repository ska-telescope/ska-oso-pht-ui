import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import CycleSelection from './CycleSelection';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>
        <ThemeA11yProvider>{component}</ThemeA11yProvider>
      </AppFlowProvider>
    </StoreProvider>
  );
};

// Mock translation hook
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

// Mock useOSDAccessors
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
  useOSDAccessors: () => ({
    osdPolicies: [mockPolicy],
    selectedPolicy: mockPolicy,
    setSelectedPolicy: vi.fn(),
    osdCycleId: mockPolicy.cycleInformation.cycleId,
    osdCycleDescription: mockPolicy.cycleDescription,
    osdOpens: () => mockPolicy.cycleInformation.proposalOpen,
    osdCloses: () => mockPolicy.cycleInformation.proposalClose,
    osdCyclePolicy: { maxTargets: 1, maxObservations: 1 }
  })
}));

describe('CycleSelection component', () => {
  it('renders cycle details correctly when open', () => {
    wrapper(<CycleSelection open={true} onClose={vi.fn()} onConfirm={vi.fn()} />);

    expect(screen.getByText('Cycle')).toBeInTheDocument();
    expect(screen.getByText('Cycle ID')).toBeInTheDocument();
    expect(screen.getByText('SKAO_2027_1')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Science Verification')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(<CycleSelection open={false} onClose={vi.fn()} onConfirm={vi.fn()} />);
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
});
