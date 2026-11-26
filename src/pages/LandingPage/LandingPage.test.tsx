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
import {
  NAV,
  PATH,
  PROPOSAL_STATUS,
  PROPOSAL_TYPE,
  REFERENCE_COORDINATE_TYPE_ICRS,
  TMP_REVIEWER_ID,
  VELOCITY_DEFINITION
} from '@/utils/constants';
import { ProposalAccess } from '@/utils/types/proposalAccess';
import { PROPOSAL_ACCESS_PERMISSIONS, PROPOSAL_ROLE_PI } from '@/utils/aaa/aaaUtils';
import Proposal from '@/utils/types/proposal';
import { FormProvider, useForm, useFormContext, UseFormReturn } from 'react-hook-form';
import { ProposalType } from '@/models/proposals/proposal';
import type { ApiResult } from '@/services/axios/apiResult/apiResult';
import { getProposalFormDefaults } from '@/models/proposals/useProposalForm';
import { newSvObservation, OBSERVING_MODE } from '@/models/proposals/observations';
import { DATA_PRODUCT_KIND, newDataProduct } from '@/models/proposals/dataProducts';
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
  default: ({ cloneFunction, editFunction, viewFunction, data }: any) =>
    data.map((item: any) => (
      <div key={item.id}>
        <button data-testid="viewIcon" onClick={() => viewFunction(item.id)}>
          View
        </button>
        <button data-testid="cloneIcon" onClick={() => cloneFunction(item.id)}>
          Clone
        </button>
        <button data-testid="editIcon" onClick={() => editFunction(item.id)}>
          Edit
        </button>
      </div>
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

  const originalInvestigators = [
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
  ];

  // The original in the proposal list, which still holds legacy proposals
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
    investigators: originalInvestigators,
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

  // The same original as the form holds it once loaded
  const originalValues = (): ProposalType => ({
    ...getProposalFormDefaults(),
    prslId: ORIGINAL_PROPOSAL_ID,
    title: 'In a galaxy far, far away',
    cycle: 'SKA_5000_2023',
    proposalType: {
      type: PROPOSAL_TYPE.STANDARD,
      subTypes: ['coordinated_proposal']
    },
    abstract: 'Detailed science abstract about the cosmos and beyond',
    investigators: originalInvestigators,
    targets: [
      {
        id: 'target-1',
        name: 'NGC 1275',
        kind: REFERENCE_COORDINATE_TYPE_ICRS.value,
        raStr: '03:19:48',
        decStr: '+41:30:42',
        velocityDefinition: VELOCITY_DEFINITION.RADIO
      }
    ],
    observations: [{ ...newSvObservation(OBSERVING_MODE.CONTINUUM, 15), id: 'obs-1' }],
    dataProducts: [{ ...newDataProduct(DATA_PRODUCT_KIND.CONTINUUM_IMAGE, 'obs-1'), id: 'dp-1' }],
    calibrationStrategy: [],
    targetObservation: [],
    sciencePDF: null,
    technicalPDF: null
  });

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
    // Returns the proposal as the backend creates it, as sent with the caller added as PI, and
    // opens it in the form, as the real createInOda does
    mockCreateInOda.mockImplementation(async (values: ProposalType) => {
      const created = { ...values, investigators: [backendInjectedPI] };
      formProbe.reset(created);
      return { data: created };
    });
    (GetProposalList as Mock).mockResolvedValue([mockRichOriginalProposal]);
    (GetProposalAccessForUser as Mock).mockResolvedValue(mockAccessList);

    vi.spyOn(storageObject, 'useStore').mockReturnValue({
      application: {
        content1: [],
        content4: mockAccessList,
        content5: null,
        content6: {},
        content7: {},
        content8: {},
        content9: {}
      },
      updateAppContent1: mockUpdateAppContent1,
      updateAppContent4: mockUpdateAppContent4,
      updateAppContent5: vi.fn()
    } as any);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test('scrolls to the top when opening a proposal for editing', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    wrapper(<LandingPage />);

    fireEvent.click(await screen.findByTestId('editIcon'));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(NAV[0]));
    expect(mockLoadFromOda).toHaveBeenCalledWith(ORIGINAL_PROPOSAL_ID, expect.any(Function));
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  test.each(['editIcon', 'viewIcon', 'cloneIcon'])(
    'rejects overlapping proposal loads while %s is pending',
    async (firstAction) => {
      const secondProposal = { ...mockRichOriginalProposal, id: 'prp-2' };
      (GetProposalList as Mock).mockResolvedValue([mockRichOriginalProposal, secondProposal]);
      let finishLoad!: (result: ApiResult<ProposalType>) => void;
      mockLoadFromOda.mockImplementationOnce(
        () => new Promise<ApiResult<ProposalType>>((resolve) => (finishLoad = resolve))
      );
      vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
      const alert = vi.fn();
      vi.stubGlobal('alert', alert);
      wrapper(<LandingPage />);

      fireEvent.click((await screen.findAllByTestId(firstAction))[0]);
      fireEvent.click(screen.getAllByTestId('editIcon')[1]);
      fireEvent.click(screen.getAllByTestId('viewIcon')[1]);
      fireEvent.click(screen.getAllByTestId('cloneIcon')[1]);

      expect(mockLoadFromOda).toHaveBeenCalledTimes(1);
      expect(mockLoadFromOda).toHaveBeenCalledWith(ORIGINAL_PROPOSAL_ID, expect.any(Function));
      expect(alert).not.toHaveBeenCalled();

      // The one load still completes, and its page statuses are set from it
      finishLoad({ data: originalValues() });
      await waitFor(() => expect(mockUpdateAppContent1).toHaveBeenCalled());
    }
  );

  test('ignores a pending proposal load that finishes after leaving the page', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const alert = vi.fn();
    vi.stubGlobal('alert', alert);
    let finishLoad!: (result: ApiResult<ProposalType>) => void;
    mockLoadFromOda.mockImplementationOnce(
      () => new Promise<ApiResult<ProposalType>>((resolve) => (finishLoad = resolve))
    );
    const { unmount } = wrapper(<LandingPage />);

    fireEvent.click(await screen.findByTestId('editIcon'));
    await waitFor(() => expect(mockLoadFromOda).toHaveBeenCalledTimes(1));
    mockUpdateAppContent1.mockClear();

    unmount();
    expect(mockLoadFromOda.mock.calls[0][1]()).toBe(false);
    finishLoad({ data: originalValues() });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockUpdateAppContent1).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalled();
    expect(alert).not.toHaveBeenCalled();
  });

  test('does not scroll or navigate when loading the proposal fails', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const alert = vi.fn();
    vi.stubGlobal('alert', alert);
    mockLoadFromOda.mockResolvedValue({ error: 'Unable to load proposal' });
    wrapper(<LandingPage />);

    fireEvent.click(await screen.findByTestId('editIcon'));

    await waitFor(() => expect(alert).toHaveBeenCalled());
    expect(scrollTo).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('keeps proposals available after a failed load and clears the error on retry', async () => {
    const secondProposal = { ...mockRichOriginalProposal, id: 'prp-2' };
    (GetProposalList as Mock).mockResolvedValue([mockRichOriginalProposal, secondProposal]);
    mockLoadFromOda
      .mockResolvedValueOnce({ error: 'Unable to load proposal' })
      .mockResolvedValueOnce({ data: { ...originalValues(), prslId: secondProposal.id } });
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    vi.stubGlobal('alert', vi.fn());
    wrapper(<LandingPage />);

    const editButtons = await screen.findAllByTestId('editIcon');
    fireEvent.click(editButtons[0]);

    expect(await screen.findByTestId('axiosViewErrorTestId')).toHaveTextContent(
      'Unable to load proposal'
    );
    expect(screen.getAllByTestId('editIcon')).toHaveLength(2);

    fireEvent.click(screen.getAllByTestId('editIcon')[1]);

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(NAV[0]));
    expect(mockLoadFromOda).toHaveBeenLastCalledWith('prp-2', expect.any(Function));
    expect(screen.queryByTestId('axiosViewErrorTestId')).not.toBeInTheDocument();
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

  test('scrolls to the top when the cloned proposal opens', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    await triggerCloneConfirm();

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(NAV[0]));
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

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

  test('opens the created clone, with the PI the backend added, on the Title page', async () => {
    await triggerCloneConfirm();

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(NAV[0]));
    const [sent] = mockCreateInOda.mock.calls[0];
    expect(formProbe.getValues()).toMatchObject({
      prslId: sent.prslId,
      title: 'In a galaxy far, far away cloneProposal.suffix',
      abstract: mockRichOriginalProposal.abstract,
      investigators: [backendInjectedPI]
    });
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
