import { afterEach, describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FormProvider } from 'react-hook-form';
import { storageObject, StoreProvider } from '@utils/storage/store';
import { PROPOSAL_TYPE, TYPE_CONTINUUM } from '@utils/constants.ts';
import AddProposal from './AddProposal';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import { useProposalForm } from '@/models/proposals/useProposalForm';
import Proposal from '@/utils/types/proposal';

const FormWrapper = ({ children }: { children: React.ReactNode }) => {
  const { application } = storageObject.useStore();
  const methods = useProposalForm(application.content2 as Proposal);
  return <FormProvider {...methods}>{children}</FormProvider>;
};

const wrapper = (component: React.ReactElement) => {
  return render(component, {
    wrapper: ({ children }) => (
      <StoreProvider>
        <ThemeA11yProvider>
          <FormWrapper>{children}</FormWrapper>
        </ThemeA11yProvider>
      </StoreProvider>
    )
  });
};

const mockOSD = vi.hoisted(() => ({ isSV: false }));

vi.mock('@ska-telescope/ska-login-page', () => ({
  isLoggedIn: () => true
}));

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({
    isSV: mockOSD.isSV,
    osdCycleId: 'CYCLE-1',
    osdCyclePolicy: {
      maxTargets: 1,
      maxObservations: 1
    }
  })
}));

describe('<AddProposal />', () => {
  test('renders correctly', () => {
    wrapper(<AddProposal />);
  });

  test('renders correctly when linking disabled', () => {
    wrapper(<AddProposal />);
  });
});

describe('Create button validation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    mockOSD.isSV = false;
  });

  test.each([PROPOSAL_TYPE.STANDARD, PROPOSAL_TYPE.KEY_SCIENCE, PROPOSAL_TYPE.DIRECTOR_TIME])(
    'requires a valid title and a selected type (%s) for a normal cycle',
    async (type) => {
      const { container } = wrapper(<AddProposal />);
      fireEvent.change(screen.getByTestId('titleId'), {
        target: { value: 'A short valid title' }
      });
      await waitFor(() => expect(screen.getByTestId('nextButtonTestId')).toBeDisabled());

      fireEvent.click(container.querySelector(`#ProposalType-${type}`)!);
      await waitFor(() => expect(screen.getByTestId('nextButtonTestId')).toBeEnabled());

      fireEvent.change(screen.getByTestId('titleId'), { target: { value: '' } });
      await waitFor(() => expect(screen.getByTestId('nextButtonTestId')).toBeDisabled());
    }
  );

  test('uses the SV default without requiring a type selection', async () => {
    mockOSD.isSV = true;
    const { container } = wrapper(<AddProposal />);
    expect(container.querySelector('[id^="ProposalType-"]')).not.toBeInTheDocument();
    expect(screen.getByTestId('nextButtonTestId')).toBeDisabled();

    fireEvent.change(screen.getByTestId('titleId'), {
      target: { value: 'A valid SV title' }
    });
    await waitFor(() => expect(screen.getByTestId('nextButtonTestId')).toBeEnabled());
  });

  test('clears an earlier SV type when starting a new proposal in a normal cycle', async () => {
    mockOSD.isSV = true;
    const { rerender, container } = wrapper(<AddProposal />);
    fireEvent.change(screen.getByTestId('titleId'), {
      target: { value: 'An SV title' }
    });
    await waitFor(() => expect(screen.getByTestId('nextButtonTestId')).toBeEnabled());

    rerender(<></>);
    mockOSD.isSV = false;
    rerender(<AddProposal />);
    expect(screen.getByTestId('titleId')).toHaveValue('');

    fireEvent.change(screen.getByTestId('titleId'), {
      target: { value: 'A normal proposal title' }
    });
    await waitFor(() => expect(screen.getByTestId('nextButtonTestId')).toBeDisabled());
    fireEvent.click(container.querySelector(`#ProposalType-${PROPOSAL_TYPE.STANDARD}`)!);
    await waitFor(() => expect(screen.getByTestId('nextButtonTestId')).toBeEnabled());
  });
});

describe('new proposal type', () => {
  const originalUseStore = storageObject.useStore;
  // A single store object, so TitleEntry's effect on application.content2 doesn't re-run every render
  const mockStore = {
    application: { content1: [], content2: {} },
    updateAppContent1: vi.fn(),
    updateAppContent2: vi.fn()
  };

  afterEach(() => {
    storageObject.useStore = originalUseStore;
    mockOSD.isSV = false;
    vi.clearAllMocks();
  });

  test('is set to science verification for an SV cycle', () => {
    mockOSD.isSV = true;
    storageObject.useStore = () => mockStore as any;
    wrapper(<AddProposal />);
    expect(mockStore.updateAppContent2).toHaveBeenCalledWith(
      expect.objectContaining({ proposalType: PROPOSAL_TYPE.SCIENCE_VERIFICATION })
    );
  });

  test('is left unset for a normal cycle, so the user picks it', () => {
    storageObject.useStore = () => mockStore as any;
    wrapper(<AddProposal />);
    expect(mockStore.updateAppContent2).toHaveBeenCalledWith(
      expect.objectContaining({ proposalType: undefined })
    );
  });
});

describe('new proposal observation', () => {
  const originalUseStore = storageObject.useStore;
  const mockStore = {
    application: { content1: [], content2: {} },
    updateAppContent1: vi.fn(),
    updateAppContent2: vi.fn()
  };

  afterEach(() => {
    storageObject.useStore = originalUseStore;
    mockOSD.isSV = false;
    vi.clearAllMocks();
  });

  test('is a default continuum observation with its data products for an SV cycle', () => {
    mockOSD.isSV = true;
    storageObject.useStore = () => mockStore as any;
    wrapper(<AddProposal />);

    const proposal = mockStore.updateAppContent2.mock.calls[0][0];
    expect(proposal.observations).toHaveLength(1);
    expect(proposal.observations[0].type).toBe(TYPE_CONTINUUM);
    // Continuum has an images data product plus a hidden visibilities one
    expect(proposal.dataProductSDP).toHaveLength(2);
    proposal.dataProductSDP.forEach((dataProduct: { observationId: string }) =>
      expect(dataProduct.observationId).toBe(proposal.observations[0].id)
    );
    expect(proposal.scienceCategory).toBeNull();
  });

  test('is not created for a normal cycle', () => {
    storageObject.useStore = () => mockStore as any;
    wrapper(<AddProposal />);

    const proposal = mockStore.updateAppContent2.mock.calls[0][0];
    expect(proposal.observations).toEqual([]);
    expect(proposal.dataProductSDP).toEqual([]);
  });
});
