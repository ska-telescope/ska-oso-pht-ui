import { afterEach, describe, expect, test, vi } from 'vitest';
import ProposalFormProvider from '@/models/proposals/ProposalFormProvider';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useFormContext, UseFormReturn } from 'react-hook-form';
import { ProposalType } from '@/models/proposals/proposal';
import '@testing-library/jest-dom';
import { storageObject, StoreProvider } from '@utils/storage/store';
import ObservationPage from './ObservationPage';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import { DEFAULT_CONTINUUM_OBSERVATION_LOW, PROPOSAL_TYPE } from '@/utils/constants';
import completeMockStore from '@/utils/MockStore';

// Exposes the global form, which holds the links and calibration
let formProbe: UseFormReturn<ProposalType>;
const FormProbe = ({ onForm }: { onForm: (form: UseFormReturn<ProposalType>) => void }) => {
  onForm(useFormContext<ProposalType>());
  return null;
};
const keepForm = (form: UseFormReturn<ProposalType>) => {
  formProbe = form;
};

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ProposalFormProvider>
        <FormProbe onForm={keepForm} />
        <ThemeA11yProvider>{component}</ThemeA11yProvider>
      </ProposalFormProvider>
    </StoreProvider>
  );
};
const mockOSD = vi.hoisted(() => ({ maxObservations: 1 }));
vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({
    autoLink: true,
    osdCycleId: 'CYCLE-1',
    osdCyclePolicy: {
      maxTargets: 1,
      maxObservations: mockOSD.maxObservations
    }
  })
}));
vi.mock('react-router', () => ({ useNavigate: () => vi.fn() }));
vi.mock('../../components/layout/Shell/Shell', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));
vi.mock('../entry/ObservationEntry/ObservationEntry', () => ({
  default: () => <div data-testid="observationEntryStub" />
}));

const renderWithProposal = (proposal: object) => {
  vi.spyOn(storageObject, 'useStore').mockReturnValue({
    ...completeMockStore,
    application: {
      ...completeMockStore.application,
      content1: [],
      content2: { id: 'prsl-1', targets: [], targetObservation: [], ...proposal }
    }
  } as any);
  wrapper(<ObservationPage />);
};

describe('<ObservationPage />', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    mockOSD.maxObservations = 1;
  });

  test('renders correctly', () => {
    wrapper(<ObservationPage />);
  });

  test('shows the observation when there is no target yet', () => {
    renderWithProposal({
      proposalType: PROPOSAL_TYPE.SCIENCE_VERIFICATION,
      observations: [{ ...DEFAULT_CONTINUUM_OBSERVATION_LOW, id: 'obs-1' }]
    });

    expect(screen.getByTestId('observationEntryStub')).toBeInTheDocument();
    expect(screen.queryByTestId('noObservationsNotification')).not.toBeInTheDocument();
  });

  test('shows the same no-observation message for every proposal type', () => {
    renderWithProposal({ proposalType: PROPOSAL_TYPE.SCIENCE_VERIFICATION, observations: [] });

    expect(screen.queryByTestId('observationEntryStub')).not.toBeInTheDocument();
    expect(screen.getByText('error.noObservations')).toBeInTheDocument();
  });

  test('deleting an observation removes its links and calibration', async () => {
    mockOSD.maxObservations = 10;
    const strategy = (observationIdRef: string) => ({
      observatoryDefined: true,
      id: `cal-${observationIdRef}`,
      observationIdRef,
      calibrators: null,
      notes: null
    });
    renderWithProposal({
      proposalType: PROPOSAL_TYPE.STANDARD,
      observations: [
        { ...DEFAULT_CONTINUUM_OBSERVATION_LOW, id: 'obs-1' },
        { ...DEFAULT_CONTINUUM_OBSERVATION_LOW, id: 'obs-2' }
      ],
      targets: [{ id: 't1', name: 'M2', kind: 0 }],
      targetObservation: [
        { targetId: 't1', observationId: 'obs-1', dataProductsSDPId: 'sdp-1' },
        { targetId: 't1', observationId: 'obs-2', dataProductsSDPId: 'sdp-2' }
      ],
      calibrationStrategy: [strategy('obs-1'), strategy('obs-2')]
    });

    fireEvent.click(within(screen.getAllByTestId('trashIcon')[0]).getByRole('button'));
    fireEvent.click(await screen.findByTestId('dialogConfirmationButton'));

    await waitFor(() => {
      expect(formProbe.getValues('targetObservation')).toEqual([
        { targetId: 't1', observationId: 'obs-2', dataProductsSDPId: 'sdp-2' }
      ]);
    });
    expect(formProbe.getValues('calibrationStrategy')).toEqual([strategy('obs-2')]);
    expect(formProbe.getValues('targets')).toEqual([{ id: 't1', name: 'M2', kind: 0 }]);
  });
});
