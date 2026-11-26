import { afterEach, describe, test, expect, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { storageObject, StoreProvider } from '@utils/storage/store';
import LinkingPage from './LinkingPage';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import { FormProvider, useForm, useFormContext, UseFormReturn } from 'react-hook-form';
import { ProposalType } from '@/models/proposals/proposal';
import TestProposalFormProvider from '@/models/proposals/testing/TestProposalFormProvider';
import completeMockStore from '@/utils/MockStore';
import {
  DEFAULT_CONTINUUM_OBSERVATION_LOW,
  PROPOSAL_TYPE,
  SENSITIVITY_STATE,
  STATUS_ERROR
} from '@/utils/constants';
import GetCalibratorList from '@services/axios/get/getCalibratorList/getCalibratorList';
import SensCalcModalMultiple from '@/components/alerts/sensCalcModal/multiple/SensCalcModalMultiple';
import { getProposalFormDefaults, ProposalSeed } from '@/models/proposals/useProposalForm';
import { DATA_PRODUCT_KIND, newDataProduct } from '@/models/proposals/dataProducts';

vi.mock('@ska-telescope/ska-login-page', () => ({ isLoggedIn: () => true }));
vi.mock('@services/axios/get/getCalibratorList/getCalibratorList', () => ({
  default: vi.fn(async () => [])
}));
// The results dialog, to see what the page passes it
vi.mock('@/components/alerts/sensCalcModal/multiple/SensCalcModalMultiple', () => ({
  default: vi.fn(() => null)
}));

const wrapper = (component: React.ReactElement) => {
  const FormWrapper = () => {
    const methods = useForm<ProposalType>({
      defaultValues: getProposalFormDefaults()
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
  id: 'prp-1',
  proposalType: PROPOSAL_TYPE.STANDARD,
  observations: [{ ...DEFAULT_CONTINUUM_OBSERVATION_LOW, id: 'obs-1' }],
  dataProducts: [{ ...newDataProduct(DATA_PRODUCT_KIND.CONTINUUM_IMAGE, 'obs-1'), id: 'sdp-1' }],
  targets: [
    {
      id: 't1',
      name: 'M2',
      kind: 0,
      velocityDefinition: 'RADIO',
      raStr: '21:33:27.020',
      decStr: '-00:49:23.700'
    }
  ],
  targetObservation: [],
  calibrationStrategy: []
} as ProposalSeed;

const linkingTree = (page: React.ReactElement | null) => (
  <StoreProvider>
    <TestProposalFormProvider proposal={linkingProposal}>
      <FormProbe onForm={keepForm} />
      <ThemeA11yProvider>{page}</ThemeA11yProvider>
    </TestProposalFormProvider>
  </StoreProvider>
);

const renderLinking = () => {
  vi.spyOn(storageObject, 'useStore').mockReturnValue({
    ...completeMockStore,
    application: { ...completeMockStore.application, content1: [] }
  } as unknown as ReturnType<typeof storageObject.useStore>);
  return render(linkingTree(<LinkingPage />));
};

const selectObservationAndTickTarget = async () => {
  const observationRows = within(screen.getByTestId('observationDetails')).getAllByRole('row');
  fireEvent.click(within(observationRows[1]).getAllByRole('gridcell')[0]);
  fireEvent.click(within(await screen.findByTestId('linkedTickBox')).getByRole('checkbox'));
};

// Each test renders the whole page, which is slow under coverage
describe('<LinkingPage /> manual linking', { timeout: 15000 }, () => {
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
        dataProductsSDPId: 'sdp-1',
        // The page doesn't calculate the link: the sensitivity service does
        sensitivity: { state: SENSITIVITY_STATE.CALCULATING }
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

  test('leaves the calibration of other observations alone when linking and unlinking', async () => {
    renderLinking();
    const otherStrategy = {
      observatoryDefined: true,
      id: 'cal-2',
      observationIdRef: 'obs-2',
      calibrators: null,
      notes: 'kept'
    };
    act(() => formProbe.setValue('calibrationStrategy', [otherStrategy]));

    await selectObservationAndTickTarget();
    await waitFor(() => {
      expect(formProbe.getValues('calibrationStrategy')).toEqual([
        otherStrategy,
        expect.objectContaining({ observationIdRef: 'obs-1' })
      ]);
    });

    fireEvent.click(within(await screen.findByTestId('linkedTickBox')).getByRole('checkbox'));
    await waitFor(() => {
      expect(formProbe.getValues('targetObservation')).toEqual([]);
    });
    expect(formProbe.getValues('calibrationStrategy')).toEqual([otherStrategy]);
  });

  test("looks up an observation's calibrators again for a target still linked to it", async () => {
    renderLinking();
    await selectObservationAndTickTarget();
    await waitFor(() => expect(formProbe.getValues('calibrationStrategy')).toHaveLength(1));

    // A second target is also linked to the same observation, and the strategy has notes
    const secondTarget = { ...formProbe.getValues('targets')[0], id: 't2', name: 'M3' };
    const secondLink = { observationId: 'obs-1', targetId: 't2', dataProductsSDPId: 'sdp-1' };
    act(() => {
      formProbe.setValue('targets', [...formProbe.getValues('targets'), secondTarget]);
      formProbe.setValue('targetObservation', [
        ...formProbe.getValues('targetObservation'),
        secondLink
      ]);
      formProbe.setValue(
        'calibrationStrategy',
        formProbe.getValues('calibrationStrategy').map((c) => ({ ...c, notes: 'kept' }))
      );
    });
    const calibratorsForM3 = [{ name: 'calibrator for M3' }];
    vi.mocked(GetCalibratorList).mockClear();
    vi.mocked(GetCalibratorList).mockResolvedValueOnce(calibratorsForM3 as never);

    // Unlinking M2 (the first target) leaves M3 linked, so the calibrators are chosen for M3
    const [m2TickBox] = await screen.findAllByTestId('linkedTickBox');
    fireEvent.click(within(m2TickBox).getByRole('checkbox'));
    await waitFor(() => {
      expect(formProbe.getValues('calibrationStrategy')).toEqual([
        expect.objectContaining({
          observationIdRef: 'obs-1',
          calibrators: calibratorsForM3,
          notes: 'kept'
        })
      ]);
    });
    expect(formProbe.getValues('targetObservation')).toEqual([secondLink]);
    expect(GetCalibratorList).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ id: 'obs-1' }),
      expect.objectContaining({ id: 't2' })
    );
  });

  test('keeps calibration notes edited while the calibrators are looked up on unlinking', async () => {
    renderLinking();
    await selectObservationAndTickTarget();
    await waitFor(() => expect(formProbe.getValues('calibrationStrategy')).toHaveLength(1));

    // A second target stays linked, so unlinking M2 looks the calibrators up again
    const secondTarget = { ...formProbe.getValues('targets')[0], id: 't2', name: 'M3' };
    const secondLink = { observationId: 'obs-1', targetId: 't2', dataProductsSDPId: 'sdp-1' };
    act(() => {
      formProbe.setValue('targets', [...formProbe.getValues('targets'), secondTarget]);
      formProbe.setValue('targetObservation', [
        ...formProbe.getValues('targetObservation'),
        secondLink
      ]);
      formProbe.setValue(
        'calibrationStrategy',
        formProbe.getValues('calibrationStrategy').map((c) => ({ ...c, notes: 'old notes' }))
      );
    });
    let resolveCalibrators: (
      value: Awaited<ReturnType<typeof GetCalibratorList>>
    ) => void = () => {};
    vi.mocked(GetCalibratorList).mockImplementationOnce(
      () => new Promise((resolve) => (resolveCalibrators = resolve))
    );
    const [m2TickBox] = await screen.findAllByTestId('linkedTickBox');
    fireEvent.click(within(m2TickBox).getByRole('checkbox'));
    await waitFor(() => expect(formProbe.getValues('targetObservation')).toEqual([secondLink]));

    // The notes are edited while the lookup runs
    act(() =>
      formProbe.setValue(
        'calibrationStrategy',
        formProbe.getValues('calibrationStrategy').map((c) => ({ ...c, notes: 'new notes' }))
      )
    );
    const calibratorsForM3 = [{ name: 'calibrator for M3' }];
    await act(async () => resolveCalibrators(calibratorsForM3 as never));

    await waitFor(() => {
      expect(formProbe.getValues('calibrationStrategy')).toEqual([
        expect.objectContaining({ calibrators: calibratorsForM3, notes: 'new notes' })
      ]);
    });
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

  test("opens the results of the selected data product's links with their level and error", async () => {
    renderLinking();
    await selectObservationAndTickTarget();
    await waitFor(() => expect(formProbe.getValues('targetObservation')).toHaveLength(1));
    const [link] = formProbe.getValues('targetObservation');
    act(() =>
      formProbe.setValue('targetObservation', [
        { ...link, sensitivity: { state: SENSITIVITY_STATE.FAILED, error: 'calculator error' } }
      ])
    );

    fireEvent.click(
      within(screen.getByTestId('observationDetails')).getByRole('button', {
        name: 'sensCalc.' + STATUS_ERROR
      })
    );

    await waitFor(() =>
      expect(SensCalcModalMultiple).toHaveBeenLastCalledWith(
        expect.objectContaining({
          observation: expect.objectContaining({ id: 'obs-1' }),
          level: STATUS_ERROR,
          levelError: 'calculator error'
        }),
        undefined
      )
    );
  });
});
