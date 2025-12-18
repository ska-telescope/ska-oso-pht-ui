// updateObservations.test.ts
import { describe, it, expect } from 'vitest';
import Observation from '../../types/observation';
import { BAND_LOW_STR, OB_SUBARRAY_AA2, TELESCOPE_LOW_NUM, TYPE_CONTINUUM } from '../../constants';
import updateObservations from './updateObservations';

describe('updateObservations', () => {
  const obs1: Observation = {
    id: '1',
    telescope: TELESCOPE_LOW_NUM,
    subarray: OB_SUBARRAY_AA2,
    linked: 'false',
    type: TYPE_CONTINUUM,
    observingBand: BAND_LOW_STR,
    elevation: 0,
    centralFrequency: 0,
    centralFrequencyUnits: 0,
    bandwidth: null,
    continuumBandwidth: null,
    continuumBandwidthUnits: null,
    supplied: {
      type: 0,
      value: 0,
      units: 0
    },
    spectralResolution: '',
    effectiveResolution: ''
  };

  const obs2: Observation = {
    id: '2',
    telescope: TELESCOPE_LOW_NUM,
    subarray: OB_SUBARRAY_AA2,
    linked: 'false',
    type: TYPE_CONTINUUM,
    observingBand: BAND_LOW_STR,
    elevation: 0,
    centralFrequency: 0,
    centralFrequencyUnits: 0,
    bandwidth: null,
    continuumBandwidth: null,
    continuumBandwidthUnits: null,
    supplied: {
      type: 0,
      value: 0,
      units: 0
    },
    spectralResolution: '',
    effectiveResolution: ''
  };

  it('replaces an existing observation when IDs match', () => {
    const newRec: Observation = { ...obs2, id: '2' } as Observation;
    const result = updateObservations([obs1, obs2], newRec);

    expect(result).toHaveLength(2);
    expect(result[1]).toEqual(newRec);
    expect(result[0]).toEqual(obs1);
  });

  it('adds a new observation when oldRecs is empty', () => {
    const newRec: Observation = {
      id: '99',
      telescope: TELESCOPE_LOW_NUM,
      subarray: OB_SUBARRAY_AA2,
      linked: 'false',
      type: TYPE_CONTINUUM,
      observingBand: BAND_LOW_STR,
      elevation: 0,
      centralFrequency: 0,
      centralFrequencyUnits: 0,
      bandwidth: null,
      continuumBandwidth: null,
      continuumBandwidthUnits: null,
      supplied: { type: 0, value: 0, units: 0 },
      spectralResolution: '',
      effectiveResolution: ''
    };
    const result = updateObservations([], newRec);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(newRec);
  });

  it('adds a new observation when oldRecs is undefined/null', () => {
    const newRec: Observation = {
      id: '100',
      telescope: TELESCOPE_LOW_NUM,
      subarray: OB_SUBARRAY_AA2,
      linked: 'false',
      type: TYPE_CONTINUUM,
      observingBand: BAND_LOW_STR,
      elevation: 0,
      centralFrequency: 0,
      centralFrequencyUnits: 0,
      bandwidth: null,
      continuumBandwidth: null,
      continuumBandwidthUnits: null,
      supplied: { type: 0, value: 0, units: 0 },
      spectralResolution: '',
      effectiveResolution: ''
    };
    // @ts-expect-error testing null input
    const result = updateObservations(null, newRec);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(newRec);
  });

  it('keeps existing observations when ID does not match', () => {
    const newRec: Observation = {
      id: '99',
      telescope: TELESCOPE_LOW_NUM,
      subarray: OB_SUBARRAY_AA2,
      linked: 'false',
      type: TYPE_CONTINUUM,
      observingBand: BAND_LOW_STR,
      elevation: 0,
      centralFrequency: 0,
      centralFrequencyUnits: 0,
      bandwidth: null,
      continuumBandwidth: null,
      continuumBandwidthUnits: null,
      supplied: { type: 0, value: 0, units: 0 },
      spectralResolution: '',
      effectiveResolution: ''
    };
    const result = updateObservations([obs1, obs2], newRec);

    expect(result).toHaveLength(2);
    expect(result).toContainEqual(obs1);
    expect(result).toContainEqual(obs2);
  });
});
