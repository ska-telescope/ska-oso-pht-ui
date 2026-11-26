import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { storageObject, StoreProvider } from '@utils/storage/store';
import { useNavigate } from 'react-router';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import PostProposal from '@services/axios/post/postProposal/postProposal.tsx';
import { MockProposalBackend } from '@services/axios/get/getProposal/mockProposalBackend';
import PageFooterPPT from './PageFooterPPT';
import { NEW_PROPOSAL_ACCESS } from '@/utils/types/proposalAccess';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import {
  NAV,
  PAGE_OBSERVATION,
  PAGE_TARGET,
  PROPOSAL_SUBTYPE,
  PROPOSAL_TYPE,
  TYPE_CONTINUUM,
  type ProposalTypeType
} from '@/utils/constants';
import { ProposalType, getProposalResolver } from '@/models/proposals/proposal';
import { getProposalFormDefaults } from '@/models/proposals/useProposalForm';

// --- Additional mocks ---
const mockNotifyError = vi.hoisted(() => vi.fn());
vi.mock('@/utils/notify/useNotify', () => ({
  useNotify: () => ({
    notifyError: mockNotifyError,
    notifySuccess: vi.fn(),
    notifyWarning: vi.fn()
  })
}));

// --- Existing mocks ---
vi.mock('react-router', () => ({
  useNavigate: vi.fn()
}));

vi.mock('@ska-telescope/ska-login-page', () => ({
  isLoggedIn: vi.fn(() => true)
}));

const mockOSD = vi.hoisted(() => ({ isSV: false }));

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({
    isSV: mockOSD.isSV,
    osdCycleId: 'CYCLE-1',
    osdLOW: { basicCapabilities: { minElevationDeg: 15 } },
    osdCyclePolicy: {
      maxTargets: 1,
      maxObservations: 1
    }
  })
}));

vi.mock('@services/axios/post/postProposal/postProposal.tsx', () => ({
  default: vi.fn()
}));

vi.mock('@/services/axios/axiosAuthClient/axiosAuthClient', () => ({
  default: () => ({ axiosClient: {}, refreshAuthToken: vi.fn() })
}));

// --- Setup ---
const mockNavigate = vi.fn();
(useNavigate as unknown as Mock).mockReturnValue(mockNavigate);

const mockProposal = {
  id: 123,
  title: 'Test Proposal',
  proposalType: PROPOSAL_TYPE.STANDARD
};
const mockAccess = [NEW_PROPOSAL_ACCESS];

const mockNotification = {
  level: AlertColorTypes.Error,
  message: 'Test message',
  delay: 3000,
  okRequired: false
};

(PostProposal as unknown as Mock).mockResolvedValue(MockProposalBackend);

beforeEach(() => {
  vi.clearAllMocks();
  mockOSD.isSV = false;

  storageObject.useStore = () =>
    ({
      application: {
        content2: mockProposal,
        content4: mockAccess,
        content5: mockNotification,
        content1: {},
        content6: {},
        content7: {},
        content8: {},
        content9: {}
      },

      updateAppContent2: vi.fn(),
      updateAppContent4: vi.fn()
    }) as any;
});

// The form of the last render, to check what the component left in it
let currentForm: UseFormReturn<ProposalType>;

const wrapper = (
  component: React.ReactElement,
  title = mockProposal.title,
  formValues: Partial<ProposalType> = {}
) => {
  const FormWrapper = () => {
    const methods = useForm<ProposalType>({
      mode: 'all',
      resolver: getProposalResolver(),
      defaultValues: {
        ...getProposalFormDefaults(),
        title,
        proposalType: { type: PROPOSAL_TYPE.STANDARD, subTypes: [] },
        abstract: '',
        scienceCategory: null,
        ...formValues
      }
    });
    currentForm = methods;
    return (
      <StoreProvider>
        <ThemeA11yProvider>
          <FormProvider {...methods}>{component}</FormProvider>
        </ThemeA11yProvider>
      </StoreProvider>
    );
  };
  return render(<FormWrapper />);
};

// --- Tests ---
describe('PageFooterPPT', () => {
  it('renders next button on a normal page', () => {
    wrapper(<PageFooterPPT pageNo={1} />);
    expect(screen.getByTestId('nextButtonTestId')).toBeInTheDocument();
  });

  it('hides previous button on first page', () => {
    wrapper(<PageFooterPPT pageNo={0} />);
    expect(screen.queryByTestId('prevButtonTestId')).not.toBeInTheDocument();
  });

  it('disables next button when buttonDisabled is true', () => {
    wrapper(<PageFooterPPT pageNo={1} buttonDisabled />);
    expect(screen.getByTestId('nextButtonTestId')).toBeDisabled();
  });

  it('allows creating a proposal from Title before the required abstract is filled', async () => {
    wrapper(<PageFooterPPT pageNo={-1} />);
    await waitFor(() => expect(screen.getByTestId('nextButtonTestId')).toBeEnabled());
    fireEvent.click(screen.getByTestId('nextButtonTestId'));

    await waitFor(() => {
      expect(PostProposal).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  it('puts the PI the backend added in the form', async () => {
    const creator = {
      id: 'creator-account-id',
      status: 'accepted',
      phdThesis: false,
      pi: true
    };
    (PostProposal as unknown as Mock).mockResolvedValueOnce({
      ...MockProposalBackend,
      investigators: [creator]
    });
    wrapper(<PageFooterPPT pageNo={-1} />);
    await waitFor(() => expect(screen.getByTestId('nextButtonTestId')).toBeEnabled());
    fireEvent.click(screen.getByTestId('nextButtonTestId'));

    await waitFor(() => expect(currentForm.getValues('investigators')).toEqual([creator]));
  });

  it('creates the proposal with its own ID, type and cycle', async () => {
    const newProposal = { id: null, title: 'New SV idea' };
    const store = storageObject.useStore();
    storageObject.useStore = () =>
      ({
        ...store,
        application: { ...store.application, content2: newProposal }
      }) as any;

    wrapper(<PageFooterPPT pageNo={-1} />, newProposal.title, {
      prslId: 'prsl-t0001-20261120-00001',
      cycle: 'CYCLE-1',
      proposalType: { type: PROPOSAL_TYPE.SCIENCE_VERIFICATION, subTypes: [] }
    });
    await waitFor(() => expect(screen.getByTestId('nextButtonTestId')).toBeEnabled());
    fireEvent.click(screen.getByTestId('nextButtonTestId'));

    await waitFor(() => {
      expect(PostProposal).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          id: 'prsl-t0001-20261120-00001',
          title: newProposal.title,
          proposalType: PROPOSAL_TYPE.SCIENCE_VERIFICATION,
          abstract: '',
          scienceCategory: null,
          investigators: [],
          cycle: 'CYCLE-1'
        }),
        'draft'
      );
    });
  });

  describe('a new proposal observation', () => {
    const createProposal = async (type: ProposalTypeType) => {
      const newProposal = { id: null, title: 'New idea' };
      const store = storageObject.useStore();
      storageObject.useStore = () =>
        ({ ...store, application: { ...store.application, content2: newProposal } }) as any;
      wrapper(<PageFooterPPT pageNo={-1} />, newProposal.title, {
        proposalType: { type, subTypes: [] }
      });
      await waitFor(() => expect(screen.getByTestId('nextButtonTestId')).toBeEnabled());
      fireEvent.click(screen.getByTestId('nextButtonTestId'));
      await waitFor(() => expect(PostProposal).toHaveBeenCalled());
      return vi.mocked(PostProposal).mock.calls[0][2];
    };

    it('is a default continuum observation with its data products for an SV proposal', async () => {
      const proposal = await createProposal(PROPOSAL_TYPE.SCIENCE_VERIFICATION);

      expect(proposal.observations).toEqual([expect.objectContaining({ type: TYPE_CONTINUUM })]);
      // Continuum has an images data product plus a hidden visibilities one
      expect(proposal.dataProducts).toEqual([
        expect.objectContaining({ observationId: proposal.observations?.[0].id }),
        expect.objectContaining({ observationId: proposal.observations?.[0].id })
      ]);
      // The form has them too, once the proposal is created
      await waitFor(() =>
        expect(currentForm.getValues('observations')).toEqual([
          expect.objectContaining({ id: proposal.observations?.[0].id })
        ])
      );
      expect(currentForm.getValues('dataProducts')).toEqual(proposal.dataProducts);
    });

    it('is not created for other proposals', async () => {
      const proposal = await createProposal(PROPOSAL_TYPE.STANDARD);

      expect(proposal.observations).toEqual([]);
      expect(proposal.dataProducts).toEqual([]);
    });
  });

  it('disables Create when the title has RHF validation errors', async () => {
    const store = storageObject.useStore();
    storageObject.useStore = () => ({
      ...store,
      application: {
        ...store.application,
        content2: { id: null, title: 'Invalid @ title' }
      }
    });

    wrapper(<PageFooterPPT pageNo={-1} />, 'Invalid @ title');
    await waitFor(() => expect(screen.getByTestId('nextButtonTestId')).toBeDisabled());
    fireEvent.click(screen.getByTestId('nextButtonTestId'));

    expect(PostProposal).not.toHaveBeenCalled();
    expect(mockNotifyError).not.toHaveBeenCalled();
  });

  it('creates with the latest form title, type and sub-types rather than stale store values', async () => {
    wrapper(<PageFooterPPT pageNo={-1} />, 'Edited title', {
      proposalType: { type: PROPOSAL_TYPE.KEY_SCIENCE, subTypes: [PROPOSAL_SUBTYPE.JOINT] }
    });
    await waitFor(() => expect(screen.getByTestId('nextButtonTestId')).toBeEnabled());
    fireEvent.click(screen.getByTestId('nextButtonTestId'));

    await waitFor(() =>
      expect(PostProposal).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          title: 'Edited title',
          proposalType: PROPOSAL_TYPE.KEY_SCIENCE,
          proposalSubType: [PROPOSAL_SUBTYPE.JOINT]
        }),
        'draft'
      )
    );
  });

  // The form holds an unselected type as null
  it('disables Create when the form has no proposal type', async () => {
    wrapper(<PageFooterPPT pageNo={-1} />, mockProposal.title, {
      proposalType: { type: null, subTypes: [] }
    });
    await waitFor(() => expect(screen.getByTestId('nextButtonTestId')).toBeDisabled());
    fireEvent.click(screen.getByTestId('nextButtonTestId'));

    expect(PostProposal).not.toHaveBeenCalled();
  });

  it('navigates to next page when next button clicked', async () => {
    wrapper(<PageFooterPPT pageNo={1} />);
    fireEvent.click(screen.getByTestId('nextButtonTestId'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  it('moves on from the Target page of an SV proposal without a target', async () => {
    mockOSD.isSV = true;
    wrapper(<PageFooterPPT pageNo={PAGE_TARGET} />);
    fireEvent.click(screen.getByTestId('nextButtonTestId'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(NAV[PAGE_OBSERVATION]);
    });
  });

  it('navigates to previous page when prev button clicked', async () => {
    wrapper(<PageFooterPPT pageNo={2} />);
    fireEvent.click(screen.getByTestId('prevButtonTestId'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  it('uses correct label for next button', () => {
    wrapper(<PageFooterPPT pageNo={2} />);
    expect(screen.getByTestId('nextButtonTestId').textContent).toContain('page.');
  });

  it('uses correct label for prev button', () => {
    wrapper(<PageFooterPPT pageNo={2} />);
    expect(screen.getByTestId('prevButtonTestId').textContent).toContain('page.');
  });
});
