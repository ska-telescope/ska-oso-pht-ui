import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  DEFAULT_CONTINUUM_OBSERVATION_LOW_AA2,
  DEFAULT_OBSERVATIONS_LOW_AA2,
  DEFAULT_PST_OBSERVATION_LOW_AA2,
  DEFAULT_ZOOM_OBSERVATION_LOW_AA2,
  TYPE_CONTINUUM,
  TYPE_PST,
  TYPE_ZOOM
} from '../constants';
import * as helpers from '../helpers';
import { calculateSensCalcData } from '../sensCalc/sensCalc';
import Proposal from '../types/proposal';
import {
  SDPImageContinuumData,
  SDPSpectralData
} from '../types/dataProduct';
import autoLinking, { calibrationOut, dataProductSDPOut, observationOut } from './AutoLinking';
import { mockCalibration } from './mockCalibration';
import {
  CONTINUUM_IMAGE_DATA_PRODUCT,
  PST_FLOW_THROUGH_DATA_PRODUCT,
  SPECTRAL_DATA_PRODUCT
} from './mockSDP';
import { mockTarget } from './mockTarget';

describe('autoLinking, observationOut', () => {
  test('observationOut continuum', () => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('obs-0000000');
    expect(observationOut(TYPE_CONTINUUM)).deep.equal(DEFAULT_CONTINUUM_OBSERVATION_LOW_AA2);
  });
  test('observationOut zoom', () => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('obs-0000000');
    expect(observationOut(TYPE_ZOOM)).deep.equal(DEFAULT_ZOOM_OBSERVATION_LOW_AA2);
  });
  test('observationOut pst', () => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('obs-0000000');
    expect(observationOut(TYPE_PST)).deep.equal(DEFAULT_PST_OBSERVATION_LOW_AA2);
  });
});

describe('autoLinking, dataProductSDPOut', () => {
  test('SDP default continuum', () => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('SDP-0000000');
    const obs = {
      ...DEFAULT_OBSERVATIONS_LOW_AA2[TYPE_CONTINUUM],
      id: 'obs-123'
    };
    const sdp = dataProductSDPOut(obs);
    expect(sdp).to.deep.equal(CONTINUUM_IMAGE_DATA_PRODUCT);
  });
  test('SDP default spectral', () => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('SDP-0000000');
    const obs = {
      ...DEFAULT_OBSERVATIONS_LOW_AA2[TYPE_ZOOM],
      id: 'obs-123'
    };
    const sdp = dataProductSDPOut(obs);
    expect(sdp).to.deep.equal(SPECTRAL_DATA_PRODUCT);
  });
  test('SDP default PST', () => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('SDP-0000000');
    const obs = {
      ...DEFAULT_OBSERVATIONS_LOW_AA2[TYPE_PST],
      id: 'obs-123'
    };
    const sdp = dataProductSDPOut(obs);
    expect(sdp).to.deep.equal(PST_FLOW_THROUGH_DATA_PRODUCT);
  });
});

describe('autoLinking, calibrationOut', () => {
  test('calibrationOut', () => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('cal-0000000');
    const calibration = calibrationOut('obs-123');
    expect(calibration).to.deep.equal(mockCalibration);
  });
});

vi.mock('../sensCalc/sensCalc', () => ({
  calculateSensCalcData: vi.fn()
}));

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
      observations: [{ ...DEFAULT_CONTINUUM_OBSERVATION_LOW_AA2, id: 'existing-obs' }],
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

  it('returns success and updates proposal when calculateSensCalcData succeeds', async () => {
    const mockSensCal = { continuum_sensitivity: { value: 130.3344803749966, unit: 'uJy / beam' } };
    vi.mocked(calculateSensCalcData as any).mockResolvedValue(mockSensCal);

    const result = await autoLinking(mockTarget, getProposal, setProposal, TYPE_CONTINUUM, '');

    expect(result).toEqual({ success: true });
    expect(setProposal).toHaveBeenCalledTimes(1);

    // Verify proposal was updated
    expect(proposal.observations).toHaveLength(1);
    expect(proposal.observations?.[0].id).toBe('mock-0000000'); // replaced the existing observation

    expect(proposal.targets).toHaveLength(1);
    expect(proposal.targets?.[0]).toEqual(mockTarget);

    expect(proposal.dataProductSDP).toHaveLength(1);
    expect(proposal.dataProductSDP?.[0].observationId).toBe('mock-0000000');

    expect(proposal.calibrationStrategy).toHaveLength(1);

    expect(proposal.targetObservation).toHaveLength(1);
    expect(proposal.targetObservation?.[0].observationId).toBe('mock-0000000');
    expect(proposal.targetObservation?.[0].dataProductsSDPId).toBe(proposal.dataProductSDP?.[0].id);
    expect(proposal.targetObservation?.[0].sensCalc).toEqual(mockSensCal);
  });

  it('updates existing observations, calibrations, sdps, targets so that there is always only 1 of each', async () => {
    const mockSensCal = { continuum_sensitivity: { value: 130.3344803749966, unit: 'uJy / beam' } };
    vi.mocked(calculateSensCalcData as any).mockResolvedValue(mockSensCal);

    const result = await autoLinking(mockTarget, getProposal, setProposal, TYPE_CONTINUUM, '');

    expect(result).toEqual({ success: true });
    expect(setProposal).toHaveBeenCalledTimes(1);

    expect(proposal.targets).toHaveLength(1);
    expect(proposal.observations).toHaveLength(1);
    expect(proposal.dataProductSDP).toHaveLength(1);
    expect(proposal.calibrationStrategy).toHaveLength(1);

    expect(proposal.observations?.[0].id).not.toBe('existing-obs');
    expect(proposal.dataProductSDP?.[0].id).not.toBe('existing-sdp');
    expect(proposal.calibrationStrategy?.[0].id).not.toBe('existing-cal');
  });

  it('replaces existing entities with a PST observation and PST-specific SDP', async () => {
    // SensCalc returns a valid result so targetObservation is created
    const mockSensCal = { continuum_sensitivity: { value: 123, unit: 'uJy / beam' } };
    vi.mocked(calculateSensCalcData as any).mockResolvedValue(mockSensCal);

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
    const mockSensCal = { continuum_sensitivity: { value: 45, unit: 'uJy / beam' } };
    vi.mocked(calculateSensCalcData as any).mockResolvedValue(mockSensCal);

    // Request Spectral (Zoom); initial proposal (from beforeEach) contains an existing continuum set
    const result = await autoLinking(mockTarget, getProposal, setProposal, TYPE_ZOOM, '');

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
    expect(obs?.type).toBe(TYPE_ZOOM);

    const sdp = proposal.dataProductSDP?.[0];
    expect(sdp?.observationId).toBe(obs?.id);

    expect((sdp?.data as SDPSpectralData)?.polarisations).toEqual(
      SPECTRAL_DATA_PRODUCT.data.polarisations
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
      observations: [{ ...DEFAULT_PST_OBSERVATION_LOW_AA2, id: 'existing-pst-obs' }],
      dataProductSDP: [
        {
          ...PST_FLOW_THROUGH_DATA_PRODUCT,
          id: 'existing-pst-sdp',
          observationId: 'existing-pst-obs',
          data: {
            ...PST_FLOW_THROUGH_DATA_PRODUCT.data,
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

    // SensCalc returns a valid result
    const mockSensCal = { continuum_sensitivity: { value: 77.7, unit: 'uJy / beam' } };
    vi.mocked(calculateSensCalcData as any).mockResolvedValue(mockSensCal);

    // Request Continuum to replace PST
    const result = await autoLinking(mockTarget, getProposal, setProposal, TYPE_CONTINUUM, '');

    expect(result).toEqual({ success: true });
    expect(setProposal).toHaveBeenCalledTimes(1);

    expect(proposal.targets).toHaveLength(1);
    expect(proposal.observations).toHaveLength(1);
    expect(proposal.dataProductSDP).toHaveLength(1);
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
    expect(link?.sensCalc).toEqual(mockSensCal);

    // scienceCategory updated to Continuum as well
    expect(proposal.scienceCategory).toBe(TYPE_CONTINUUM);
  });

  it('returns error when calculateSensCalcData returns an object with error', async () => {
    vi.mocked(calculateSensCalcData as any).mockResolvedValue({ error: 'Boom!' });

    const result = await autoLinking(mockTarget, getProposal, setProposal, TYPE_CONTINUUM, '');

    expect(result).to.deep.equal({ success: false, error: 'Boom!' });
    expect(setProposal).not.toHaveBeenCalled();

    // proposal should remain unchanged
    expect(proposal.observations).toHaveLength(1);
    expect(proposal.observations?.[0].id).toBe('existing-obs');
  });

  it('handles missing properties in getProposal gracefully', async () => {
    // Override proposal to have only scienceCategory to simulate missing fields
    proposal = ({ scienceCategory: TYPE_CONTINUUM } as unknown) as Proposal;

    const mockSensCal = { continuum_sensitivity: { value: 130.3344803749966, unit: 'uJy / beam' } };
    vi.mocked(calculateSensCalcData as any).mockResolvedValue(mockSensCal);

    const result = await autoLinking(mockTarget, getProposal, setProposal, TYPE_CONTINUUM, '');

    expect(result).toEqual({ success: true });
    expect(setProposal).toHaveBeenCalledTimes(1);

    // The function should populate the required arrays even if they were missing
    expect(proposal.targets).toHaveLength(1);
    expect(proposal.observations).toHaveLength(1);
    expect(proposal.dataProductSDP).toHaveLength(1);
    expect(proposal.calibrationStrategy).toHaveLength(1);
    expect(proposal.targetObservation).toHaveLength(1);
  });

  it('handles missing generated objects gracefully (no sensCalc result ⇒ no targetObservation link)', async () => {
    vi.mocked(calculateSensCalcData as any).mockResolvedValue(null);

    const result = await autoLinking(mockTarget, getProposal, setProposal, TYPE_CONTINUUM, '');

    expect(result).toEqual({ success: true });
    expect(setProposal).toHaveBeenCalledTimes(1);

    // With null sensCalc, targetObservation should be an empty array
    expect(proposal.targetObservation).toEqual([]);
  });
});
