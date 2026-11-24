import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CHANNELS_OUT_DEFAULT,
  IMAGE_SIZE_DEFAULT,
  PIXEL_SIZE_DEFAULT,
  PROPOSAL_TYPE,
  ROBUST_DEFAULT,
  SENSITIVITY_STATE,
  SET_CONTINUUM_SUBSTRACTION_DEFAULT,
  TAPER_DEFAULT
} from '../constants';
import * as helpers from '../helpers';
import type { ProposalFormAccess, ProposalType } from '@/models/proposals/proposal';
import {
  DATA_PRODUCT_KIND,
  DataProductInput,
  STEPPED_FIELD,
  steppedFromPdm
} from '@/models/proposals/dataProducts';
import {
  newSvObservation,
  ObservationInput,
  OBSERVING_MODE
} from '@/models/proposals/observations';
import { Calibrator } from '../types/calibrationStrategy';
import { PstMode } from '@/generated/models';
import {
  linkTarget,
  newDataProductsForMode,
  setObservingMode,
  withSvDefaults
} from './AutoLinking';
import { getProposalFormDefaults } from '@/models/proposals/useProposalForm';
import { mockTarget } from './mockTarget';

// The calibrator lookup goes to the backend. The tests hold it open where it matters.
const mockLookupCalibrators = vi.hoisted(() =>
  vi.fn(async (): Promise<Calibrator[] | null> => null)
);
vi.mock('@/models/proposals/calibrationOperations', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/models/proposals/calibrationOperations')>()),
  lookupCalibrators: mockLookupCalibrators
}));

const MIN_ELEVATION = 15;

// The default data products, as the mocked id generator names them
const imageFields = {
  imageSize: { value: IMAGE_SIZE_DEFAULT, unit: 'deg' },
  pixelSize: { value: PIXEL_SIZE_DEFAULT, unit: 'arcsec' },
  weighting: { type: 'briggs', robust: ROBUST_DEFAULT },
  taper: TAPER_DEFAULT,
  polarisations: ['I'],
  channelsOut: CHANNELS_OUT_DEFAULT
} as const;

const CONTINUUM_IMAGE_DATA_PRODUCT: DataProductInput = {
  id: 'SDP-0000000',
  observationId: 'obs-123',
  kind: DATA_PRODUCT_KIND.CONTINUUM_IMAGE,
  ...imageFields,
  polarisations: ['I']
};

const SPECTRAL_DATA_PRODUCT: DataProductInput = {
  id: 'SDP-0000000',
  observationId: 'obs-123',
  kind: DATA_PRODUCT_KIND.SPECTRAL_IMAGE,
  ...imageFields,
  polarisations: ['I'],
  continuumSubtraction: SET_CONTINUUM_SUBSTRACTION_DEFAULT
};

// A new link has partial results: the sensitivity service calculates them
const PARTIAL_RESULTS = { state: SENSITIVITY_STATE.CALCULATING };

const observation = (
  observingMode: ObservationInput['observingMode'],
  id: string
): ObservationInput => ({ ...newSvObservation(observingMode, MIN_ELEVATION), id });

// A form over plain values, so each test can check every slice in one place
const formOver = (initial: Partial<ProposalType>) => {
  const values = { ...getProposalFormDefaults(), ...initial };
  const form = {
    getValues: (name?: keyof ProposalType) => (name ? values[name] : values),
    setValue: (name: keyof ProposalType, value: never) => {
      values[name] = value;
    }
  } as unknown as ProposalFormAccess;
  return { form, values };
};

const mockAuthAxiosClient = {} as never;

beforeEach(() => {
  vi.clearAllMocks();
  mockLookupCalibrators.mockImplementation(async () => null);
});

describe('newDataProductsForMode', () => {
  beforeEach(() => {
    vi.spyOn(helpers, 'generateDataProductId')
      .mockReturnValueOnce('SDP-0000000')
      .mockReturnValueOnce('SDP-0000001');
  });

  it('gives a continuum observation an image and a hidden visibilities data product', () => {
    expect(newDataProductsForMode(observation(OBSERVING_MODE.CONTINUUM, 'obs-123'))).toEqual([
      CONTINUUM_IMAGE_DATA_PRODUCT,
      {
        id: 'SDP-0000001',
        observationId: 'obs-123',
        kind: DATA_PRODUCT_KIND.CONTINUUM_VISIBILITIES,
        timeAveragingS: steppedFromPdm(4, STEPPED_FIELD.TIME_AVERAGING_S),
        frequencyAveragingKhz: steppedFromPdm(4, STEPPED_FIELD.FREQUENCY_AVERAGING_KHZ)
      }
    ]);
  });

  it("gives a spectral line observation a spectral image with the observation's channels", () => {
    const spectral = observation(OBSERVING_MODE.SPECTRAL, 'obs-123');

    const dataProducts = newDataProductsForMode(spectral);

    expect(dataProducts[0]).toEqual({ ...SPECTRAL_DATA_PRODUCT, channelsOut: 1000 });
    expect(dataProducts[1]).toMatchObject({
      observationId: 'obs-123',
      kind: DATA_PRODUCT_KIND.CONTINUUM_VISIBILITIES,
      frequencyAveragingKhz: steppedFromPdm(1, STEPPED_FIELD.FREQUENCY_AVERAGING_KHZ)
    });
  });

  it('gives a PST observation one data product for its PST mode', () => {
    expect(newDataProductsForMode(observation(OBSERVING_MODE.PST, 'obs-123'))).toEqual([
      { id: 'SDP-0000000', observationId: 'obs-123', kind: DATA_PRODUCT_KIND.PST_TIMING }
    ]);
  });

  it('defaults the continuum and spectral line image to Briggs weighting with robust 0', () => {
    expect(
      newDataProductsForMode(observation(OBSERVING_MODE.CONTINUUM_SPECTRAL, 'obs-123'))[0]
    ).toMatchObject({
      kind: DATA_PRODUCT_KIND.CONTINUUM_SPECTRAL_IMAGE,
      weighting: { type: 'briggs', robust: 0 }
    });
  });
});

describe('setObservingMode()', () => {
  const existing = observation(OBSERVING_MODE.CONTINUUM, 'existing-obs');

  beforeEach(() => {
    vi.spyOn(helpers, 'generateCalibrationId').mockReturnValue('mock-cal');
    vi.spyOn(helpers, 'generateDataProductId').mockReturnValue('mock-sdp');
    vi.spyOn(helpers, 'generateObsSetId').mockReturnValue('mock-obs');
  });

  it('replaces only the observation and data products when there is no target', async () => {
    const { form, values } = formOver({
      abstract: 'An abstract',
      observations: [existing],
      dataProducts: [{ ...CONTINUUM_IMAGE_DATA_PRODUCT, observationId: 'existing-obs' }]
    });

    await setObservingMode(OBSERVING_MODE.PST, form, mockAuthAxiosClient, MIN_ELEVATION);

    expect(values.observations).toEqual([
      expect.objectContaining({
        id: 'mock-obs',
        observingMode: OBSERVING_MODE.PST,
        minElevation: MIN_ELEVATION
      })
    ]);
    expect(values.dataProducts).toEqual([
      expect.objectContaining({ observationId: 'mock-obs', kind: DATA_PRODUCT_KIND.PST_TIMING })
    ]);
    // The link and calibration need a target, so nothing is created for them
    expect(values.targetObservation).toEqual([]);
    expect(values.calibrationStrategy).toEqual([]);
    expect(values.abstract).toBe('An abstract');
  });

  it('gives a spectral line observation all the zoom channels of the subarray', async () => {
    const { form, values } = formOver({ observations: [existing] });

    await setObservingMode(OBSERVING_MODE.SPECTRAL, form, mockAuthAxiosClient, null, 1234);

    expect(values.observations).toEqual([
      expect.objectContaining({ observingMode: OBSERVING_MODE.SPECTRAL, zoomChannels: 1234 })
    ]);
  });

  it('links the target to the new observation and its main data product', async () => {
    const { form, values } = formOver({
      targets: [mockTarget],
      observations: [existing],
      calibrationStrategy: [
        {
          observatoryDefined: true,
          id: 'existing-cal',
          observationIdRef: 'existing-obs',
          calibrators: null,
          notes: 'Existing notes'
        }
      ]
    });

    await setObservingMode(OBSERVING_MODE.SPECTRAL, form, mockAuthAxiosClient, MIN_ELEVATION);

    expect(values.targets).toEqual([mockTarget]);
    expect(values.targetObservation).toEqual([
      {
        targetId: mockTarget.id,
        observationId: 'mock-obs',
        dataProductsSDPId: 'mock-sdp',
        sensitivity: PARTIAL_RESULTS
      }
    ]);
    expect(values.calibrationStrategy).toEqual([
      {
        observatoryDefined: true,
        id: 'mock-cal',
        observationIdRef: 'mock-obs',
        calibrators: null,
        notes: 'Existing notes'
      }
    ]);
  });

  describe('while the calibrator lookup runs', () => {
    const calibrators = [{ id: 'cal-1' }] as unknown as Calibrator[];
    let finishLookup: () => void;

    beforeEach(() => {
      mockLookupCalibrators.mockImplementationOnce(
        () => new Promise((resolve) => (finishLookup = () => resolve(calibrators)))
      );
    });

    it('has already written the observation, data products, link and calibration', async () => {
      const { form, values } = formOver({ targets: [mockTarget], observations: [existing] });

      const changing = setObservingMode(OBSERVING_MODE.PST, form, mockAuthAxiosClient, null);

      expect(values.observations).toEqual([expect.objectContaining({ id: 'mock-obs' })]);
      expect(values.dataProducts).toEqual([expect.objectContaining({ observationId: 'mock-obs' })]);
      expect(values.targetObservation).toEqual([
        expect.objectContaining({ observationId: 'mock-obs' })
      ]);
      expect(values.calibrationStrategy).toEqual([
        expect.objectContaining({ observationIdRef: 'mock-obs', calibrators: null })
      ]);
      finishLookup();
      await changing;
    });

    it('adds the calibrators when it returns, keeping notes edited meanwhile', async () => {
      const { form, values } = formOver({ targets: [mockTarget], observations: [existing] });

      const changing = setObservingMode(OBSERVING_MODE.PST, form, mockAuthAxiosClient, null);
      form.setValue('calibrationStrategy', [
        { ...values.calibrationStrategy[0], notes: 'Edited notes' }
      ]);
      finishLookup();
      await changing;

      expect(values.calibrationStrategy).toEqual([
        expect.objectContaining({ id: 'mock-cal', calibrators, notes: 'Edited notes' })
      ]);
    });

    it("doesn't add them when another mode change has replaced the calibration", async () => {
      const { form, values } = formOver({ targets: [mockTarget], observations: [existing] });

      const first = setObservingMode(OBSERVING_MODE.PST, form, mockAuthAxiosClient, null);
      vi.spyOn(helpers, 'generateCalibrationId').mockReturnValue('newer-cal');
      await setObservingMode(OBSERVING_MODE.CONTINUUM, form, mockAuthAxiosClient, null);
      finishLookup();
      await first;

      expect(values.calibrationStrategy).toEqual([
        expect.objectContaining({ id: 'newer-cal', calibrators: null })
      ]);
    });
  });
});

describe('linkTarget()', () => {
  const existing: ObservationInput = {
    ...observation(OBSERVING_MODE.SPECTRAL, 'existing-obs'),
    centralFrequency: { value: 123, unit: 'MHz' }
  };
  const existingDataProducts: DataProductInput[] = [
    { ...SPECTRAL_DATA_PRODUCT, id: 'existing-sdp', observationId: 'existing-obs' },
    {
      id: 'existing-hidden-sdp',
      observationId: 'existing-obs',
      kind: DATA_PRODUCT_KIND.CONTINUUM_VISIBILITIES,
      timeAveragingS: steppedFromPdm(4, STEPPED_FIELD.TIME_AVERAGING_S),
      frequencyAveragingKhz: steppedFromPdm(1, STEPPED_FIELD.FREQUENCY_AVERAGING_KHZ)
    }
  ];

  beforeEach(() => {
    vi.spyOn(helpers, 'generateCalibrationId').mockReturnValue('mock-cal');
    vi.spyOn(helpers, 'generateDataProductId').mockReturnValue('mock-sdp');
    vi.spyOn(helpers, 'generateObsSetId').mockReturnValue('mock-obs');
  });

  it('keeps the existing observation and data products and links the target to them', async () => {
    const { form, values } = formOver({
      abstract: 'An abstract',
      observations: [existing],
      dataProducts: existingDataProducts
    });

    await linkTarget(mockTarget, form, mockAuthAxiosClient, MIN_ELEVATION);

    expect(values.observations).toEqual([existing]);
    expect(values.dataProducts).toEqual(existingDataProducts);
    expect(values.targets).toEqual([mockTarget]);
    expect(values.abstract).toBe('An abstract');
    expect(values.targetObservation).toEqual([
      {
        targetId: mockTarget.id,
        observationId: 'existing-obs',
        dataProductsSDPId: 'existing-sdp',
        sensitivity: PARTIAL_RESULTS
      }
    ]);
  });

  it("links the observation's main data product, not another observation's", async () => {
    const { form, values } = formOver({
      observations: [existing],
      dataProducts: [
        { ...CONTINUUM_IMAGE_DATA_PRODUCT, id: 'other-sdp', observationId: 'other-obs' },
        ...existingDataProducts
      ]
    });

    await linkTarget(mockTarget, form, mockAuthAxiosClient, MIN_ELEVATION);

    expect(values.targetObservation[0].dataProductsSDPId).toBe('existing-sdp');
  });

  it('creates a calibration for the existing observation, keeping the notes', async () => {
    const { form, values } = formOver({
      observations: [existing],
      dataProducts: existingDataProducts,
      calibrationStrategy: [
        {
          observatoryDefined: true,
          id: 'existing-cal',
          observationIdRef: 'existing-obs',
          calibrators: null,
          notes: 'Existing notes'
        }
      ]
    });

    await linkTarget(mockTarget, form, mockAuthAxiosClient, MIN_ELEVATION);

    expect(values.calibrationStrategy).toEqual([
      expect.objectContaining({ observationIdRef: 'existing-obs', notes: 'Existing notes' })
    ]);
  });

  it('creates a default continuum observation and data products when there is none', async () => {
    const { form, values } = formOver({});

    await linkTarget(mockTarget, form, mockAuthAxiosClient, MIN_ELEVATION);

    expect(values.observations).toEqual([
      expect.objectContaining({
        id: 'mock-obs',
        observingMode: OBSERVING_MODE.CONTINUUM,
        minElevation: MIN_ELEVATION
      })
    ]);
    // Continuum has an images data product plus a hidden visibilities one
    expect(values.dataProducts).toHaveLength(2);
    values.dataProducts.forEach((dp) => expect(dp.observationId).toBe('mock-obs'));
    expect(values.targetObservation[0].observationId).toBe('mock-obs');
  });

  it('creates default data products when the observation has none', async () => {
    const { form, values } = formOver({ observations: [existing] });

    await linkTarget(mockTarget, form, mockAuthAxiosClient, MIN_ELEVATION);

    expect(values.observations).toEqual([existing]);
    expect(values.dataProducts.length).toBeGreaterThan(0);
    values.dataProducts.forEach((dp) => expect(dp.observationId).toBe('existing-obs'));
    expect(values.targetObservation[0].dataProductsSDPId).toBe('mock-sdp');
  });
});

describe('withSvDefaults()', () => {
  const target = { ...mockTarget, id: 'target-1' } as never;
  const continuumImage: DataProductInput = {
    ...CONTINUUM_IMAGE_DATA_PRODUCT,
    id: 'SDP-image',
    observationId: 'obs-1'
  };
  const visibilities: DataProductInput = {
    id: 'SDP-visibilities',
    observationId: 'obs-1',
    kind: DATA_PRODUCT_KIND.CONTINUUM_VISIBILITIES,
    timeAveragingS: steppedFromPdm(4, STEPPED_FIELD.TIME_AVERAGING_S),
    frequencyAveragingKhz: steppedFromPdm(4, STEPPED_FIELD.FREQUENCY_AVERAGING_KHZ)
  };
  const calibration = {
    observatoryDefined: true,
    id: 'cal-1',
    observationIdRef: 'obs-1',
    calibrators: null,
    notes: 'Kept notes'
  };
  const link = {
    targetId: 'target-1',
    observationId: 'obs-1',
    dataProductsSDPId: 'SDP-image',
    sensitivity: { state: SENSITIVITY_STATE.DONE }
  } as ProposalType['targetObservation'][number];
  // An SV proposal as the app sets it up: nothing to add
  const svValues: ProposalType = {
    ...getProposalFormDefaults(),
    proposalType: { type: PROPOSAL_TYPE.SCIENCE_VERIFICATION, subTypes: [] },
    targets: [target],
    observations: [observation(OBSERVING_MODE.CONTINUUM, 'obs-1')],
    dataProducts: [continuumImage, visibilities],
    targetObservation: [link],
    calibrationStrategy: [calibration]
  };

  beforeEach(() => {
    vi.spyOn(helpers, 'generateDataProductId')
      .mockReturnValueOnce('SDP-0000000')
      .mockReturnValueOnce('SDP-0000001');
    vi.spyOn(helpers, 'generateObsSetId').mockReturnValue('obs-new');
  });

  it.each([
    ['all it needs', {}],
    ['no target', { targets: [], targetObservation: [] }],
    [
      'another proposal type',
      { proposalType: { type: PROPOSAL_TYPE.STANDARD, subTypes: [] }, observations: [] }
    ]
  ])('leaves a proposal with %s as it is', (_, change) => {
    const values = { ...svValues, ...change } as ProposalType;

    expect(withSvDefaults(values, MIN_ELEVATION)).toBe(values);
  });

  it('gives an observation without data products its defaults, with no link without a target', () => {
    const values = withSvDefaults(
      { ...svValues, targets: [], targetObservation: [], dataProducts: [] },
      MIN_ELEVATION
    );

    expect(values.observations).toEqual(svValues.observations);
    expect(values.dataProducts).toEqual([
      expect.objectContaining({
        id: 'SDP-0000000',
        observationId: 'obs-1',
        kind: DATA_PRODUCT_KIND.CONTINUUM_IMAGE
      }),
      expect.objectContaining({
        id: 'SDP-0000001',
        observationId: 'obs-1',
        kind: DATA_PRODUCT_KIND.CONTINUUM_VISIBILITIES
      })
    ]);
    expect(values.targetObservation).toEqual([]);
  });

  // The main data product was invalid at the last save, so it and its link were left out
  it('replaces a leftover companion with the default data products and links them', () => {
    const values = withSvDefaults(
      { ...svValues, dataProducts: [visibilities], targetObservation: [] },
      MIN_ELEVATION
    );

    expect(values.dataProducts.map((dp) => dp.id)).toEqual(['SDP-0000000', 'SDP-0000001']);
    expect(values.targetObservation).toEqual([
      {
        targetId: 'target-1',
        observationId: 'obs-1',
        dataProductsSDPId: 'SDP-0000000',
        sensitivity: PARTIAL_RESULTS
      }
    ]);
    expect(values.calibrationStrategy).toBe(svValues.calibrationStrategy);
  });

  it('gives a PST observation its one default data product', () => {
    const values = withSvDefaults(
      {
        ...svValues,
        observations: [observation(OBSERVING_MODE.PST, 'obs-1')],
        dataProducts: [],
        targetObservation: []
      },
      MIN_ELEVATION
    );

    expect(values.dataProducts).toHaveLength(1);
    expect(values.targetObservation[0].dataProductsSDPId).toBe(values.dataProducts[0].id);
  });

  it('links a target to the existing main data product', () => {
    const values = withSvDefaults({ ...svValues, targetObservation: [] }, MIN_ELEVATION);

    expect(values.dataProducts).toBe(svValues.dataProducts);
    expect(values.targetObservation).toEqual([
      {
        targetId: 'target-1',
        observationId: 'obs-1',
        dataProductsSDPId: 'SDP-image',
        sensitivity: PARTIAL_RESULTS
      }
    ]);
  });

  it('gives a proposal with nothing the default continuum observation and its data products', () => {
    const values = withSvDefaults(
      {
        ...svValues,
        targets: [],
        observations: [],
        dataProducts: [],
        targetObservation: [],
        calibrationStrategy: []
      },
      MIN_ELEVATION
    );

    expect(values.observations).toEqual([
      expect.objectContaining({
        id: 'obs-new',
        observingMode: OBSERVING_MODE.CONTINUUM,
        minElevation: MIN_ELEVATION
      })
    ]);
    expect(values.dataProducts.map((dp) => dp.observationId)).toEqual(['obs-new', 'obs-new']);
  });

  // The observation was invalid at the last save, so only it was left out
  describe('without the observation its data products were kept for', () => {
    const spectralImage: DataProductInput = {
      ...SPECTRAL_DATA_PRODUCT,
      id: 'SDP-spectral',
      observationId: 'obs-1',
      channelsOut: 2000
    };

    it('gives back the default observation for their mode, with the ID they refer to', () => {
      const values = withSvDefaults(
        {
          ...svValues,
          observations: [],
          dataProducts: [spectralImage, visibilities],
          targetObservation: []
        },
        MIN_ELEVATION
      );

      expect(values.observations).toEqual([
        expect.objectContaining({
          id: 'obs-1',
          observingMode: OBSERVING_MODE.SPECTRAL,
          minElevation: MIN_ELEVATION,
          // A spectral image's channels out are the observation's zoom channels
          zoomChannels: 2000
        })
      ]);
      expect(values.dataProducts).toEqual([spectralImage, visibilities]);
      expect(values.calibrationStrategy).toEqual([calibration]);
    });

    // Its results were for the old observation
    it('links the target again', () => {
      const values = withSvDefaults({ ...svValues, observations: [] }, MIN_ELEVATION);

      expect(values.targetObservation).toEqual([
        {
          targetId: 'target-1',
          observationId: 'obs-1',
          dataProductsSDPId: 'SDP-image',
          sensitivity: PARTIAL_RESULTS
        }
      ]);
    });

    it.each([
      [DATA_PRODUCT_KIND.PST_FLOW_THROUGH, PstMode.FlowThrough],
      [DATA_PRODUCT_KIND.PST_DETECTED_FILTERBANK, PstMode.DetectedFilterbank],
      [DATA_PRODUCT_KIND.PST_TIMING, PstMode.PulsarTiming]
    ])('gives a %s data product a PST observation in its mode', (kind, pstMode) => {
      const values = withSvDefaults(
        {
          ...svValues,
          observations: [],
          dataProducts: [{ id: 'SDP-pst', observationId: 'obs-1', kind } as DataProductInput],
          targetObservation: []
        },
        MIN_ELEVATION
      );

      expect(values.observations).toEqual([
        expect.objectContaining({ id: 'obs-1', observingMode: OBSERVING_MODE.PST, pstMode })
      ]);
    });

    it('gives the ID the calibration refers to when no data product was kept', () => {
      const values = withSvDefaults(
        { ...svValues, observations: [], dataProducts: [], targetObservation: [] },
        MIN_ELEVATION
      );

      expect(values.observations).toEqual([
        expect.objectContaining({ id: 'obs-1', observingMode: OBSERVING_MODE.CONTINUUM })
      ]);
      expect(values.dataProducts.map((dp) => dp.observationId)).toEqual(['obs-1', 'obs-1']);
    });
  });
});
