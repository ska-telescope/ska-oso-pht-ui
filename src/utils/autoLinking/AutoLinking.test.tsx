import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CHANNELS_OUT_DEFAULT,
  DEFAULT_CONTINUUM_OBSERVATION_LOW,
  DEFAULT_PST_OBSERVATION_LOW,
  DEFAULT_ZOOM_OBSERVATION_LOW,
  IMAGE_SIZE_DEFAULT,
  PIXEL_SIZE_DEFAULT,
  PROPOSAL_TYPE,
  REFERENCE_COORDINATE_TYPE_SSO,
  ROBUST_DEFAULT,
  SENSITIVITY_STATE,
  SET_CONTINUUM_SUBSTRACTION_DEFAULT,
  TAPER_DEFAULT,
  TYPE_CONTINUUM,
  TYPE_CONTINUUM_SPECTRAL,
  TYPE_PST,
  TYPE_ZOOM
} from '../constants';
import * as helpers from '../helpers';
import Proposal from '../types/proposal';
import type { ProposalFormAccess } from '@/models/proposals/proposal';
import {
  DATA_PRODUCT_KIND,
  DataProductInput,
  STEPPED_FIELD,
  steppedFromPdm
} from '@/models/proposals/dataProducts';
import { getDefaultObservationLowAA2 } from '../helpers';
import Observation from '../types/observation';
import {
  linkTarget,
  newDataProductsForMode,
  newObservationForMode,
  regenerateForMode,
  relinkSvTarget,
  setObservingMode
} from './AutoLinking';
import { getProposalFormDefaults } from '@/models/proposals/useProposalForm';
import { mockTarget } from './mockTarget';
import { mockCalibration } from './mockCalibration';

// The default data products, as the mocked id generator names them
const imageFields = {
  imageSize: { value: IMAGE_SIZE_DEFAULT, unit: 'deg' },
  pixelSize: { value: PIXEL_SIZE_DEFAULT, unit: 'arcsec' },
  weighting: 'briggs',
  robust: ROBUST_DEFAULT,
  taper: TAPER_DEFAULT,
  polarisations: ['I'],
  channelsOut: CHANNELS_OUT_DEFAULT
} as const;

const PST_TIMING_DATA_PRODUCT: DataProductInput = {
  id: 'SDP-0000000',
  observationId: 'obs-123',
  kind: DATA_PRODUCT_KIND.PST_TIMING
};

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

// The tests keep one proposal object as the store; this form reads and writes its slices on that
// same object, so each test can check every slice in one place
const formOver = (get: () => Partial<Proposal>, set: (proposal: Partial<Proposal>) => void) =>
  ({
    getValues: (name?: keyof Proposal) => (name ? get()[name] : get()),
    setValue: (name: keyof Proposal, value: unknown) => set({ ...get(), [name]: value })
  }) as unknown as ProposalFormAccess;

const mockAuthAxiosClient = {
  put: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: { clear: vi.fn(), eject: vi.fn(), use: vi.fn() },
    response: { clear: vi.fn(), eject: vi.fn(), use: vi.fn() }
  }
} as any;

describe('AutoLinking, newObservationForMode', () => {
  test('creates continuum observation', () => {
    vi.spyOn(helpers, 'generateObsSetId').mockReturnValue('obs-0000000');
    expect(newObservationForMode(TYPE_CONTINUUM)).deep.equal(DEFAULT_CONTINUUM_OBSERVATION_LOW);
  });
  test('creates zoom observation', () => {
    vi.spyOn(helpers, 'generateObsSetId').mockReturnValue('obs-0000000');
    expect(newObservationForMode(TYPE_ZOOM)).deep.equal(DEFAULT_ZOOM_OBSERVATION_LOW);
  });
  test('creates pst observation', () => {
    vi.spyOn(helpers, 'generateObsSetId').mockReturnValue('obs-0000000');
    expect(newObservationForMode(TYPE_PST)).deep.equal(DEFAULT_PST_OBSERVATION_LOW);
  });
  test('observationOut zoom overrides the static zoomChannels placeholder with the real cap', () => {
    vi.spyOn(helpers, 'generateObsSetId').mockReturnValue('obs-0000000');
    const result = newObservationForMode(TYPE_ZOOM, 4000);
    expect(result.zoomChannels).toBe(4000);
    expect(result).toEqual({ ...DEFAULT_ZOOM_OBSERVATION_LOW, zoomChannels: 4000 });
  });
  test('observationOut zoom keeps the static placeholder when no cap is provided', () => {
    vi.spyOn(helpers, 'generateObsSetId').mockReturnValue('obs-0000000');
    expect(newObservationForMode(TYPE_ZOOM)).deep.equal(DEFAULT_ZOOM_OBSERVATION_LOW);
  });
  test('observationOut continuum ignores maxZoomChannels (not a zoom observation)', () => {
    vi.spyOn(helpers, 'generateObsSetId').mockReturnValue('obs-0000000');
    expect(newObservationForMode(TYPE_CONTINUUM, 4000)).deep.equal(
      DEFAULT_CONTINUUM_OBSERVATION_LOW
    );
  });
});

describe('AutoLinking, newDataProductsForMode', () => {
  test('SDP default continuum', () => {
    vi.spyOn(helpers, 'generateDataProductId')
      .mockReturnValueOnce('SDP-0000000')
      .mockReturnValueOnce('SDP-0000001');
    const obs: Observation = {
      ...getDefaultObservationLowAA2(TYPE_CONTINUUM),
      id: 'obs-123'
    };
    const sdps = newDataProductsForMode(obs);
    expect(sdps).toHaveLength(2);
    // The main data product comes first, then the hidden visibilities one
    expect(sdps[0]).to.deep.equal(CONTINUUM_IMAGE_DATA_PRODUCT);
    expect(sdps[1]).toEqual({
      id: 'SDP-0000001',
      observationId: 'obs-123',
      kind: DATA_PRODUCT_KIND.CONTINUUM_VISIBILITIES,
      timeAveragingS: steppedFromPdm(4, STEPPED_FIELD.TIME_AVERAGING_S),
      frequencyAveragingKhz: steppedFromPdm(4, STEPPED_FIELD.FREQUENCY_AVERAGING_KHZ)
    });
  });

  test('SDP default spectral', () => {
    vi.spyOn(helpers, 'generateDataProductId')
      .mockReturnValueOnce('SDP-0000000')
      .mockReturnValueOnce('SDP-0000001');
    const obs: Observation = {
      ...getDefaultObservationLowAA2(TYPE_ZOOM),
      id: 'obs-123'
    };
    const sdps = newDataProductsForMode(obs);
    expect(sdps).toHaveLength(2);
    // The main data product comes first, then the hidden visibilities one
    expect(sdps[0]).to.deep.equal(SPECTRAL_DATA_PRODUCT);
    expect(sdps[1]).toMatchObject({
      observationId: 'obs-123',
      kind: DATA_PRODUCT_KIND.CONTINUUM_VISIBILITIES,
      frequencyAveragingKhz: steppedFromPdm(1, STEPPED_FIELD.FREQUENCY_AVERAGING_KHZ)
    });
  });

  test('SDP default PST', () => {
    vi.spyOn(helpers, 'generateDataProductId').mockReturnValue('SDP-0000000');
    const obs: Observation = {
      ...getDefaultObservationLowAA2(TYPE_PST),
      id: 'obs-123'
    };
    const sdps = newDataProductsForMode(obs);
    expect(sdps).toHaveLength(1);
    expect(sdps[0]).to.deep.equal(PST_TIMING_DATA_PRODUCT);
  });

  // Continuum and spectral weighting is already covered by the deep-equal fixture tests above;
  // continuum + spectral has no fixture of its own.
  test('defaults the continuum + spectral imaging data product to Briggs weighting with robust 0', () => {
    const obs: Observation = {
      ...getDefaultObservationLowAA2(TYPE_CONTINUUM_SPECTRAL),
      id: 'obs-123',
      type: TYPE_CONTINUUM_SPECTRAL
    };
    expect(newDataProductsForMode(obs)[0]).toMatchObject({
      kind: DATA_PRODUCT_KIND.CONTINUUM_SPECTRAL_IMAGE,
      weighting: 'briggs',
      robust: 0
    });
  });
});

// A new link has partial results: the sensitivity service calculates them
const PARTIAL_RESULTS = { state: SENSITIVITY_STATE.CALCULATING };

describe('regenerateForMode()', () => {
  let proposal: Partial<Proposal>;
  let getProposal: ReturnType<typeof vi.fn>;
  let setProposal: ReturnType<typeof vi.fn>;
  let form: ProposalFormAccess;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(helpers, 'generateCalibrationId').mockReturnValue('mock-0000000');
    vi.spyOn(helpers, 'generateDataProductId').mockReturnValue('mock-0000000');
    vi.spyOn(helpers, 'generateObsSetId').mockReturnValue('mock-0000000');

    // Start with an existing set of entities so we can assert replacement
    proposal = {
      targets: [mockTarget],
      observations: [{ ...DEFAULT_CONTINUUM_OBSERVATION_LOW, id: 'existing-obs' }],
      dataProducts: [
        { ...CONTINUUM_IMAGE_DATA_PRODUCT, id: 'existing-sdp', observationId: 'existing-obs' }
      ],
      targetObservation: [
        {
          targetId: mockTarget.id,
          observationId: 'existing-obs',
          dataProductsSDPId: 'existing-sdp',
          sensitivity: { stub: true } as any
        }
      ],
      calibrationStrategy: [
        { ...mockCalibration, id: 'existing-cal', observationIdRef: 'existing-obs' }
      ]
    };

    getProposal = vi.fn(() => proposal);
    setProposal = vi.fn((p: Proposal) => {
      proposal = p; // update the proposal "store"
    });
    form = formOver(
      () => proposal,
      (p) => {
        proposal = p;
      }
    );
  });

  it('replaces the observation and data products and links the target to them', async () => {
    await regenerateForMode(
      mockTarget,
      getProposal,
      setProposal,
      form,
      mockAuthAxiosClient,
      TYPE_CONTINUUM
    );

    expect(setProposal).toHaveBeenCalledTimes(1);

    // Verify proposal was updated
    expect(proposal.observations).toHaveLength(1);
    expect(proposal.observations?.[0].id).toBe('mock-0000000'); // replaced the existing observation

    expect(proposal.targets).toHaveLength(1);
    expect(proposal.targets?.[0]).toEqual(mockTarget);

    expect(proposal.dataProducts).toHaveLength(2);
    expect(proposal.dataProducts?.[0].observationId).toBe('mock-0000000');

    expect(proposal.calibrationStrategy).toHaveLength(1);

    expect(proposal.targetObservation).toHaveLength(1);
    expect(proposal.targetObservation?.[0].observationId).toBe('mock-0000000');
    expect(proposal.targetObservation?.[0].dataProductsSDPId).toBe(proposal.dataProducts?.[0].id);
    expect(proposal.targetObservation?.[0].sensitivity).toEqual(PARTIAL_RESULTS);
  });

  it('updates existing observations, calibrations, sdps, targets so that there is always only 1 of each', async () => {
    await regenerateForMode(
      mockTarget,
      getProposal,
      setProposal,
      form,
      mockAuthAxiosClient,
      TYPE_CONTINUUM
    );

    expect(setProposal).toHaveBeenCalledTimes(1);

    expect(proposal.targets).toHaveLength(1);
    expect(proposal.observations).toHaveLength(1);
    expect(proposal.dataProducts).toHaveLength(2);
    expect(proposal.calibrationStrategy).toHaveLength(1);

    expect(proposal.observations?.[0].id).not.toBe('existing-obs');
    expect(proposal.dataProducts?.[0].id).not.toBe('existing-sdp');
    expect(proposal.calibrationStrategy?.[0].id).not.toBe('existing-cal');
  });

  it('replaces existing entities with a PST observation and PST-specific SDP', async () => {
    // Request PST; initial proposal (from beforeEach) contains an existing continuum set
    await regenerateForMode(
      mockTarget,
      getProposal,
      setProposal,
      form,
      mockAuthAxiosClient,
      TYPE_PST
    );

    expect(setProposal).toHaveBeenCalledTimes(1);

    expect(proposal.targets).toHaveLength(1);
    expect(proposal.observations).toHaveLength(1);
    expect(proposal.dataProducts).toHaveLength(1);
    expect(proposal.calibrationStrategy).toHaveLength(1);
    expect(proposal.targetObservation).toHaveLength(1);

    expect(proposal.observations?.[0].id).not.toBe('existing-obs');
    expect(proposal.dataProducts?.[0].id).not.toBe('existing-sdp');
    expect(proposal.calibrationStrategy?.[0].id).not.toBe('existing-cal');

    const obs = proposal.observations?.[0];
    expect(obs?.type).toBe(TYPE_PST);

    const sdp = proposal.dataProducts?.[0];
    expect(sdp?.observationId).toBe(obs?.id);

    const link = proposal.targetObservation?.[0];
    expect(link?.observationId).toBe(obs?.id);
    expect(link?.dataProductsSDPId).toBe(sdp?.id);
    expect(link?.sensitivity).toEqual(PARTIAL_RESULTS);

    // The science category is left untouched
    expect(proposal.scienceCategory).toBeUndefined();
  });

  it('replaces existing entities with a Spectral (Zoom) observation and default SDP', async () => {
    // Request Spectral (Zoom); initial proposal (from beforeEach) contains an existing continuum set
    await regenerateForMode(
      mockTarget,
      getProposal,
      setProposal,
      form,
      mockAuthAxiosClient,
      TYPE_ZOOM
    );

    expect(setProposal).toHaveBeenCalledTimes(1);

    expect(proposal.targets).toHaveLength(1);
    expect(proposal.observations).toHaveLength(1);
    expect(proposal.dataProducts).toHaveLength(2);
    expect(proposal.calibrationStrategy).toHaveLength(1);
    expect(proposal.targetObservation).toHaveLength(1);

    expect(proposal.observations?.[0].id).not.toBe('existing-obs');
    expect(proposal.dataProducts?.[0].id).not.toBe('existing-sdp');
    expect(proposal.calibrationStrategy?.[0].id).not.toBe('existing-cal');

    const obs = proposal.observations?.[0];
    expect(obs?.type).toBe(TYPE_ZOOM);

    const sdp = proposal.dataProducts?.[0];
    expect(sdp?.observationId).toBe(obs?.id);

    expect(sdp).toMatchObject({ kind: DATA_PRODUCT_KIND.SPECTRAL_IMAGE, polarisations: ['I'] });

    const link = proposal.targetObservation?.[0];
    expect(link?.observationId).toBe(obs?.id);
    expect(link?.dataProductsSDPId).toBe(sdp?.id);
    expect(link?.sensitivity).toEqual(PARTIAL_RESULTS);

    // The science category is left untouched
    expect(proposal.scienceCategory).toBeUndefined();
  });

  it('replaces an initial PST observation with a Continuum observation and default SDP', async () => {
    // Override the initial proposal to start with PST entities
    proposal = {
      targets: [mockTarget],
      observations: [{ ...DEFAULT_PST_OBSERVATION_LOW, id: 'existing-pst-obs' }],
      dataProducts: [
        { ...PST_TIMING_DATA_PRODUCT, id: 'existing-pst-sdp', observationId: 'existing-pst-obs' }
      ],
      targetObservation: [
        {
          targetId: mockTarget.id,
          observationId: 'existing-pst-obs',
          dataProductsSDPId: 'existing-pst-sdp',
          sensitivity: { stub: true } as any
        }
      ],
      calibrationStrategy: [
        { ...mockCalibration, id: 'existing-pst-cal', observationIdRef: 'existing-pst-obs' }
      ]
    };

    // Request Continuum to replace PST
    await regenerateForMode(
      mockTarget,
      getProposal,
      setProposal,
      form,
      mockAuthAxiosClient,
      TYPE_CONTINUUM
    );

    expect(setProposal).toHaveBeenCalledTimes(1);

    expect(proposal.targets).toHaveLength(1);
    expect(proposal.observations).toHaveLength(1);
    expect(proposal.dataProducts).toHaveLength(2);
    expect(proposal.calibrationStrategy).toHaveLength(1);
    expect(proposal.targetObservation).toHaveLength(1);

    expect(proposal.observations?.[0].id).not.toBe('existing-pst-obs');
    expect(proposal.dataProducts?.[0].id).not.toBe('existing-pst-sdp');
    expect(proposal.calibrationStrategy?.[0].id).not.toBe('existing-pst-cal');

    const obs = proposal.observations?.[0];
    expect(obs?.type).toBe(TYPE_CONTINUUM);

    const sdp = proposal.dataProducts?.[0];
    expect(sdp?.observationId).toBe(obs?.id);
    expect(sdp).toMatchObject({ kind: DATA_PRODUCT_KIND.CONTINUUM_IMAGE, polarisations: ['I'] });

    const link = proposal.targetObservation?.[0];
    expect(link?.observationId).toBe(obs?.id);
    expect(link?.dataProductsSDPId).toBe(sdp?.id);
    expect(link?.sensitivity).toEqual(PARTIAL_RESULTS);

    // The science category is left untouched
    expect(proposal.scienceCategory).toBeUndefined();
  });

  it('keeps the existing observation type when no observing mode is passed', async () => {
    proposal = {
      ...proposal,
      observations: [{ ...DEFAULT_PST_OBSERVATION_LOW, id: 'existing-pst-obs' }]
    };
    await regenerateForMode(mockTarget, getProposal, setProposal, form, mockAuthAxiosClient);

    expect(proposal.observations?.[0].type).toBe(TYPE_PST);
  });

  it('handles missing properties in getProposal gracefully', async () => {
    // Override proposal to an empty object to simulate missing fields
    proposal = {} as unknown as Proposal;

    await regenerateForMode(
      mockTarget,
      getProposal,
      setProposal,
      form,
      mockAuthAxiosClient,
      TYPE_CONTINUUM
    );

    expect(setProposal).toHaveBeenCalledTimes(1);

    // The function should populate the required arrays even if they were missing
    expect(proposal.targets).toHaveLength(1);
    expect(proposal.observations).toHaveLength(1);
    expect(proposal.dataProducts).toHaveLength(2);
    expect(proposal.calibrationStrategy).toHaveLength(1);
    expect(proposal.targetObservation).toHaveLength(1);
  });

  it('creates a link for an SSO target', async () => {
    const ssoTarget = { ...mockTarget, kind: REFERENCE_COORDINATE_TYPE_SSO.value };
    await regenerateForMode(
      ssoTarget,
      getProposal,
      setProposal,
      form,
      mockAuthAxiosClient,
      TYPE_CONTINUUM
    );

    expect(setProposal).toHaveBeenCalledTimes(1);

    // the link is still created — that's the whole point of SSO support
    expect(proposal.targets).toHaveLength(1);
    expect(proposal.observations).toHaveLength(1);
    expect(proposal.dataProducts).toHaveLength(2);
    expect(proposal.calibrationStrategy).toHaveLength(1);
    expect(proposal.targetObservation).toHaveLength(1);

    // ...as partial, like any new link: the sensitivity service gives an SSO link no results
    expect(proposal.targetObservation?.[0].sensitivity).toEqual(PARTIAL_RESULTS);
  });
});

describe('setObservingMode()', () => {
  let proposal: Partial<Proposal>;
  let getProposal: ReturnType<typeof vi.fn>;
  let setProposal: ReturnType<typeof vi.fn>;
  let form: ProposalFormAccess;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(helpers, 'generateCalibrationId').mockReturnValue('mock-0000000');
    vi.spyOn(helpers, 'generateDataProductId').mockReturnValue('mock-0000000');
    vi.spyOn(helpers, 'generateObsSetId').mockReturnValue('mock-0000000');
    proposal = {
      abstract: 'An abstract',
      targets: [],
      observations: [{ ...DEFAULT_CONTINUUM_OBSERVATION_LOW, id: 'existing-obs' }],
      dataProducts: [
        { ...CONTINUUM_IMAGE_DATA_PRODUCT, id: 'existing-sdp', observationId: 'existing-obs' }
      ],
      targetObservation: [],
      calibrationStrategy: []
    };

    getProposal = vi.fn(() => proposal);
    setProposal = vi.fn((p: Proposal) => {
      proposal = p;
    });
    form = formOver(
      () => proposal,
      (p) => {
        proposal = p;
      }
    );
  });

  it('replaces only the observation and data products when there is no target', async () => {
    await setObservingMode(TYPE_PST, getProposal, setProposal, form, mockAuthAxiosClient);

    expect(setProposal).toHaveBeenCalledTimes(1);

    expect(proposal.observations).toHaveLength(1);
    expect(proposal.observations?.[0].type).toBe(TYPE_PST);
    expect(proposal.observations?.[0].id).toBe('mock-0000000');
    expect(proposal.dataProducts).toHaveLength(1);
    expect(proposal.dataProducts?.[0].observationId).toBe('mock-0000000');

    // The link and calibration need a target, so nothing is created for them
    expect(proposal.targetObservation).toEqual([]);
    expect(proposal.calibrationStrategy).toEqual([]);
    expect(proposal.abstract).toBe('An abstract');
  });

  it('applies the zoom channel cap to a spectral observation when there is no target', async () => {
    await setObservingMode(TYPE_ZOOM, getProposal, setProposal, form, mockAuthAxiosClient, 1234);

    expect(proposal.observations?.[0].type).toBe(TYPE_ZOOM);
    expect(proposal.observations?.[0].zoomChannels).toBe(1234);
  });

  it('regenerates everything when there is a target', async () => {
    proposal = { ...proposal, targets: [mockTarget] };

    await setObservingMode(TYPE_ZOOM, getProposal, setProposal, form, mockAuthAxiosClient);

    expect(proposal.observations).toHaveLength(1);
    expect(proposal.observations?.[0].type).toBe(TYPE_ZOOM);
    expect(proposal.targetObservation).toHaveLength(1);
    expect(proposal.targetObservation?.[0].targetId).toBe(mockTarget.id);
    expect(proposal.calibrationStrategy).toHaveLength(1);
    expect(proposal.abstract).toBe('An abstract');
  });
});

describe('linkTarget()', () => {
  let proposal: Partial<Proposal>;
  let getProposal: ReturnType<typeof vi.fn>;
  let setProposal: ReturnType<typeof vi.fn>;
  let form: ProposalFormAccess;

  const editedObservation: Observation = {
    ...DEFAULT_ZOOM_OBSERVATION_LOW,
    id: 'existing-obs',
    type: TYPE_ZOOM,
    centralFrequency: 123
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(helpers, 'generateCalibrationId').mockReturnValue('mock-cal');
    vi.spyOn(helpers, 'generateDataProductId').mockReturnValue('mock-sdp');
    vi.spyOn(helpers, 'generateObsSetId').mockReturnValue('mock-obs');
    proposal = {
      abstract: 'An abstract',
      targets: [],
      observations: [editedObservation],
      dataProducts: [
        { ...SPECTRAL_DATA_PRODUCT, id: 'existing-sdp', observationId: 'existing-obs' },
        {
          id: 'existing-hidden-sdp',
          observationId: 'existing-obs',
          kind: DATA_PRODUCT_KIND.CONTINUUM_VISIBILITIES,
          timeAveragingS: steppedFromPdm(4, STEPPED_FIELD.TIME_AVERAGING_S),
          frequencyAveragingKhz: steppedFromPdm(1, STEPPED_FIELD.FREQUENCY_AVERAGING_KHZ)
        }
      ],
      targetObservation: [],
      calibrationStrategy: [
        {
          observatoryDefined: true,
          id: 'existing-cal',
          observationIdRef: 'existing-obs',
          calibrators: null,
          notes: 'Existing notes'
        }
      ]
    };

    getProposal = vi.fn(() => proposal);
    setProposal = vi.fn((p: Proposal) => {
      proposal = p;
    });
    form = formOver(
      () => proposal,
      (p) => {
        proposal = p;
      }
    );
  });

  it('keeps the existing observation and data products and links the target to them', async () => {
    await linkTarget(mockTarget, getProposal, setProposal, form, mockAuthAxiosClient);

    expect(setProposal).toHaveBeenCalledTimes(1);

    expect(proposal.observations).toEqual([editedObservation]);
    expect(proposal.dataProducts?.map((dp) => dp.id)).toEqual([
      'existing-sdp',
      'existing-hidden-sdp'
    ]);
    expect(proposal.targets).toEqual([mockTarget]);
    expect(proposal.abstract).toBe('An abstract');

    expect(proposal.targetObservation).toEqual([
      {
        targetId: mockTarget.id,
        observationId: 'existing-obs',
        dataProductsSDPId: 'existing-sdp',
        sensitivity: PARTIAL_RESULTS
      }
    ]);
  });

  it("links the observation's main data product, not another observation's", async () => {
    proposal = {
      ...proposal,
      dataProducts: [
        { ...CONTINUUM_IMAGE_DATA_PRODUCT, id: 'other-sdp', observationId: 'other-obs' },
        ...(proposal.dataProducts ?? [])
      ]
    };

    await linkTarget(mockTarget, getProposal, setProposal, form, mockAuthAxiosClient);

    expect(proposal.targetObservation?.[0].dataProductsSDPId).toBe('existing-sdp');
  });

  it('creates a calibration strategy for the existing observation, keeping existing notes', async () => {
    await linkTarget(mockTarget, getProposal, setProposal, form, mockAuthAxiosClient);

    expect(proposal.calibrationStrategy).toHaveLength(1);
    expect(proposal.calibrationStrategy?.[0].observationIdRef).toBe('existing-obs');
    expect(proposal.calibrationStrategy?.[0].notes).toBe('Existing notes');
  });

  it('creates a default continuum observation and data products when there is no observation', async () => {
    proposal = { ...proposal, observations: [], dataProducts: [] };

    await linkTarget(mockTarget, getProposal, setProposal, form, mockAuthAxiosClient);

    expect(proposal.observations).toHaveLength(1);
    expect(proposal.observations?.[0].id).toBe('mock-obs');
    expect(proposal.observations?.[0].type).toBe(TYPE_CONTINUUM);
    // Continuum has an images data product plus a hidden visibilities one
    expect(proposal.dataProducts).toHaveLength(2);
    proposal.dataProducts?.forEach((dp) => expect(dp.observationId).toBe('mock-obs'));
    expect(proposal.targetObservation?.[0].observationId).toBe('mock-obs');
  });

  it('creates default data products when the observation has none', async () => {
    proposal = { ...proposal, dataProducts: [] };

    await linkTarget(mockTarget, getProposal, setProposal, form, mockAuthAxiosClient);

    expect(proposal.observations).toEqual([editedObservation]);
    expect(proposal.dataProducts?.length).toBeGreaterThan(0);
    proposal.dataProducts?.forEach((dp) => expect(dp.observationId).toBe('existing-obs'));
    expect(proposal.targetObservation?.[0].dataProductsSDPId).toBe('mock-sdp');
  });
});

describe('relinkSvTarget()', () => {
  const observation: Observation = { ...getDefaultObservationLowAA2(TYPE_CONTINUUM), id: 'obs-1' };
  const target = { ...mockTarget, id: 'target-1' } as never;
  // As loaded when the main data product was invalid at the last save: only its companion is left
  const leftover: DataProductInput = {
    id: 'SDP-old',
    observationId: 'obs-1',
    kind: DATA_PRODUCT_KIND.CONTINUUM_VISIBILITIES,
    timeAveragingS: steppedFromPdm(4, STEPPED_FIELD.TIME_AVERAGING_S),
    frequencyAveragingKhz: steppedFromPdm(4, STEPPED_FIELD.FREQUENCY_AVERAGING_KHZ)
  };
  const svValues = {
    ...getProposalFormDefaults(),
    proposalType: PROPOSAL_TYPE.SCIENCE_VERIFICATION,
    targets: [target],
    dataProducts: [leftover]
  };

  beforeEach(() => {
    vi.spyOn(helpers, 'generateDataProductId')
      .mockReturnValueOnce('SDP-0000000')
      .mockReturnValueOnce('SDP-0000001');
  });

  it('gives an SV target without a link the default data products, linked to it', () => {
    const relinked = relinkSvTarget(svValues, [observation]);

    // The leftover companion is replaced by the full default set
    expect(relinked.dataProducts).toEqual([
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
    expect(relinked.targetObservation).toEqual([
      {
        targetId: 'target-1',
        observationId: 'obs-1',
        dataProductsSDPId: 'SDP-0000000',
        sensitivity: PARTIAL_RESULTS
      }
    ]);
    expect(relinked.calibrationStrategy).toBe(svValues.calibrationStrategy);
  });

  it('gives a PST observation its one default data product', () => {
    const pst: Observation = { ...getDefaultObservationLowAA2(TYPE_PST), id: 'obs-1' };

    const relinked = relinkSvTarget(svValues, [pst]);

    expect(relinked.dataProducts).toHaveLength(1);
    expect(relinked.targetObservation[0].dataProductsSDPId).toBe(relinked.dataProducts[0].id);
  });

  it.each([
    [
      'a link',
      {
        targetObservation: [
          { targetId: 'target-1', observationId: 'obs-1', dataProductsSDPId: 'SDP-old' }
        ]
      }
    ],
    ['no target', { targets: [] }],
    ['another proposal type', { proposalType: PROPOSAL_TYPE.STANDARD }]
  ])('leaves a proposal with %s as it is', (_, change) => {
    const values = { ...svValues, ...change } as typeof svValues;

    expect(relinkSvTarget(values, [observation])).toBe(values);
  });
});
