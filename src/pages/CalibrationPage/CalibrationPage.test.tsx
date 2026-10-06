import { afterEach, describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { storageObject, StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { MockCalibratorFrontendList } from '@services/axios/get/getCalibratorList/mockCalibratorListFrontend.tsx';
import completeMockStore from '../../utils/MockStore';
import CalibrationPage from './CalibrationPage';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

vi.mock('@/services/axios/get/getCalibratorList/getCalibratorList', () => ({
  default: vi.fn().mockResolvedValue(MockCalibratorFrontendList)
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

const renderWithProposal = (proposal: object) => {
  vi.spyOn(storageObject, 'useStore').mockReturnValue({
    ...completeMockStore,
    application: {
      ...completeMockStore.application,
      content2: { ...completeMockStore.application.content2, ...proposal }
    }
  } as any);
  wrapper(<CalibrationPage />);
};

describe('<CalibrationPage />', () => {
  afterEach(() => {
    mockOSD.autoLink = false;
    vi.restoreAllMocks();
  });

  test('renders correctly', async () => {
    wrapper(<CalibrationPage />);
  });

  test('shows that no calibration was created when a target is linked without one', () => {
    renderWithProposal({ calibrationStrategy: null });

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
