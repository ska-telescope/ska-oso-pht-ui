import { afterEach, describe, expect, test, vi, beforeEach, Mock } from 'vitest';
import { act, fireEvent, screen, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider, storageObject } from '@utils/storage/store';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import LandingPage from './LandingPage';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import GetProposalList from '@/services/axios/get/getProposalList/getProposalList';
import GetProposalAccessForUser from '@/services/axios/get/getProposalAccess/user/getProposalAccessForUser';
const mockValidateFn = vi.hoisted(() => vi.fn(() => []));
const mockNotifyError = vi.hoisted(() => vi.fn());
const mockNotifySuccess = vi.hoisted(() => vi.fn());
const mockNotifyWarning = vi.hoisted(() => vi.fn());
import { NAV, PATH, PROPOSAL_STATUS, PROPOSAL_TYPE, TMP_REVIEWER_ID } from '@/utils/constants';
import { ProposalAccess } from '@/utils/types/proposalAccess';
import { PROPOSAL_ACCESS_PERMISSIONS, PROPOSAL_ROLE_PI } from '@/utils/aaa/aaaUtils';
import Proposal from '@/utils/types/proposal';
import { FormProvider, useForm, useFormContext, UseFormReturn } from 'react-hook-form';
import { ProposalType } from '@/models/proposals/proposal';
import { getProposalFormDefaults, getProposalFormValues } from '@/models/proposals/useProposalForm';
import { ObservatoryPolicy } from '@/utils/types/observatoryData';

// ---- Module mocks ----

const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate
}));

vi.mock('@ska-telescope/ska-login-page', () => ({
  isLoggedIn: vi.fn(() => false),
  ButtonLogin: (props: any) => <button data-testid={props.testId}>{props.label}</button>
}));

vi.mock('@azure/msal-react', () => ({
  useMsal: vi.fn(() => ({ accounts: [] }))
}));

vi.mock('@/utils/aaa/aaaUtils', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useInitializeAccessStore: vi.fn()
  };
});

const { mockLoadFromOda, mockCreateInOda } = vi.hoisted(() => ({
  mockLoadFromOda: vi.fn(),
  mockCreateInOda: vi.fn()
}));
vi.mock('@/models/proposals/useProposalOda', () => ({
  useProposalOda: () => ({
    loadFromOda: mockLoadFromOda,
    saveToOda: vi.fn(),
    createInOda: mockCreateInOda
  })
}));

vi.mock('@/services/axios/get/getProposalList/getProposalList', () => ({
  default: vi.fn()
}));

vi.mock('@/services/axios/get/getProposalAccess/user/getProposalAccessForUser', () => ({
  default: vi.fn()
}));

vi.mock('@/services/axios/post/postProposalAccess/postProposalAccess', () => ({
  default: vi.fn()
}));

vi.mock('@/services/axios/post/postSendEmailInvite/postSendEmailInvite', () => ({
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
  default: () => ({ axiosClient: {}, refreshAuthToken: vi.fn() })
}));

vi.mock('@/utils/notify/useNotify', () => ({
  useNotify: () => ({
    notifyError: mockNotifyError,
    notifySuccess: mockNotifySuccess,
    notifyWarning: mockNotifyWarning
  })
}));

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utils/osd/useOSDAccessors/useOSDAccessors')>()),
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

// Confirms the given cycle as soon as the dialog opens
const mockPolicy = vi.hoisted(() => ({ current: {} as unknown }));
vi.mock('@/components/alerts/cycleSelection/CycleSelection', () => ({
  default: ({ open, onConfirm }: any) =>
    open ? (
      <button data-testid="cycleConfirmationButton" onClick={() => onConfirm(mockPolicy.current)}>
        Confirm
      </button>
    ) : null
}));

// ---- Helpers ----

// Exposes the global form, which holds the proposal being edited
let formProbe: UseFormReturn<ProposalType>;
const FormProbe = () => {
  formProbe = useFormContext<ProposalType>();
  return null;
};

const wrapper = (component: React.ReactElement) => {
  const FormWrapper = () => {
    const methods = useForm<ProposalType>({ defaultValues: getProposalFormDefaults() });
    return (
      <StoreProvider>
        <ThemeA11yProvider>
          <FormProvider {...methods}>
            {component}
            <FormProbe />
          </FormProvider>
        </ThemeA11yProvider>
      </StoreProvider>
    );
  };
  return render(<FormWrapper />);
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
  });
});

// ---- Clone proposal tests ----

describe('clone proposal', () => {
  const ORIGINAL_PROPOSAL_ID = 'prp-1';

  const mockRichOriginalProposal: Partial<Proposal> = {
    id: ORIGINAL_PROPOSAL_ID,
    title: 'In a galaxy far, far away',
    status: PROPOSAL_STATUS.DRAFT,
    cycle: 'SKA_5000_2023',
    proposalType: 'standard_proposal',
    proposalSubType: ['coordinated_proposal'],
    abstract: 'Detailed science abstract about the cosmos and beyond',
    targets: [{ id: 'target-1', name: 'NGC 1275', ra: '03:19:48', dec: '+41:30:42' } as any],
    observations: [{ id: 'obs-1', telescope: 'SKA-LOW' } as any],
    investigators: [
      {
        id: TMP_REVIEWER_ID,
        firstName: 'Jane',
        lastName: 'Doe',
        phdThesis: false,
        status: 'accepted',
        pi: true,
        email: 'jane@example.com'
      },
      {
        id: 'inv-2',
        firstName: 'John',
        lastName: 'Smith',
        phdThesis: false,
        status: 'accepted',
        pi: false,
        email: 'john@example.com'
      }
    ],
    dataProducts: [{ id: 'dp-1' } as any],
    calibrationStrategy: [],
    groupObservations: [],
    targetObservation: [],
    sciencePDF: null,
    technicalPDF: null
  };

  // The PI the backend adds to the clone: the person cloning, from their auth token
  const backendInjectedPI = {
    id: 'real-signed-in-account-id',
    firstName: 'Real',
    lastName: 'Cloner',
    email: 'real.cloner@example.com',
    phdThesis: false,
    status: 'accepted',
    pi: true
  };

  const originalValues = () => getProposalFormValues(mockRichOriginalProposal as Proposal);

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
    // Loads the original into the form, as the real loadFromOda does
    mockLoadFromOda.mockImplementation(async () => {
      const values = originalValues();
      formProbe.reset(values);
      return { data: values };
    });
    // Returns the proposal as the backend creates it: as sent, with the caller added as PI
    mockCreateInOda.mockImplementation(async (values: ProposalType) => ({
      data: { ...values, investigators: [backendInjectedPI] }
    }));
    (GetProposalList as Mock).mockResolvedValue([mockRichOriginalProposal]);
    (GetProposalAccessForUser as Mock).mockResolvedValue(mockAccessList);

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

  test('creates the clone from the original in the form, with its own ID, title and cycle', async () => {
    await triggerCloneConfirm();

    await waitFor(() => expect(mockCreateInOda).toHaveBeenCalledOnce());
    const original = originalValues();
    const [sent] = mockCreateInOda.mock.calls[0];
    expect(sent).toMatchObject({
      title: 'In a galaxy far, far away cloneProposal.suffix',
      cycle: 'CYCLE-1',
      abstract: original.abstract,
      targets: original.targets,
      observations: original.observations,
      dataProducts: original.dataProducts
    });
    expect(sent.prslId).not.toBe(ORIGINAL_PROPOSAL_ID);
    expect(sent.prslId).toMatch(/^prp-/);
  });

  test('sends no investigators when creating the clone, regardless of the original investigator list', async () => {
    // mockRichOriginalProposal already has [Jane Doe (PI), John Smith (co-I)] - none of that
    // should be forwarded. POST /create builds the PI itself from the caller's verified auth
    // token (see ska_oso_services' create_proposal), so the client must not pre-empt that.
    await triggerCloneConfirm();

    await waitFor(() => {
      expect(mockCreateInOda).toHaveBeenCalledWith(expect.objectContaining({ investigators: [] }));
    });
  });

  test('copies the created clone, with the PI the backend added, to the legacy store', async () => {
    await triggerCloneConfirm();

    await waitFor(() => {
      expect(mockUpdateAppContent2).toHaveBeenLastCalledWith(
        expect.objectContaining({
          title: 'In a galaxy far, far away cloneProposal.suffix',
          abstract: mockRichOriginalProposal.abstract,
          investigators: [backendInjectedPI]
        })
      );
    });
    const [sent] = mockCreateInOda.mock.calls[0];
    expect(mockUpdateAppContent2.mock.lastCall?.[0].id).toBe(sent.prslId);
    expect(mockNavigate).toHaveBeenCalledWith(NAV[0]);
  });

  test('reports a failed clone and stays on the landing page', async () => {
    mockCreateInOda.mockResolvedValue({ error: 'Create failed' });

    await triggerCloneConfirm();

    await waitFor(() => expect(mockNotifyError).toHaveBeenCalledWith('Create failed'));
    expect(mockNavigate).not.toHaveBeenCalledWith(NAV[0]);
    expect(mockNotifySuccess).not.toHaveBeenCalled();
  });

  test('updates validation state with cloned proposal ID after cloning', async () => {
    await triggerCloneConfirm();

    // After confirming the clone, the page statuses are worked out from the clone's values, so
    // that its contents and statuses match
    await waitFor(() => {
      expect(mockValidateFn).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'In a galaxy far, far away cloneProposal.suffix' })
      );
    });
  });
});

// ---- New proposal tests ----

describe('starting a new proposal', () => {
  const policy = (type: string) =>
    ({ cycleInformation: { cycleId: 'SKAO_2027_1' }, type }) as ObservatoryPolicy;

  beforeEach(() => {
    vi.clearAllMocks();
    (isLoggedIn as Mock).mockReturnValue(true);
    (GetProposalList as Mock).mockResolvedValue([]);
    (GetProposalAccessForUser as Mock).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const startProposal = (type: string) => {
    mockPolicy.current = policy(type);
    fireEvent.click(screen.getByTestId('addSubmissionButton'));
    fireEvent.click(screen.getByTestId('cycleConfirmationButton'));
  };

  test('gives the new proposal its own ID and the selected cycle', () => {
    wrapper(<LandingPage />);
    startProposal('Standard');

    expect(formProbe.getValues('prslId')).toMatch(/^prp-/);
    expect(formProbe.getValues('cycle')).toBe('SKAO_2027_1');
    expect(mockNavigate).toHaveBeenCalledWith(PATH[1]);
  });

  test('sets the type to science verification for an SV cycle', () => {
    wrapper(<LandingPage />);
    startProposal('Science Verification');

    expect(formProbe.getValues('proposalType')).toEqual({
      type: PROPOSAL_TYPE.SCIENCE_VERIFICATION,
      subTypes: []
    });
  });

  // Clears what an earlier proposal left in the form
  test('leaves the type unset for a normal cycle, so the user picks it', () => {
    wrapper(<LandingPage />);
    act(() => {
      formProbe.setValue('title', 'An earlier title');
      formProbe.setValue('proposalType.type', PROPOSAL_TYPE.SCIENCE_VERIFICATION);
    });
    startProposal('Standard');

    expect(formProbe.getValues('proposalType')).toEqual({ type: null, subTypes: [] });
    expect(formProbe.getValues('title')).toBe('');
  });
});
