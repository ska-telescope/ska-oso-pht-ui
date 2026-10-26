import { afterEach, describe, expect, test, vi } from 'vitest';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { storageObject, StoreProvider } from '@utils/storage/store';
import { PROPOSAL_TYPE, TYPE_CONTINUUM } from '@utils/constants.ts';
import AddProposal from './AddProposal';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import { getProposalSchema, ProposalType } from '@/models/proposals/proposal';

const FormWrapper = ({ children, title }: { children: React.ReactNode; title: string }) => {
  const methods = useForm<ProposalType>({
    mode: 'all',
    resolver: zodResolver(getProposalSchema()),
    defaultValues: { title }
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

const wrapper = (component: React.ReactElement, title = '') => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>
        <FormWrapper title={title}>{component}</FormWrapper>
      </ThemeA11yProvider>
    </StoreProvider>
  );
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
  });

  test('Create button is enabled for a valid title without gating on proposal type', async () => {
    const { result, unmount } = renderHook(() => storageObject.useStore(), {
      wrapper: StoreProvider
    });
    const store = result.current;
    unmount();
    vi.spyOn(storageObject, 'useStore').mockReturnValue({
      ...store,
      application: {
        ...store.application,
        content1: [],
        content2: {
          id: null,
          title: 'A short valid title',
          proposalType: undefined,
          proposalSubType: []
        }
      }
    });

    wrapper(<AddProposal />, 'A short valid title');
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
