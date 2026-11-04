import { afterEach, describe, test, expect, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { storageObject, StoreProvider } from '@utils/storage/store';
import LinkingPage, { isNonGaussianSensitivityCase } from './LinkingPage';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import { FormProvider, useForm, useFormContext, UseFormReturn } from 'react-hook-form';
import { ProposalType } from '@/models/proposals/proposal';
import ProposalFormProvider from '@/models/proposals/ProposalFormProvider';
import completeMockStore from '@/utils/MockStore';
import { DEFAULT_CONTINUUM_OBSERVATION_LOW, PROPOSAL_TYPE, STATUS_OK } from '@/utils/constants';
import getSensCalc from '@services/axios/get/getSensitivityCalculator/sensitivityCalculator/getSensitivityCalculatorAPIData.ts';
import GetCalibratorList from '@services/axios/get/getCalibratorList/getCalibratorList';

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

  test('requests the sensitivity of a new link once while the page re-renders', async () => {
    vi.mocked(getSensCalc).mockClear();
    let resolveSensCalc: (value: Awaited<ReturnType<typeof getSensCalc>>) => void = () => {};
    vi.mocked(getSensCalc).mockImplementationOnce(
      () => new Promise((resolve) => (resolveSensCalc = resolve))
    );
    renderLinking();

    await selectObservationAndTickTarget();
    await waitFor(() => expect(getSensCalc).toHaveBeenCalledTimes(1));

    // Another change to the watched slices re-runs the effect while the request is pending
    act(() =>
      formProbe.setValue(
        'calibrationStrategy',
        formProbe.getValues('calibrationStrategy').map((c) => ({ ...c, notes: 'edited' }))
      )
    );
    expect(getSensCalc).toHaveBeenCalledTimes(1);

    await act(async () => resolveSensCalc({ statusGUI: STATUS_OK, error: '' }));
    await waitFor(() => {
      expect(formProbe.getValues('targetObservation')[0].sensCalc?.statusGUI).toBe(STATUS_OK);
    });
    expect(getSensCalc).toHaveBeenCalledTimes(1);
  });

  test('keeps a link made while the calibrators of a new link are being looked up', async () => {
    vi.mocked(getSensCalc).mockClear();
    vi.mocked(GetCalibratorList).mockClear();
    let resolveSensCalc: (value: Awaited<ReturnType<typeof getSensCalc>>) => void = () => {};
    vi.mocked(getSensCalc).mockImplementationOnce(
      () => new Promise((resolve) => (resolveSensCalc = resolve))
    );
    renderLinking();

    await selectObservationAndTickTarget();
    await waitFor(() => expect(getSensCalc).toHaveBeenCalledTimes(1));

    // The calibrator lookup that follows the sensitivity result is held until released below
    let resolveCalibrators: (
      value: Awaited<ReturnType<typeof GetCalibratorList>>
    ) => void = () => {};
    vi.mocked(GetCalibratorList).mockImplementationOnce(
      () => new Promise((resolve) => (resolveCalibrators = resolve))
    );
    await act(async () => resolveSensCalc({ statusGUI: STATUS_OK, error: '' }));
    await waitFor(() => expect(GetCalibratorList).toHaveBeenCalledTimes(2));

    // Another link is made while that lookup is pending
    const otherLink = { observationId: 'obs-2', targetId: 't2', dataProductsSDPId: 'sdp-2' };
    act(() =>
      formProbe.setValue('targetObservation', [
        ...formProbe.getValues('targetObservation'),
        otherLink
      ])
    );

    await act(async () => resolveCalibrators([]));
    await waitFor(() => {
      expect(formProbe.getValues('targetObservation')).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            targetId: 't1',
            sensCalc: expect.objectContaining({ statusGUI: STATUS_OK })
          }),
          expect.objectContaining(otherLink)
        ])
      );
    });
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

    // Unlinking M2 leaves M3 linked, so the calibrators are chosen for M3
    fireEvent.click(within(await screen.findByTestId('linkedTickBox')).getByRole('checkbox'));
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
    fireEvent.click(within(await screen.findByTestId('linkedTickBox')).getByRole('checkbox'));
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
});
