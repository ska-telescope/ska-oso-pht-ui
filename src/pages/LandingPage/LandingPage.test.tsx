import { describe, expect, test, vi, beforeEach, Mock } from 'vitest';
import { fireEvent, screen, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider, storageObject } from '@ska-telescope/ska-gui-local-storage';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import LandingPage from './LandingPage';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import GetProposal from '@services/axios/get/getProposal/getProposal';
import GetProposalList from '@/services/axios/get/getProposalList/getProposalList';
import GetProposalAccessForUser from '@/services/axios/get/getProposalAccess/user/getProposalAccessForUser';
import PostProposal from '@/services/axios/post/postProposal/postProposal';
const mockValidateFn = vi.hoisted(() => vi.fn(() => []));
import { PROPOSAL_STATUS } from '@/utils/constants';
import { ProposalAccess } from '@/utils/types/proposalAccess';
import { PROPOSAL_ACCESS_PERMISSIONS, PROPOSAL_ROLE_PI } from '@/utils/aaa/aaaUtils';
import Proposal from '@/utils/types/proposal';

// ---- Module mocks ----

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

vi.mock('@ska-telescope/ska-login-page', () => ({
  isLoggedIn: vi.fn(() => false),
  ButtonLogin: (props: any) => <button data-testid={props.testId}>{props.label}</button>
}));

vi.mock('@azure/msal-react', () => ({
  useMsal: vi.fn(() => ({ accounts: [] }))
}));

vi.mock('@/utils/aaa/aaaUtils', async importOriginal => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useInitializeAccessStore: vi.fn()
  };
});

vi.mock('@services/axios/get/getProposal/getProposal', () => ({
  default: vi.fn()
}));

vi.mock('@/services/axios/get/getProposalList/getProposalList', () => ({
  default: vi.fn()
}));

vi.mock('@/services/axios/get/getProposalAccess/user/getProposalAccessForUser', () => ({
  default: vi.fn()
}));

vi.mock('@/services/axios/post/postProposal/postProposal', () => ({
  default: vi.fn()
}));

vi.mock('@/utils/validation/validation', () => ({
  useValidateProposal: () => mockValidateFn
}));

vi.mock('@/utils/storage/proposalData', () => ({
  storeProposalCopy: vi.fn()
}));

vi.mock('@/utils/help/useHelp', () => ({
  useHelp: () => ({ setHelp: vi.fn() })
}));

vi.mock('@/services/axios/use/useOSDAPI/useOSDAPI', () => ({
  useOSDAPI: vi.fn()
}));

vi.mock('@/services/axios/axiosAuthClient/axiosAuthClient', () => ({
  default: () => ({})
}));

vi.mock('@/utils/notify/useNotify', () => ({
  useNotify: () => ({
    notifyError: vi.fn(),
    notifySuccess: vi.fn(),
    notifyWarning: vi.fn()
  })
}));

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({
    isSV: false,
    osdCycleId: 'CYCLE-1',
    autoLink: false,
    setSelectedPolicyByCycleId: vi.fn(),
    getCycle: vi.fn(() => null)
  })
}));

// Stub TableSubmissions so the clone button reliably calls cloneFunction(id)
vi.mock('@/components/table/tableSubmissions/TableSubmissions', () => ({
  default: ({ cloneFunction, data }: any) =>
    data.map((item: any) => (
      <button key={item.id} data-testid="cloneIcon" onClick={() => cloneFunction(item.id)}>
        Clone
      </button>
    ))
}));

// Stub ProposalDisplay so the confirm button reliably calls onConfirm
vi.mock('@/components/alerts/proposalDisplay/ProposalDisplay', () => ({
  default: ({ onConfirm, open, onConfirmLabel }: any) =>
    open && onConfirmLabel ? (
      <button data-testid="displayConfirmationButton" onClick={() => onConfirm()}>
        Confirm
      </button>
    ) : null
}));

// ---- Helpers ----

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

// ---- Existing tests ----

describe('<LandingPage />', () => {
  test('renders correctly', () => {
    wrapper(<LandingPage />);
  });

  test('does not show addSubmissionButton when not logged in', () => {
    wrapper(<LandingPage />);
    expect(isLoggedIn()).toBe(false);
    expect(screen.queryByTestId('addSubmissionButton')).toBeNull();
  });

  test('shows the sign-in button when not logged in', () => {
    wrapper(<LandingPage />);
    expect(screen.getByTestId('landingWelcomeLoginButton')).toBeInTheDocument();
  })
});

// ---- Clone proposal tests ----

describe('clone proposal', () => {
  const ORIGINAL_PROPOSAL_ID = 'prp-1';
  const CLONED_PROPOSAL_ID = 'prp-c10ne2';

  const mockRichOriginalProposal: Partial<Proposal> = {
    id: ORIGINAL_PROPOSAL_ID,
    title: 'In a galaxy far, far away',
    status: PROPOSAL_STATUS.DRAFT,
    cycle: 'SKA_5000_2023',
    proposalType: 1,
    proposalSubType: [3],
    abstract: 'Detailed science abstract about the cosmos and beyond',
    targets: [{ id: 'target-1', name: 'NGC 1275', ra: '03:19:48', dec: '+41:30:42' } as any],
    observations: [{ id: 'obs-1', telescope: 'SKA-LOW' } as any],
    investigators: [
      {
        id: 'inv-1',
        firstName: 'Jane',
        lastName: 'Doe',
        pi: true,
        email: 'jane@example.com'
      } as any
    ],
    dataProductSDP: [{ id: 'dp-1' } as any],
    dataProductSRC: [],
    calibrationStrategy: [],
    groupObservations: [],
    targetObservation: [],
    sciencePDF: null,
    technicalPDF: null
  };

  // Skeleton response returned by PostProposal — mimics what the backend creates:
  // a minimal record with only the fields sent by mappingPostProposal (title, type, cycle).
  // All rich data fields (targets, observations, abstract, etc.) are empty.
  const mockPostProposalSkeleton: Partial<Proposal> = {
    id: CLONED_PROPOSAL_ID,
    title: 'In a galaxy far, far away (Copy)',
    cycle: 'CYCLE-1',
    status: PROPOSAL_STATUS.DRAFT,
    targets: [],
    observations: [],
    investigators: [],
    abstract: '',
    dataProductSDP: [],
    dataProductSRC: [],
    calibrationStrategy: []
  };

  const mockAccessList: ProposalAccess[] = [
    {
      id: 'acc-1',
      prslId: ORIGINAL_PROPOSAL_ID,
      role: PROPOSAL_ROLE_PI,
      userId: 'user-1',
      permissions: PROPOSAL_ACCESS_PERMISSIONS
    }
  ];

  const mockUpdateAppContent1 = vi.fn();
  const mockUpdateAppContent2 = vi.fn();
  const mockUpdateAppContent4 = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (isLoggedIn as Mock).mockReturnValue(true);
    (GetProposal as Mock).mockResolvedValue(mockRichOriginalProposal);
    (GetProposalList as Mock).mockResolvedValue([mockRichOriginalProposal]);
    (GetProposalAccessForUser as Mock).mockResolvedValue(mockAccessList);
    (PostProposal as Mock).mockResolvedValue(mockPostProposalSkeleton);

    vi.spyOn(storageObject, 'useStore').mockReturnValue({
      application: {
        content1: [],
        content2: mockRichOriginalProposal,
        content4: mockAccessList,
        content5: null,
        content6: {},
        content7: {},
        content8: {},
        content9: {}
      },
      updateAppContent1: mockUpdateAppContent1,
      updateAppContent2: mockUpdateAppContent2,
      updateAppContent4: mockUpdateAppContent4,
      updateAppContent5: vi.fn()
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const triggerCloneConfirm = async () => {
    wrapper(<LandingPage />);

    await waitFor(() => {
      expect(screen.getByTestId('cloneIcon')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('cloneIcon'));

    await waitFor(() => {
      expect(screen.getByTestId('displayConfirmationButton')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('displayConfirmationButton'));
  };

  test('preserves original targets, observations, abstract and data products after cloning', async () => {
    await triggerCloneConfirm();

    // After confirming the clone, the proposal state should contain a copy of all the original proposal data.
    await waitFor(() => {
      expect(mockUpdateAppContent2).toHaveBeenLastCalledWith(
        expect.objectContaining({
          id: CLONED_PROPOSAL_ID,
          targets: mockRichOriginalProposal.targets,
          observations: mockRichOriginalProposal.observations,
          abstract: mockRichOriginalProposal.abstract,
          dataProductSDP: mockRichOriginalProposal.dataProductSDP,
          investigators: mockRichOriginalProposal.investigators
        })
      );
    });
  });

  test('does not overwrite cloned proposal with empty PostProposal skeleton', async () => {
    await triggerCloneConfirm();

    // The last state update is expected to be a full proposal object containing all the original proposal data 
    // (not the empty skeleton returned by PostProposal).
    await waitFor(() => {
      const lastCall = mockUpdateAppContent2.mock.calls.at(-1)?.[0];
      expect(lastCall?.targets).not.toEqual([]);
      expect(lastCall?.observations).not.toEqual([]);
      expect(lastCall?.abstract).not.toEqual('');
    });
  });

  test('updates validation state with cloned proposal ID after cloning', async () => {
    await triggerCloneConfirm();

    // After confirming the clone, we expect validateProposal to be called once for the new
    // cloned proposal (with the new ID so that the contents and state match.
    await waitFor(() => {
      expect(mockValidateFn).toHaveBeenCalledWith(
        expect.objectContaining({ id: CLONED_PROPOSAL_ID })
      );
    });
  });
});
