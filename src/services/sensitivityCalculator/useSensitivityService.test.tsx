import { act, render } from '@testing-library/react';
import { FormProvider, useForm, UseFormReturn } from 'react-hook-form';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { ProposalType } from '@/models/proposals/proposal';
import { getProposalFormValues } from '@/models/proposals/useProposalForm';
import {
  DEFAULT_CONTINUUM_OBSERVATION_LOW,
  DP_TYPE_IMAGES,
  DP_TYPE_VISIBLE,
  IW_BRIGGS,
  IW_NATURAL,
  REFERENCE_COORDINATE_TYPE_ICRS,
  SENSITIVITY_STATE
} from '@/utils/constants';
import type { DataProductSDPNew } from '@/utils/types/dataProduct';
import type Proposal from '@/utils/types/proposal';
import type { Sensitivity } from '@/models/proposals/targetObservation';
import type { TargetType } from '@/models/proposals/targets';
import type TargetObservation from '@/utils/types/targetObservation';
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

// The service reads observations and data products from the store's proposal
const store = vi.hoisted(() => ({ proposal: undefined as unknown }));
vi.mock('@utils/storage/store', () => ({
  storageObject: { useStore: () => ({ application: { content2: store.proposal } }) }
}));

type Response = SensCalcSuccess<SensitivityResult> | SensCalcError;

const TARGET = {
  id: 'target-1',
  name: 'M1',
  kind: REFERENCE_COORDINATE_TYPE_ICRS.value,
  raStr: '05:34:31.94',
  decStr: '+22:00:52.2'
} as TargetType;

const OBSERVATION = { ...DEFAULT_CONTINUUM_OBSERVATION_LOW, id: 'obs-1' };

const DATA_PRODUCT: DataProductSDPNew = {
  id: 'dp-1',
  observationId: 'obs-1',
  data: { dataProductType: DP_TYPE_IMAGES, weighting: IW_NATURAL, channelsOut: 40 }
} as DataProductSDPNew;

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

const proposalWith = (observation = OBSERVATION, dataProduct = DATA_PRODUCT) =>
  ({ id: 'proposal-1', observations: [observation], dataProductSDP: [dataProduct] }) as Proposal;

/** Renders the service in a proposal form, with the proposal in the store. */
const renderService = (link: TargetObservation, proposal = proposalWith()) => {
  store.proposal = proposal;
  let form!: UseFormReturn<ProposalType>;
  const Editor = () => {
    form = useForm<ProposalType>({
      defaultValues: getProposalFormValues({
        targets: [TARGET],
        targetObservation: [link]
      } as Partial<ProposalType>)
    });
    return (
      <FormProvider {...form}>
        <SensitivityService />
      </FormProvider>
    );
  };
  const { rerender } = render(<Editor />);
  return {
    getForm: () => form,
    /** Puts a changed proposal in the store, as an edit on another page would. */
    setProposal: (changed: Proposal) => {
      store.proposal = changed;
      rerender(<Editor />);
    }
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
      data: { ...DATA_PRODUCT.data, weighting: IW_BRIGGS, robust: -1 }
    } as DataProductSDPNew;
    const visibilities = {
      id: 'dp-2',
      observationId: 'obs-1',
      data: { dataProductType: DP_TYPE_VISIBLE, timeAveraging: 4, frequencyAveraging: 4 }
    } as DataProductSDPNew;
    renderService({ ...LINK, dataProductsSDPId: 'dp-2' }, {
      id: 'proposal-1',
      observations: [OBSERVATION],
      dataProductSDP: [visibilities, images]
    } as Proposal);

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
    const { setProposal } = renderService({ ...LINK, sensitivity: STORED_RESULTS });

    setProposal(proposalWith({ ...OBSERVATION, elevation: 30 }));
    await debounce();

    expect(sendSensitivityRequest).toHaveBeenCalledTimes(1);
    expect(vi.mocked(sendSensitivityRequest).mock.calls[0][0].body).toMatchObject({
      elevation_limit: 30
    });
  });

  test('recalculates when a change alters the request', async () => {
    const { setProposal } = await renderOpenedService();

    setProposal(proposalWith({ ...OBSERVATION, elevation: 30 }));
    await debounce();

    expect(sendSensitivityRequest).toHaveBeenCalledTimes(1);
  });

  test('makes no request for a change that leaves the request the same', async () => {
    const { setProposal } = await renderOpenedService();

    setProposal(
      proposalWith(OBSERVATION, {
        ...DATA_PRODUCT,
        data: { ...DATA_PRODUCT.data, polarisations: ['I', 'Q'] }
      } as DataProductSDPNew)
    );
    await debounce();

    expect(sendSensitivityRequest).not.toHaveBeenCalled();
  });

  test('cancels a superseded request and ignores its response', async () => {
    const resolveFirst = holdNextRequest();
    const { getForm, setProposal } = renderService(LINK);
    await debounce();
    const firstSignal = vi.mocked(sendSensitivityRequest).mock.calls[0][1]?.signal;

    const resolveSecond = holdNextRequest();
    setProposal(proposalWith({ ...OBSERVATION, elevation: 30 }));
    await debounce();

    expect(firstSignal?.aborted).toBe(true);
    await resolveFirst(FAILURE);
    expect(storedResults(getForm())?.state).toBe(SENSITIVITY_STATE.CALCULATING);

    await resolveSecond(SUCCESS);
    expect(storedResults(getForm())?.state).toBe(SENSITIVITY_STATE.DONE);
    expect(notifyError).not.toHaveBeenCalled();
  });

  test('marks a link as calculating, without its previous results, while its request runs', async () => {
    const { getForm, setProposal } = await renderOpenedService();

    const resolve = holdNextRequest();
    setProposal(proposalWith({ ...OBSERVATION, elevation: 30 }));
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
