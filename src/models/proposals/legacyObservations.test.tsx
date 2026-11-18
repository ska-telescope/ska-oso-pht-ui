import { describe, expect, test } from 'vitest';
import { PstMode } from '@/generated/models';
import { BAND_2_STR, BAND_LOW_STR, SA_AA2, SA_AA_STAR, SA_CUSTOM } from '@/utils/constants';
import { ObservationInput, OBSERVING_MODE, TELESCOPE } from './observations';
import { formObservationsFromLegacy, legacyObservationsFromForm } from './legacyObservations';

// TODO: Delete with legacyObservations.ts

const low = {
  telescope: TELESCOPE.LOW,
  groupId: null,
  observingBand: BAND_LOW_STR,
  subarray: SA_AA_STAR,
  minElevation: 45,
  numberOfStations: 307,
  integrationTime: { value: 2, unit: 'h' },
  centralFrequency: { value: 200, unit: 'MHz' }
} as const;

const mid = {
  telescope: TELESCOPE.MID,
  groupId: 'group-1',
  observingBand: BAND_2_STR,
  subarray: SA_AA2,
  elevation: 20,
  weather: 3,
  // Different counts, so a swap would show
  number15mAntennas: 4,
  number13mAntennas: 10,
  numberOfSubBands: 1,
  integrationTime: { value: 30, unit: 'min' },
  centralFrequency: { value: 1.355, unit: 'GHz' }
} as const;

const observations: ObservationInput[] = [
  {
    ...low,
    id: 'low-spectral',
    // The fine zoom factors are only available to a custom subarray
    subarray: SA_CUSTOM,
    observingMode: OBSERVING_MODE.SPECTRAL,
    // 1000 channels of 28.26 Hz
    bandwidth: { value: 0.02825702, unit: 'MHz' },
    zoomFactor: 2,
    zoomChannels: 1000
  },
  {
    ...low,
    id: 'low-pst',
    observingMode: OBSERVING_MODE.PST,
    bandwidth: { value: 75, unit: 'MHz' },
    pstMode: PstMode.PulsarTiming
  },
  {
    ...mid,
    id: 'mid-continuum',
    observingMode: OBSERVING_MODE.CONTINUUM,
    bandwidth: { value: 800, unit: 'MHz' }
  },
  {
    ...mid,
    id: 'mid-continuum-spectral',
    observingMode: OBSERVING_MODE.CONTINUUM_SPECTRAL,
    bandwidth: { value: 0.4, unit: 'GHz' }
  }
];

describe('legacy observations', () => {
  test('come back from the legacy store as they were', () => {
    const legacy = legacyObservationsFromForm(observations);
    expect(formObservationsFromLegacy(legacy.observations, legacy.groupObservations)).toEqual(
      observations
    );
  });

  test('keep the groups in the legacy group list', () => {
    expect(legacyObservationsFromForm(observations).groupObservations).toEqual([
      { observationId: 'mid-continuum', groupId: 'group-1' },
      { observationId: 'mid-continuum-spectral', groupId: 'group-1' }
    ]);
  });

  test('leave out incomplete observations', () => {
    const incomplete = { ...observations[2], id: 'incomplete', subarray: null };
    expect(
      legacyObservationsFromForm([observations[0], incomplete]).observations.map(({ id }) => id)
    ).toEqual(['low-spectral']);
  });
});
