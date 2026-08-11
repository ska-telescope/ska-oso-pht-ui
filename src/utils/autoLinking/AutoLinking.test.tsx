import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  DEFAULT_CONTINUUM_OBSERVATION_LOW,
  DEFAULT_PST_OBSERVATION_LOW,
  DEFAULT_ZOOM_OBSERVATION_LOW,
  DP_TYPE_VISIBLE,
  REFERENCE_COORDINATE_TYPE_SSO,
  STATUS_ERROR,
  STATUS_OK,
  TYPE_CONTINUUM,
  TYPE_PST,
  TYPE_ZOOM
} from '../constants';
import * as helpers from '../helpers';
import Proposal from '../types/proposal';
import { SDPImageContinuumData, SDPSpectralData } from '../types/dataProduct';
import { getDefaultObservationLowAA2 } from '../helpers';
import Observation from '../types/observation';
import autoLinking, {
  newCalibrationStrategy,
  newDataProductsForMode,
  newObservationForMode
} from './AutoLinking';
import { mockCalibration } from './mockCalibration';
import {
  CONTINUUM_IMAGE_DATA_PRODUCT,
  PST_TIMING_DATA_PRODUCT,
  SPECTRAL_DATA_PRODUCT
} from './mockSDP';
import { mockTarget } from './mockTarget';
import getSensCalc from '@services/axios/get/getSensitivityCalculator/sensitivityCalculator/getSensitivityCalculatorAPIData.ts';

const validMockSensCal = {
  id: 1,
  title: 'Mock Target',
  statusGUI: STATUS_OK,
  section1: [{ field: 'continuumSensitivityWeighted', value: '130.33', units: 'uJy / beam' }]
};

describe('autoLinking, newObservationForMode', () => {
  test('creates continuum observation', () => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('obs-0000000');
    expect(newObservationForMode(TYPE_CONTINUUM)).deep.equal(DEFAULT_CONTINUUM_OBSERVATION_LOW);
  });
  test('creates zoom observation', () => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('obs-0000000');
    expect(newObservationForMode(TYPE_ZOOM)).deep.equal(DEFAULT_ZOOM_OBSERVATION_LOW);
  });
  test('creates pst observation', () => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('obs-0000000');
    expect(newObservationForMode(TYPE_PST)).deep.equal(DEFAULT_PST_OBSERVATION_LOW);
  });
  test('observationOut zoom overrides the static zoomChannels placeholder with the real cap', () => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('obs-0000000');
    const result = newObservationForMode(TYPE_ZOOM, 4000);
    expect(result.zoomChannels).toBe(4000);
    expect(result).toEqual({ ...DEFAULT_ZOOM_OBSERVATION_LOW, zoomChannels: 4000 });
  });
  test('observationOut zoom keeps the static placeholder when no cap is provided', () => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('obs-0000000');
    expect(newObservationForMode(TYPE_ZOOM)).deep.equal(DEFAULT_ZOOM_OBSERVATION_LOW);
  });
  test('observationOut continuum ignores maxZoomChannels (not a zoom observation)', () => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('obs-0000000');
    expect(newObservationForMode(TYPE_CONTINUUM, 4000)).deep.equal(
      DEFAULT_CONTINUUM_OBSERVATION_LOW
    );
  });
});

describe('autoLinking, newDataProductsForMode', () => {
  test('SDP default continuum', () => {
    vi.spyOn(helpers, 'generateId')
      .mockReturnValueOnce('SDP-0000000')
      .mockReturnValueOnce('SDP-0000001');
    const obs: Observation = {
      ...getDefaultObservationLowAA2(TYPE_CONTINUUM),
      id: 'obs-123'
    };
    const sdps = newDataProductsForMode(obs);
    expect(sdps).toHaveLength(2);
    expect(sdps[0]).to.deep.equal(CONTINUUM_IMAGE_DATA_PRODUCT);
    expect(sdps[1].observationId).toBe('obs-123');
    expect(sdps[1].data?.dataProductType).toBe(DP_TYPE_VISIBLE);
  });

  test('SDP default spectral', () => {
    vi.spyOn(helpers, 'generateId')
      .mockReturnValueOnce('SDP-0000000')
      .mockReturnValueOnce('SDP-0000001');
    const obs: Observation = {
      ...getDefaultObservationLowAA2(TYPE_ZOOM),
      id: 'obs-123'
    };
    const sdps = newDataProductsForMode(obs);
    expect(sdps).toHaveLength(2);
    expect(sdps[0]).to.deep.equal(SPECTRAL_DATA_PRODUCT);
    expect(sdps[1].observationId).toBe('obs-123');
    expect(sdps[1].data?.dataProductType).toBe(DP_TYPE_VISIBLE);
  });

  test('SDP default PST', () => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('SDP-0000000');
    const obs: Observation = {
      ...getDefaultObservationLowAA2(TYPE_PST),
      id: 'obs-123'
    };
    const sdps = newDataProductsForMode(obs);
    expect(sdps).toHaveLength(1);
    expect(sdps[0]).to.deep.equal(PST_TIMING_DATA_PRODUCT);
  });
});

describe('autoLinking, newCalibrationStrategy', () => {
  test('creates default calibration strategy', () => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('cal-0000000');
    const calibration = newCalibrationStrategy('obs-123');
    expect(calibration).to.deep.equal(mockCalibration);
  });
});

vi.mock(
  '@services/axios/get/getSensitivityCalculator/sensitivityCalculator/getSensitivityCalculatorAPIData',
  () => ({
    default: vi.fn()
  })
);

describe('autoLinking()', () => {
  let proposal: Partial<Proposal>;
  let getProposal: ReturnType<typeof vi.fn>;
  let setProposal: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(helpers, 'generateId').mockReturnValue('mock-0000000');

    // Start with an existing set of entities so we can assert replacement
    proposal = {
      scienceCategory: TYPE_CONTINUUM,
      targets: [mockTarget],
      observations: [{ ...DEFAULT_CONTINUUM_OBSERVATION_LOW, id: 'existing-obs' }],
      dataProductSDP: [
        { ...CONTINUUM_IMAGE_DATA_PRODUCT, id: 'existing-sdp', observationId: 'existing-obs' }
      ],
      targetObservation: [
        {
          targetId: mockTarget.id,
          observationId: 'existing-obs',
          dataProductsSDPId: 'existing-sdp',
          sensCalc: { stub: true } as any
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
  });

  it('returns success and updates proposal when getSensCalc succeeds', async () => {
    vi.mocked(getSensCalc as any).mockResolvedValue(validMockSensCal);

    const result = await autoLinking(mockTarget, getProposal, setProposal, TYPE_CONTINUUM, '');

    expect(result).toEqual({ success: true });
    expect(setProposal).toHaveBeenCalledTimes(1);

    // Verify proposal was updated
    expect(proposal.observations).toHaveLength(1);
    expect(proposal.observations?.[0].id).toBe('mock-0000000'); // replaced the existing observation

    expect(proposal.targets).toHaveLength(1);
    expect(proposal.targets?.[0]).toEqual(mockTarget);

    expect(proposal.dataProductSDP).toHaveLength(2);
    expect(proposal.dataProductSDP?.[0].observationId).toBe('mock-0000000');

    expect(proposal.calibrationStrategy).toHaveLength(1);

    expect(proposal.targetObservation).toHaveLength(1);
    expect(proposal.targetObservation?.[0].observationId).toBe('mock-0000000');
    expect(proposal.targetObservation?.[0].dataProductsSDPId).toBe(proposal.dataProductSDP?.[0].id);
    expect(proposal.targetObservation?.[0].sensCalc).toEqual(validMockSensCal);
  });

  it('updates existing observations, calibrations, sdps, targets so that there is always only 1 of each', async () => {
    vi.mocked(getSensCalc as any).mockResolvedValue(validMockSensCal);

    const result = await autoLinking(mockTarget, getProposal, setProposal, TYPE_CONTINUUM, '');

    expect(result).toEqual({ success: true });
    expect(setProposal).toHaveBeenCalledTimes(1);

    expect(proposal.targets).toHaveLength(1);
    expect(proposal.observations).toHaveLength(1);
    expect(proposal.dataProductSDP).toHaveLength(2);
    expect(proposal.calibrationStrategy).toHaveLength(1);

    expect(proposal.observations?.[0].id).not.toBe('existing-obs');
    expect(proposal.dataProductSDP?.[0].id).not.toBe('existing-sdp');
    expect(proposal.calibrationStrategy?.[0].id).not.toBe('existing-cal');
  });

  it('replaces existing entities with a PST observation and PST-specific SDP', async () => {
    // SensCalc returns a valid result so targetObservation is created
    const mockSensCal = {
      id: 1,
      title: 'Mock Target',
      statusGUI: STATUS_OK,
      section1: [{ field: 'continuumSensitivityWeighted', value: '123', units: 'uJy / beam' }]
    };
    vi.mocked(getSensCalc as any).mockResolvedValue(mockSensCal);

    // Request PST; initial proposal (from beforeEach) contains an existing continuum set
    const result = await autoLinking(mockTarget, getProposal, setProposal, TYPE_PST, '');

    expect(result).toEqual({ success: true });
    expect(setProposal).toHaveBeenCalledTimes(1);

    expect(proposal.targets).toHaveLength(1);
    expect(proposal.observations).toHaveLength(1);
    expect(proposal.dataProductSDP).toHaveLength(1);
    expect(proposal.calibrationStrategy).toHaveLength(1);
    expect(proposal.targetObservation).toHaveLength(1);

    expect(proposal.observations?.[0].id).not.toBe('existing-obs');
    expect(proposal.dataProductSDP?.[0].id).not.toBe('existing-sdp');
    expect(proposal.calibrationStrategy?.[0].id).not.toBe('existing-cal');

    const obs = proposal.observations?.[0];
    expect(obs?.type).toBe(TYPE_PST);

    const sdp = proposal.dataProductSDP?.[0];
    expect(sdp?.observationId).toBe(obs?.id);

    const link = proposal.targetObservation?.[0];
    expect(link?.observationId).toBe(obs?.id);
    expect(link?.dataProductsSDPId).toBe(sdp?.id);
    expect(link?.sensCalc).toEqual(mockSensCal);

    // scienceCategory updated to PST as well
    expect(proposal.scienceCategory).toBe(TYPE_PST);
  });

  it('replaces existing entities with a Spectral (Zoom) observation and default SDP', async () => {
    // SensCalc returns a valid result so targetObservation is created
    const mockSensCal = {
      id: 1,
      title: 'Mock Target',
      statusGUI: STATUS_OK,
      section1: [{ field: 'continuumSensitivityWeighted', value: '45', units: 'uJy / beam' }]
    };
    vi.mocked(getSensCalc as any).mockResolvedValue(mockSensCal);

    // Request Spectral (Zoom); initial proposal (from beforeEach) contains an existing continuum set
    const result = await autoLinking(mockTarget, getProposal, setProposal, TYPE_ZOOM, '');

    expect(result).toEqual({ success: true });
    expect(setProposal).toHaveBeenCalledTimes(1);

    expect(proposal.targets).toHaveLength(1);
    expect(proposal.observations).toHaveLength(1);
    expect(proposal.dataProductSDP).toHaveLength(2);
    expect(proposal.calibrationStrategy).toHaveLength(1);
    expect(proposal.targetObservation).toHaveLength(1);

    expect(proposal.observations?.[0].id).not.toBe('existing-obs');
    expect(proposal.dataProductSDP?.[0].id).not.toBe('existing-sdp');
    expect(proposal.calibrationStrategy?.[0].id).not.toBe('existing-cal');

    const obs = proposal.observations?.[0];
    expect(obs?.type).toBe(TYPE_ZOOM);

    const sdp = proposal.dataProductSDP?.[0];
    expect(sdp?.observationId).toBe(obs?.id);

    expect((sdp?.data as SDPSpectralData)?.polarisations).toEqual(
      (SPECTRAL_DATA_PRODUCT.data as SDPSpectralData).polarisations
    );

    const link = proposal.targetObservation?.[0];
    expect(link?.observationId).toBe(obs?.id);
    expect(link?.dataProductsSDPId).toBe(sdp?.id);
    expect(link?.sensCalc).toEqual(mockSensCal);

    // scienceCategory updated to Spectral (Zoom) as well
    expect(proposal.scienceCategory).toBe(TYPE_ZOOM);
  });

  it('replaces an initial PST observation with a Continuum observation and default SDP', async () => {
    // Override the initial proposal to start with PST entities
    proposal = {
      scienceCategory: TYPE_PST,
      targets: [mockTarget],
      observations: [{ ...DEFAULT_PST_OBSERVATION_LOW, id: 'existing-pst-obs' }],
      dataProductSDP: [
        {
          ...PST_TIMING_DATA_PRODUCT,
          id: 'existing-pst-sdp',
          observationId: 'existing-pst-obs',
          data: {
            ...PST_TIMING_DATA_PRODUCT.data,
            polarisations: ['XX']
          } as SDPImageContinuumData
        }
      ],
      targetObservation: [
        {
          targetId: mockTarget.id,
          observationId: 'existing-pst-obs',
          dataProductsSDPId: 'existing-pst-sdp',
          sensCalc: { stub: true } as any
        }
      ],
      calibrationStrategy: [
        { ...mockCalibration, id: 'existing-pst-cal', observationIdRef: 'existing-pst-obs' }
      ]
    };

    vi.mocked(getSensCalc as any).mockResolvedValue(validMockSensCal);

    // Request Continuum to replace PST
    const result = await autoLinking(mockTarget, getProposal, setProposal, TYPE_CONTINUUM, '');

    expect(result).toEqual({ success: true });
    expect(setProposal).toHaveBeenCalledTimes(1);

    expect(proposal.targets).toHaveLength(1);
    expect(proposal.observations).toHaveLength(1);
    expect(proposal.dataProductSDP).toHaveLength(2);
    expect(proposal.calibrationStrategy).toHaveLength(1);
    expect(proposal.targetObservation).toHaveLength(1);

    expect(proposal.observations?.[0].id).not.toBe('existing-pst-obs');
    expect(proposal.dataProductSDP?.[0].id).not.toBe('existing-pst-sdp');
    expect(proposal.calibrationStrategy?.[0].id).not.toBe('existing-pst-cal');

    const obs = proposal.observations?.[0];
    expect(obs?.type).toBe(TYPE_CONTINUUM);

    const sdp = proposal.dataProductSDP?.[0];
    expect(sdp?.observationId).toBe(obs?.id);
    expect((sdp?.data as SDPImageContinuumData)?.polarisations).toEqual(
      (CONTINUUM_IMAGE_DATA_PRODUCT?.data as SDPImageContinuumData)?.polarisations
    );

    const link = proposal.targetObservation?.[0];
    expect(link?.observationId).toBe(obs?.id);
    expect(link?.dataProductsSDPId).toBe(sdp?.id);
    expect(link?.sensCalc).toEqual(validMockSensCal);

    // scienceCategory updated to Continuum as well
    expect(proposal.scienceCategory).toBe(TYPE_CONTINUUM);
  });

  it('returns error when getSensCalc returns an object with error', async () => {
    vi.mocked(getSensCalc as any).mockResolvedValue({
      id: 1,
      title: 'Sensitivity Calculator API error',
      statusGUI: STATUS_ERROR,
      error: 'Boom!'
    });

    const result = await autoLinking(mockTarget, getProposal, setProposal, TYPE_CONTINUUM, '');

    expect(result).to.deep.equal({ success: false, error: 'Boom!' });
    expect(setProposal).not.toHaveBeenCalled();

    // proposal should remain unchanged
    expect(proposal.observations).toHaveLength(1);
    expect(proposal.observations?.[0].id).toBe('existing-obs');
  });

  it('handles missing properties in getProposal gracefully', async () => {
    // Override proposal to have only scienceCategory to simulate missing fields
    proposal = { scienceCategory: TYPE_CONTINUUM } as unknown as Proposal;

    vi.mocked(getSensCalc as any).mockResolvedValue(validMockSensCal);

    const result = await autoLinking(mockTarget, getProposal, setProposal, TYPE_CONTINUUM, '');

    expect(result).toEqual({ success: true });
    expect(setProposal).toHaveBeenCalledTimes(1);

    // The function should populate the required arrays even if they were missing
    expect(proposal.targets).toHaveLength(1);
    expect(proposal.observations).toHaveLength(1);
    expect(proposal.dataProductSDP).toHaveLength(2);
    expect(proposal.calibrationStrategy).toHaveLength(1);
    expect(proposal.targetObservation).toHaveLength(1);
  });

  it('creates a link for an SSO target even without a sensCalc result', async () => {
    const ssoTarget = { ...mockTarget, kind: REFERENCE_COORDINATE_TYPE_SSO.value };
    // SSO targets skip the sensCalc call — getSensCalc resolves undefined
    vi.mocked(getSensCalc as any).mockResolvedValue(undefined);

    const result = await autoLinking(ssoTarget, getProposal, setProposal, TYPE_CONTINUUM, '');

    expect(result).toEqual({ success: true });
    expect(setProposal).toHaveBeenCalledTimes(1);

    // the link is still created — that's the whole point of SSO support
    expect(proposal.targets).toHaveLength(1);
    expect(proposal.observations).toHaveLength(1);
    expect(proposal.dataProductSDP).toHaveLength(2);
    expect(proposal.calibrationStrategy).toHaveLength(1);
    expect(proposal.targetObservation).toHaveLength(1);

    // ...but with no sensitivity result attached
    expect(proposal.targetObservation?.[0].sensCalc).toBeUndefined(); // ← verify: may be null
  });
});
