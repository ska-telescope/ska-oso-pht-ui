import { afterEach, describe, expect, test } from 'vitest';
import TestProposalFormProvider from '@/models/proposals/testing/TestProposalFormProvider';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@utils/storage/store';
import { MockCalibratorFrontendList } from '@/models/proposals/testing/mockCalibrators';
import { MockProposalFrontend } from '@/services/axios/put/putProposal/mockProposalFrontend';
import { ProposalType } from '@/models/proposals/proposal';
import CalibrationPage from './CalibrationPage';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement, values?: Partial<ProposalType>) => {
  return render(
    <StoreProvider>
      <TestProposalFormProvider values={values}>
        <ThemeA11yProvider>{component}</ThemeA11yProvider>
      </TestProposalFormProvider>
    </StoreProvider>
  );
};

vi.mock('@/services/api/calibrators', () => ({
  findCalibrators: vi.fn().mockResolvedValue({ data: MockCalibratorFrontendList })
}));

vi.mock('@/utils/aaa/aaaUtils', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    accessSubmit: vi.fn(() => true)
  };
});

const mockOSD = vi.hoisted(() => ({ autoLink: false }));

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({
    autoLink: mockOSD.autoLink,
    osdCycleId: 'CYCLE-1',
    osdCyclePolicy: {
      maxTargets: 1,
      maxObservations: 1,
      calibrationFactoryDefined: true
    }
  })
}));

vi.mock('../../components/layout/Shell/Shell', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

vi.mock('../entry/Calibration/CalibrationEntry', () => ({
  default: () => <div data-testid="calibrationEntryStub" />
}));

// The mock proposal's links and calibration, which are already the form's shape
const renderWithProposal = (values: Partial<ProposalType>) =>
  wrapper(<CalibrationPage />, {
    targets: MockProposalFrontend.targets as ProposalType['targets'],
    targetObservation: MockProposalFrontend.targetObservation,
    calibrationStrategy: MockProposalFrontend.calibrationStrategy,
    ...values
  });

describe('<CalibrationPage />', () => {
  afterEach(() => {
    mockOSD.autoLink = false;
    vi.restoreAllMocks();
  });

  test('renders correctly', async () => {
    wrapper(<CalibrationPage />);
  });

  test('shows that no calibration was created when a target is linked without one', () => {
    renderWithProposal({ calibrationStrategy: [] });

    expect(screen.getByText('error.noCalibrationsLoggedOut')).toBeInTheDocument();
    expect(screen.queryByTestId('calibrationEntryStub')).not.toBeInTheDocument();
  });

  describe('auto-linked proposals', () => {
    test('asks for a target when there is no target', () => {
      mockOSD.autoLink = true;
      renderWithProposal({ targets: [], targetObservation: [], calibrationStrategy: [] });

      expect(screen.getByText('error.noCalibrationsNoTarget')).toBeInTheDocument();
      expect(screen.queryByTestId('calibrationEntryStub')).not.toBeInTheDocument();
    });

    test('shows the calibration once the target is linked', () => {
      mockOSD.autoLink = true;
      renderWithProposal({
        targetObservation: [
          { targetId: 'target-1', observationId: 'obs-1', dataProductsSDPId: 'sdp-1' }
        ]
      });

      expect(screen.getByTestId('calibrationEntryStub')).toBeInTheDocument();
      expect(screen.queryByTestId('noDataNotification')).not.toBeInTheDocument();
    });
  });
});
