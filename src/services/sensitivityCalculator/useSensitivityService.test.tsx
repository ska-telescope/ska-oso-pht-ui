import { act, render } from '@testing-library/react';
import { FormProvider, useForm, UseFormReturn } from 'react-hook-form';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { ProposalType } from '@/models/proposals/proposal';
import { getProposalFormValues } from '@/models/proposals/useProposalForm';
import {
  DEFAULT_CONTINUUM_OBSERVATION_LOW,
  DP_TYPE_IMAGES,
  IW_NATURAL,
  REFERENCE_COORDINATE_TYPE_ICRS,
  STATUS_ERROR,
  STATUS_OK,
  STATUS_PARTIAL
} from '@/utils/constants';
import type { DataProductSDPNew } from '@/utils/types/dataProduct';
import type Proposal from '@/utils/types/proposal';
import type { SensCalcResults } from '@/utils/types/sensCalcResults';
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

const STORED_RESULTS: SensCalcResults = { statusGUI: STATUS_OK, section1: [] };

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
  (form.getValues('targetObservation') as TargetObservation[])[0].sensitivityResults;

const debounce = () => act(() => vi.advanceTimersByTimeAsync(SENS_CALC_DEBOUNCE_MS));

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
    expect(storedResults(getForm())?.statusGUI).toBe(STATUS_OK);
  });

  test('calculates a link marked as partial', async () => {
    const { getForm } = renderService({
      ...LINK,
      sensitivityResults: { statusGUI: STATUS_PARTIAL, error: '' }
    });

    await debounce();

    expect(sendSensitivityRequest).toHaveBeenCalledTimes(1);
    expect(storedResults(getForm())?.statusGUI).toBe(STATUS_OK);
  });

  test('takes stored results as current when a proposal is opened', async () => {
    const { getForm } = renderService({ ...LINK, sensitivityResults: STORED_RESULTS });

    await debounce();

    expect(sendSensitivityRequest).not.toHaveBeenCalled();
    expect(storedResults(getForm())).toEqual(STORED_RESULTS);
  });

  test('recalculates when a change alters the request', async () => {
    const { setProposal } = renderService({ ...LINK, sensitivityResults: STORED_RESULTS });
    await debounce();

    setProposal(proposalWith({ ...OBSERVATION, elevation: 30 }));
    await debounce();

    expect(sendSensitivityRequest).toHaveBeenCalledTimes(1);
  });

  test('makes no request for a change that leaves the request the same', async () => {
    const { setProposal } = renderService({ ...LINK, sensitivityResults: STORED_RESULTS });
    await debounce();

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
    expect(storedResults(getForm())).toBeUndefined();

    await resolveSecond(SUCCESS);
    expect(storedResults(getForm())?.statusGUI).toBe(STATUS_OK);
    expect(notifyError).not.toHaveBeenCalled();
  });

  test('stores a calculator error and shows it as a notification', async () => {
    vi.mocked(sendSensitivityRequest).mockResolvedValue(FAILURE);
    const { getForm } = renderService(LINK);

    await debounce();

    expect(storedResults(getForm())).toEqual({
      statusGUI: STATUS_ERROR,
      error: 'Bandwidth too small'
    });
    expect(notifyError).toHaveBeenCalledWith('Bandwidth too small');
  });
});
