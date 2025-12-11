import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DEFAULT_DATA_PRODUCT } from '@utils/defaults/dataProduct.tsx';
import {
  DEFAULT_CONTINUUM_OBSERVATION_LOW_AA2,
  DEFAULT_PST_OBSERVATION_LOW_AA2,
  DEFAULT_ZOOM_OBSERVATION_LOW_AA2,
  TYPE_CONTINUUM,
  TYPE_PST,
  TYPE_ZOOM
} from '../constants';
import * as helpers from '../helpers';
import { calculateSensCalcData } from '../sensCalc/sensCalc';
import Proposal from '../types/proposal';
import autoLinking, { calibrationOut, dataProductSDPOut, observationOut } from './AutoLinking';
import { mockCalibration } from './mockCalibration';
import { PST_DATA_PRODUCT } from './mockSDP';
import { mockTarget, mockTarget2 } from './mockTarget';

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
    const sdp = dataProductSDPOut('obs-123', TYPE_CONTINUUM);
    expect(sdp).to.deep.equal(DEFAULT_DATA_PRODUCT);
  });
  test('SDP default spectral', () => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('SDP-0000000');
    const sdp = dataProductSDPOut('obs-123', TYPE_ZOOM);
    expect(sdp).to.deep.equal(DEFAULT_DATA_PRODUCT);
  });
  test('SDP default PST', () => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('SDP-0000000');
    const sdp = dataProductSDPOut('obs-123', TYPE_PST);
    expect(sdp).to.deep.equal(PST_DATA_PRODUCT);
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
  let getProposal: ReturnType<typeof vi.fn>;
  let setProposal: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.spyOn(helpers, 'generateId').mockReturnValue('mock-0000000');

    getProposal = vi.fn(() => ({
      scienceCategory: TYPE_CONTINUUM,
      targets: [mockTarget],
      observations: [],
      dataProductSDP: [],
      targetObservation: [],
      calibrationStrategy: []
    }));

    setProposal = vi.fn();

    vi.clearAllMocks();
  });

  it('returns error when calculateSensCalcData returns an object with error', async () => {
    (calculateSensCalcData as any).mockResolvedValue({ error: 'Boom!' });
    const result = await autoLinking(mockTarget, getProposal, setProposal, true);
    expect(result).to.deep.equal({ success: false, error: 'Boom!' });
    expect(setProposal).not.toHaveBeenCalled();
  });

  it('returns success and updates proposal when calculateSensCalcData succeeds', async () => {
    const mockSensCal = { continuum_sensitivity: { value: 130.3344803749966, unit: 'uJy / beam' } };
    (calculateSensCalcData as any).mockResolvedValue(mockSensCal);
    const result = await autoLinking(mockTarget, getProposal, setProposal, true);
    expect(result).toEqual({ success: true });
    expect(setProposal).toHaveBeenCalledTimes(1);
  });

  it('does not add new target when addNewTarget=false', async () => {
    const mockSensCal = { continuum_sensitivity: { value: 130.3344803749966, unit: 'uJy / beam' } };
    (calculateSensCalcData as any).mockResolvedValue(mockSensCal);
    await autoLinking(mockTarget2, getProposal, setProposal, false);
    // check the first argument of the first mock call of setProposal => (proposal)
    const updated = setProposal.mock.calls[0][0] as Proposal;
    // Should keep original targets unchanged
    expect(updated.targets).toEqual([mockTarget]);
  });

  it('handles missing properties in getProposal gracefully', async () => {
    getProposal = vi.fn(() => ({
      scienceCategory: TYPE_CONTINUUM
    }));
    const mockSensCal = { continuum_sensitivity: { value: 130.3344803749966, unit: 'uJy / beam' } };
    (calculateSensCalcData as any).mockResolvedValue(mockSensCal);
    const result = await autoLinking(mockTarget, getProposal, setProposal, true);
    expect(result).toEqual({ success: true });
    expect(setProposal).toHaveBeenCalledTimes(1);
  });

  it('handles missing generated objects gracefully', async () => {
    const mockSensCal = null;
    (calculateSensCalcData as any).mockResolvedValue(mockSensCal);
    const result = await autoLinking(mockTarget, getProposal, setProposal, true);
    expect(result).toEqual({ success: true });
    expect(setProposal).toHaveBeenCalledTimes(1);
    // check the first mock call of setProposal => (proposal)
    const updated = setProposal.mock.calls[0][0] as Proposal;
    // Should keep original targetObservations unchanged
    expect(updated.targetObservation).toEqual([]);
  });
});
