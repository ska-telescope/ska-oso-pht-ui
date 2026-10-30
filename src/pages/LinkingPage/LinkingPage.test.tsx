import { afterEach, describe, test, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { storageObject, StoreProvider } from '@utils/storage/store';
import LinkingPage, { isNonGaussianSensitivityCase } from './LinkingPage';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import { FormProvider, useForm, useFormContext, UseFormReturn } from 'react-hook-form';
import { ProposalType } from '@/models/proposals/proposal';
import ProposalFormProvider from '@/models/proposals/ProposalFormProvider';
import completeMockStore from '@/utils/MockStore';
import { DEFAULT_CONTINUUM_OBSERVATION_LOW, PROPOSAL_TYPE, STATUS_OK } from '@/utils/constants';

vi.mock('@ska-telescope/ska-login-page', () => ({ isLoggedIn: () => true }));
vi.mock(
  '@services/axios/get/getSensitivityCalculator/sensitivityCalculator/getSensitivityCalculatorAPIData.ts',
  () => ({ default: vi.fn(async () => ({ statusGUI: STATUS_OK, error: '' })) })
);
vi.mock('@services/axios/get/getCalibratorList/getCalibratorList', () => ({
  default: vi.fn(async () => [])
}));

const wrapper = (component: React.ReactElement) => {
  const FormWrapper = () => {
    const methods = useForm<ProposalType>({
      defaultValues: { title: '', proposalType: null }
    });
    return (
      <StoreProvider>
        <FormProvider {...methods}>
          <ThemeA11yProvider>{component}</ThemeA11yProvider>
        </FormProvider>
      </StoreProvider>
    );
  };
  return render(<FormWrapper />);
};

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({
    osdCycleId: 'SKAO_2027_1',
    osdCycleDescription: 'Science Verification',
    osdOpens: () => '27-03-2026 12:00:00',
    osdCloses: () => '12-05-2026 04:00:00',
    osdCyclePolicy: {
      maxTargets: 1,
      maxObservations: 1
    }
  })
}));

describe('<LinkingPage />', () => {
  test('renders correctly with default values', () => {
    wrapper(<LinkingPage />);
  });

  test('treats Briggs robust=2 as non-Gaussian while leaving uniform alone', () => {
    expect(isNonGaussianSensitivityCase({ subarray: 'AA4', weighting: 2, robust: 2 })).toBe(true);
    expect(isNonGaussianSensitivityCase({ subarray: 'AA4', weighting: 1, robust: 2 })).toBe(false);
    expect(isNonGaussianSensitivityCase({ subarray: 'AA4', weighting: 0, robust: 0 })).toBe(true);
  });
});

// Exposes the global form, which holds the targets, links and calibration
let formProbe: UseFormReturn<ProposalType>;
const FormProbe = ({ onForm }: { onForm: (form: UseFormReturn<ProposalType>) => void }) => {
  onForm(useFormContext<ProposalType>());
  return null;
};
const keepForm = (form: UseFormReturn<ProposalType>) => {
  formProbe = form;
};

const linkingProposal = {
  id: 'prsl-1',
  proposalType: PROPOSAL_TYPE.STANDARD,
  observations: [{ ...DEFAULT_CONTINUUM_OBSERVATION_LOW, id: 'obs-1' }],
  dataProductSDP: [{ id: 'sdp-1', observationId: 'obs-1', data: {} }],
  targets: [{ id: 't1', name: 'M2', kind: 0, raStr: '21:33:27.020', decStr: '-00:49:23.700' }],
  targetObservation: [],
  calibrationStrategy: []
};

const linkingTree = (page: React.ReactElement | null) => (
  <StoreProvider>
    <ProposalFormProvider>
      <FormProbe onForm={keepForm} />
      <ThemeA11yProvider>{page}</ThemeA11yProvider>
    </ProposalFormProvider>
  </StoreProvider>
);

const renderLinking = () => {
  vi.spyOn(storageObject, 'useStore').mockReturnValue({
    ...completeMockStore,
    application: { ...completeMockStore.application, content1: [], content2: linkingProposal }
  } as unknown as ReturnType<typeof storageObject.useStore>);
  return render(linkingTree(<LinkingPage />));
};

const selectObservationAndTickTarget = async () => {
  const observationRows = within(screen.getByTestId('observationDetails')).getAllByRole('row');
  fireEvent.click(within(observationRows[1]).getAllByRole('gridcell')[0]);
  fireEvent.click(within(await screen.findByTestId('linkedTickBox')).getByRole('checkbox'));
};

describe('<LinkingPage /> manual linking', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('links a target to the selected observation with a calibration, and unlinks it', async () => {
    renderLinking();

    await selectObservationAndTickTarget();

    await waitFor(() => {
      expect(formProbe.getValues('calibrationStrategy')).toHaveLength(1);
    });
    expect(formProbe.getValues('targetObservation')).toEqual([
      expect.objectContaining({
        targetId: 't1',
        observationId: 'obs-1',
        dataProductsSDPId: 'sdp-1'
      })
    ]);
    expect(formProbe.getValues('calibrationStrategy')[0]).toEqual(
      expect.objectContaining({ observationIdRef: 'obs-1', observatoryDefined: true })
    );

    // Unticking removes the link and its calibration
    fireEvent.click(within(await screen.findByTestId('linkedTickBox')).getByRole('checkbox'));

    await waitFor(() => {
      expect(formProbe.getValues('targetObservation')).toEqual([]);
    });
    expect(formProbe.getValues('calibrationStrategy')).toEqual([]);
  });

  test('keeps the link after leaving the page and coming back', async () => {
    const { rerender } = renderLinking();
    await selectObservationAndTickTarget();
    await waitFor(() => expect(formProbe.getValues('targetObservation')).toHaveLength(1));

    rerender(linkingTree(null));
    rerender(linkingTree(<LinkingPage />));

    const observationRows = within(screen.getByTestId('observationDetails')).getAllByRole('row');
    fireEvent.click(within(observationRows[1]).getAllByRole('gridcell')[0]);
    expect(within(await screen.findByTestId('linkedTickBox')).getByRole('checkbox')).toBeChecked();
    expect(formProbe.getValues('targetObservation')).toHaveLength(1);
  });
});
