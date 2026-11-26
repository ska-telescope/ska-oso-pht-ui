import { act, render } from '@testing-library/react';
import { FormProvider, useForm, UseFormReturn } from 'react-hook-form';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { ProposalType } from '@/models/proposals/proposal';
import { getProposalFormDefaults } from '@/models/proposals/useProposalForm';
import { REFERENCE_COORDINATE_TYPE_ICRS, SENSITIVITY_STATE } from '@/utils/constants';
import {
  newSvObservation,
  OBSERVING_MODE,
  type ObservationInput
} from '@/models/proposals/observations';
import {
  DATA_PRODUCT_KIND,
  type DataProductInput,
  newDataProduct
} from '@/models/proposals/dataProducts';
import type { Sensitivity } from '@/models/proposals/targetObservation';
import type { TargetType } from '@/models/proposals/targets';
import type TargetObservation from '@/utils/types/targetObservation';
import { MockObservatoryDataFrontend } from '@services/axios/get/getObservatoryData/mockObservatoryDataFrontend';
import { SENS_CALC_ERROR_KIND, SensCalcError, SensCalcSuccess } from './client';
import { sendSensitivityRequest, SensitivityResult } from './calculate';
import type { ZoomResult } from './types';
import { SENS_CALC_DEBOUNCE_MS, SensitivityService } from './useSensitivityService';

vi.mock('./calculate', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./calculate')>()),
  sendSensitivityRequest: vi.fn()
}));

const notifyError = vi.fn();
vi.mock('@/utils/notify/useNotify', () => ({ useNotify: () => ({ notifyError }) }));

// Without the OSD unless a test loads it, so its rules aren't checked
const mockOsd = vi.hoisted(() => ({ low: undefined as unknown }));
vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({ osdLOW: mockOsd.low, osdMID: undefined })
}));

type Response = SensCalcSuccess<SensitivityResult> | SensCalcError;

const TARGET = {
  id: 'target-1',
  name: 'M1',
  kind: REFERENCE_COORDINATE_TYPE_ICRS.value,
  raStr: '05:34:31.94',
  decStr: '+22:00:52.2'
} as TargetType;

const OBSERVATION: ObservationInput = {
  ...newSvObservation(OBSERVING_MODE.CONTINUUM, 15),
  id: 'obs-1'
};

const DATA_PRODUCT = {
  ...newDataProduct(DATA_PRODUCT_KIND.CONTINUUM_IMAGE, 'obs-1'),
  id: 'dp-1',
  weighting: { type: 'natural' },
  channelsOut: 40
} as DataProductInput;

const LINK: TargetObservation = {
  targetId: 'target-1',
  observationId: 'obs-1',
  dataProductsSDPId: 'dp-1'
};

const quantity = { value: 1, unit: 'Jy / beam' };
const beam = { beam_maj: quantity, beam_min: quantity };
const RESULT: ZoomResult = {
  weighted_spectral_sensitivity: quantity,
  spectral_confusion_noise: quantity,
  total_spectral_sensitivity: quantity,
  spectral_synthesized_beam_size: beam,
  spectral_surface_brightness_sensitivity: quantity
};
const SUCCESS: Response = { ok: true, data: RESULT };
const FAILURE: Response = {
  ok: false,
  kind: SENS_CALC_ERROR_KIND.FAILED,
  title: 'Validation Error',
  detail: 'Bandwidth too small'
};

const STORED_VALUES = {
  weightedSensitivity: quantity,
  totalSensitivity: quantity,
  confusionNoise: quantity,
  surfaceBrightnessSensitivity: quantity,
  synthesizedBeamSize: { value: '1 x 1', unit: 'arcsec²' }
};
const STORED_RESULTS: Sensitivity = { state: SENSITIVITY_STATE.DONE, spectral: STORED_VALUES };

/** Renders the service in a proposal form. */
const renderService = (link: TargetObservation, dataProducts = [DATA_PRODUCT]) => {
  let form!: UseFormReturn<ProposalType>;
  const Editor = () => {
    form = useForm<ProposalType>({
      defaultValues: {
        ...getProposalFormDefaults(),
        prslId: 'proposal-1',
        targets: [TARGET],
        targetObservation: [link],
        dataProducts,
        observations: [OBSERVATION]
      }
    });
    return (
      <FormProvider {...form}>
        <SensitivityService />
      </FormProvider>
    );
  };
  render(<Editor />);
  return {
    getForm: () => form,
    /** Changes the observation in the form, as an edit on the observation page would. */
    setObservation: (changed: ObservationInput) =>
      act(() => form.setValue('observations', [changed])),
    /** Changes the data products in the form, as an edit on the data product page would. */
    setDataProducts: (changed: DataProductInput[]) =>
      act(() => form.setValue('dataProducts', changed))
  };
};

const storedResults = (form: { getValues: (name: 'targetObservation') => unknown }) =>
  (form.getValues('targetObservation') as TargetObservation[])[0].sensitivity;

const debounce = () => act(() => vi.advanceTimersByTimeAsync(SENS_CALC_DEBOUNCE_MS));

/** Opens a proposal whose link has stored results, and lets the calculation on opening finish. */
const renderOpenedService = async () => {
  const service = renderService({ ...LINK, sensitivity: STORED_RESULTS });
  await debounce();
  vi.mocked(sendSensitivityRequest).mockClear();
  return service;
};

/** Makes the next request wait until the returned function resolves it. */
const holdNextRequest = () => {
  let resolve: (response: Response) => void = () => {};
  vi.mocked(sendSensitivityRequest).mockImplementationOnce(() => new Promise((r) => (resolve = r)));
  return (response: Response) => act(async () => resolve(response));
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(sendSensitivityRequest).mockReset().mockResolvedValue(SUCCESS);
  notifyError.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
  mockOsd.low = undefined;
});

describe('useSensitivityService', () => {
  test('calculates a link without results after the debounce', async () => {
    const { getForm } = renderService(LINK);
    expect(sendSensitivityRequest).not.toHaveBeenCalled();

    await debounce();

    expect(sendSensitivityRequest).toHaveBeenCalledTimes(1);
    expect(storedResults(getForm())?.state).toBe(SENSITIVITY_STATE.DONE);
  });

  test('calculates a link marked as partial', async () => {
    const { getForm } = renderService({
      ...LINK,
      sensitivity: { state: SENSITIVITY_STATE.CALCULATING }
    });

    await debounce();

    expect(sendSensitivityRequest).toHaveBeenCalledTimes(1);
    expect(storedResults(getForm())?.state).toBe(SENSITIVITY_STATE.DONE);
  });

  test("calculates a link to visibilities from the observation's images data product", async () => {
    const images = {
      ...DATA_PRODUCT,
      weighting: { type: 'briggs', robust: -1 }
    } as DataProductInput;
    const visibilities = {
      ...newDataProduct(DATA_PRODUCT_KIND.CONTINUUM_VISIBILITIES, 'obs-1'),
      id: 'dp-2'
    };
    renderService({ ...LINK, dataProductsSDPId: 'dp-2' }, [visibilities, images]);

    await debounce();

    expect(vi.mocked(sendSensitivityRequest).mock.calls[0][0].body).toMatchObject({
      weighting_mode: 'robust',
      robustness: -1
    });
  });

  test('recalculates stored results when a proposal is opened', async () => {
    const resolve = holdNextRequest();
    const { getForm } = renderService({ ...LINK, sensitivity: STORED_RESULTS });

    await debounce();

    expect(sendSensitivityRequest).toHaveBeenCalledTimes(1);
    expect(storedResults(getForm())).toEqual({ state: SENSITIVITY_STATE.CALCULATING });

    await resolve(SUCCESS);
    expect(storedResults(getForm())?.state).toBe(SENSITIVITY_STATE.DONE);
  });

  test('calculates from the current inputs when they change before the first debounce', async () => {
    const { setObservation } = renderService({ ...LINK, sensitivity: STORED_RESULTS });

    setObservation({ ...OBSERVATION, minElevation: 30 } as ObservationInput);
    await debounce();

    expect(sendSensitivityRequest).toHaveBeenCalledTimes(1);
    expect(vi.mocked(sendSensitivityRequest).mock.calls[0][0].body).toMatchObject({
      elevation_limit: 30
    });
  });

  test('recalculates when a change alters the request', async () => {
    const { setObservation } = await renderOpenedService();

    setObservation({ ...OBSERVATION, minElevation: 30 } as ObservationInput);
    await debounce();

    expect(sendSensitivityRequest).toHaveBeenCalledTimes(1);
  });

  test('makes no request for a change that leaves the request the same', async () => {
    const { setDataProducts } = await renderOpenedService();

    setDataProducts([{ ...DATA_PRODUCT, polarisations: ['I', 'Q'] } as DataProductInput]);
    await debounce();

    expect(sendSensitivityRequest).not.toHaveBeenCalled();
  });

  test('sends nothing for an invalid data product, and clears its results until it is valid', async () => {
    const { getForm, setDataProducts } = await renderOpenedService();
    expect(storedResults(getForm())?.state).toBe(SENSITIVITY_STATE.DONE);

    // Being edited: the image size has no unit yet
    setDataProducts([{ ...DATA_PRODUCT, imageSize: { value: 1, unit: null } } as DataProductInput]);
    await debounce();

    expect(sendSensitivityRequest).not.toHaveBeenCalled();
    expect(storedResults(getForm())).toBeUndefined();

    setDataProducts([DATA_PRODUCT]);
    await debounce();

    expect(sendSensitivityRequest).toHaveBeenCalledTimes(1);
    expect(storedResults(getForm())?.state).toBe(SENSITIVITY_STATE.DONE);
  });

  test('sends nothing for an invalid observation, and clears its results until it is valid', async () => {
    const { getForm, setObservation } = await renderOpenedService();

    // Being edited: the integration time has no value yet
    setObservation({ ...OBSERVATION, integrationTime: { value: null, unit: 'h' } });
    await debounce();

    expect(sendSensitivityRequest).not.toHaveBeenCalled();
    expect(storedResults(getForm())).toBeUndefined();

    setObservation(OBSERVATION);
    await debounce();

    expect(sendSensitivityRequest).toHaveBeenCalledTimes(1);
    expect(storedResults(getForm())?.state).toBe(SENSITIVITY_STATE.DONE);
  });

  test('sends nothing for an observation the OSD rules show an error on', async () => {
    mockOsd.low = MockObservatoryDataFrontend.capabilities.low;
    const { getForm, setObservation } = await renderOpenedService();

    // Off the LOW coarse channel grid
    setObservation({ ...OBSERVATION, centralFrequency: { value: 200, unit: 'MHz' } });
    await debounce();

    expect(sendSensitivityRequest).not.toHaveBeenCalled();
    expect(storedResults(getForm())).toBeUndefined();
  });

  test('cancels a superseded request and ignores its response', async () => {
    const resolveFirst = holdNextRequest();
    const { getForm, setObservation } = renderService(LINK);
    await debounce();
    const firstSignal = vi.mocked(sendSensitivityRequest).mock.calls[0][1]?.signal;

    const resolveSecond = holdNextRequest();
    setObservation({ ...OBSERVATION, minElevation: 30 } as ObservationInput);
    await debounce();

    expect(firstSignal?.aborted).toBe(true);
    await resolveFirst(FAILURE);
    expect(storedResults(getForm())?.state).toBe(SENSITIVITY_STATE.CALCULATING);

    await resolveSecond(SUCCESS);
    expect(storedResults(getForm())?.state).toBe(SENSITIVITY_STATE.DONE);
    expect(notifyError).not.toHaveBeenCalled();
  });

  test('ignores a response that arrives after its inputs change, before the debounce', async () => {
    const resolveFirst = holdNextRequest();
    const { getForm, setObservation } = renderService(LINK);
    await debounce();
    const firstSignal = vi.mocked(sendSensitivityRequest).mock.calls[0][1]?.signal;

    setObservation({ ...OBSERVATION, minElevation: 30 } as ObservationInput);
    expect(firstSignal?.aborted).toBe(true);
    await resolveFirst(FAILURE);

    expect(storedResults(getForm())?.state).toBe(SENSITIVITY_STATE.CALCULATING);
    expect(notifyError).not.toHaveBeenCalled();

    await debounce();
    expect(sendSensitivityRequest).toHaveBeenCalledTimes(2);
    expect(storedResults(getForm())?.state).toBe(SENSITIVITY_STATE.DONE);
  });

  test('marks a link as calculating, without its previous results, while its request runs', async () => {
    const { getForm, setObservation } = await renderOpenedService();

    const resolve = holdNextRequest();
    setObservation({ ...OBSERVATION, minElevation: 30 } as ObservationInput);
    await debounce();

    expect(storedResults(getForm())).toEqual({ state: SENSITIVITY_STATE.CALCULATING });

    await resolve(SUCCESS);
    expect(storedResults(getForm())?.state).toBe(SENSITIVITY_STATE.DONE);
    expect(sendSensitivityRequest).toHaveBeenCalledTimes(1);
  });

  test('stores a calculator error and shows it as a notification', async () => {
    vi.mocked(sendSensitivityRequest).mockResolvedValue(FAILURE);
    const { getForm } = renderService(LINK);

    await debounce();

    expect(storedResults(getForm())).toEqual({
      state: SENSITIVITY_STATE.FAILED,
      error: 'Bandwidth too small'
    });
    expect(notifyError).toHaveBeenCalledWith('Bandwidth too small');
  });

  test('stores an unexpected response as an error instead of calculating forever', async () => {
    // What a continuum request gives for an HTML page returned with status 200
    vi.mocked(sendSensitivityRequest).mockResolvedValue({
      ok: true,
      data: undefined
    } as unknown as Response);
    const { getForm } = renderService(LINK);

    await debounce();

    expect(storedResults(getForm())).toMatchObject({ state: SENSITIVITY_STATE.FAILED });
    expect(notifyError).toHaveBeenCalledOnce();
  });
});
