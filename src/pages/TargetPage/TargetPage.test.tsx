import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { storageObject, StoreProvider } from '@utils/storage/store';
import TargetPage from './TargetPage';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import completeMockStore from '@/utils/MockStore';
import TestProposalFormProvider from '@/models/proposals/testing/TestProposalFormProvider';
import { ProposalType } from '@/models/proposals/proposal';
import {
  PAGE_CALIBRATION,
  PAGE_DATA_PRODUCTS,
  PAGE_LINKING,
  PAGE_TARGET,
  PAGE_TITLE_ADD,
  PROPOSAL_TYPE,
  STATUS_ERROR,
  STATUS_INITIAL
} from '@/utils/constants';

const wrapper = (component: React.ReactElement, proposal?: Partial<ProposalType>) => {
  return render(
    <StoreProvider>
      <TestProposalFormProvider values={proposal}>
        <ThemeA11yProvider>{component}</ThemeA11yProvider>
      </TestProposalFormProvider>
    </StoreProvider>
  );
};

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({
    autoLink: true,
    osdCycleId: 'CYCLE-1',
    osdCyclePolicy: {
      maxTargets: 1,
      maxObservations: 1
    }
  })
}));

vi.mock('../../components/layout/Shell/Shell', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));
vi.mock('./TargetListSection/targetListSection', () => ({ default: () => <div /> }));
vi.mock('./TargetMosaicSection/targetMosaicSection', () => ({ default: () => <div /> }));
vi.mock('./TargetNoSpecificSection/targetNoSpecificSection', () => ({ default: () => <div /> }));

describe('<TargetPage />>', () => {
  test('renders correctly', () => {
    wrapper(<TargetPage />);
  });

  test('updates the statuses of the pages that depend on the target when there is none', () => {
    const updateAppContent1 = vi.fn();
    vi.spyOn(storageObject, 'useStore').mockReturnValue({
      ...completeMockStore,
      application: {
        ...completeMockStore.application,
        // Statuses left over from when the proposal still had a target
        content1: Array(10).fill(STATUS_INITIAL)
      },
      updateAppContent1
    } as any);

    wrapper(<TargetPage />, {
      proposalType: { type: PROPOSAL_TYPE.SCIENCE_VERIFICATION, subTypes: [] },
      targets: [],
      targetObservation: [],
      calibrationStrategy: []
    });

    const statuses = updateAppContent1.mock.calls.at(-1)?.[0];
    expect(statuses[PAGE_TARGET]).toBe(STATUS_ERROR);
    expect(statuses[PAGE_DATA_PRODUCTS]).toBe(STATUS_ERROR);
    expect(statuses[PAGE_LINKING]).toBe(STATUS_ERROR);
    expect(statuses[PAGE_CALIBRATION]).toBe(STATUS_ERROR);
    // Pages that don't depend on the target are left as they were
    expect(statuses[PAGE_TITLE_ADD]).toBe(STATUS_INITIAL);
  });
});
