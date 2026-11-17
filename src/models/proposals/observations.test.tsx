import { describe, expect, test } from 'vitest';
import type { ObservationSets } from '@/generated/models';
import { OSD_CONSTANTS } from '@/utils/OSDConstants';
import phtTranslations from '../../../public/locales/en/pht.json';
import {
  getObservationSchema,
  getObservationsSchema,
  LOW_ZOOM_RESOLUTIONS,
  MID_ZOOM_RESOLUTIONS,
  newSvObservation,
  OBSERVING_MODE,
  observationFromPdm,
  observationsFromPdm,
  observationToPdm,
  spectralResolutionText,
  TELESCOPE,
  zoomFactorFromSpectralResolution
} from './observations';

const integrationTime = (value: number, unit: string) => ({
  supplied_type: 'integration_time' as const,
  quantity: { value, unit }
});

const lowObservation = (id: string, details: object): ObservationSets =>
  ({
    observation_set_id: id,
    observing_band: 'low_band',
    elevation: 20,
    array_details: { array: 'ska_low', subarray: 'aa2_sv', number_of_stations: 68 },
    observation_type_details: {
      central_frequency: { value: 200, unit: 'MHz' },
      supplied: integrationTime(1, 'h'),
      ...details
    }
  }) as ObservationSets;

const midObservation = (id: string, details: object): ObservationSets =>
  ({
    observation_set_id: id,
    group_id: 'group-1',
    observing_band: 'Band_2',
    elevation: 45,
    array_details: {
      array: 'ska_mid',
      subarray: 'custom',
      weather: 10,
      number_15_antennas: 100,
      number_13_antennas: 20,
      number_sub_bands: 2
    },
    observation_type_details: {
      central_frequency: { value: 1.4, unit: 'GHz' },
      supplied: integrationTime(30, 'min'),
      ...details
    }
  }) as ObservationSets;

const pdmObservations: ObservationSets[] = [
  lowObservation('low-continuum', {
    observation_type: 'continuum',
    bandwidth: { value: 75, unit: 'MHz' }
  }),
  lowObservation('low-continuum-spectral', {
    observation_type: 'continuum and spectral line',
    bandwidth: { value: 75, unit: 'MHz' }
  }),
  lowObservation('low-spectral', {
    observation_type: 'spectral line',
    bandwidth: { value: (1000 * 226.05613425925927) / 1e6, unit: 'MHz' },
    spectral_resolution: '226.06 Hz (338.8 m/s)',
    number_of_channels: 1000
  }),
  lowObservation('low-pst', {
    observation_type: 'pst',
    bandwidth: { value: 75, unit: 'MHz' },
    pst_mode: 'pulsar timing'
  }),
  midObservation('mid-continuum', {
    observation_type: 'continuum',
    bandwidth: { value: 0.4, unit: 'GHz' }
  }),
  midObservation('mid-continuum-spectral', {
    observation_type: 'continuum and spectral line',
    bandwidth: { value: 0.4, unit: 'GHz' }
  }),
  midObservation('mid-spectral', {
    observation_type: 'spectral line',
    bandwidth: { value: (4000 * 3360) / 1e6, unit: 'MHz' },
    spectral_resolution: '3.36 kHz (719.5 m/s)',
    number_of_channels: 4000
  }),
  midObservation('mid-pst', {
    observation_type: 'pst',
    bandwidth: { value: 0.4, unit: 'GHz' },
    pst_mode: 'flow through'
  })
];

const schema = getObservationSchema();
const issues = (obs: object) =>
  schema.safeParse(obs).error?.issues.map(({ path, message }) => ({ path, message })) ?? [];

describe('observation PDM mapping', () => {
  test('gives every observation set its telescope and observing mode', () => {
    expect(
      observationsFromPdm(pdmObservations).map((obs) => [obs.telescope, obs.observingMode])
    ).toEqual([
      [TELESCOPE.LOW, OBSERVING_MODE.CONTINUUM],
      [TELESCOPE.LOW, OBSERVING_MODE.CONTINUUM_SPECTRAL],
      [TELESCOPE.LOW, OBSERVING_MODE.SPECTRAL],
      [TELESCOPE.LOW, OBSERVING_MODE.PST],
      [TELESCOPE.MID, OBSERVING_MODE.CONTINUUM],
      [TELESCOPE.MID, OBSERVING_MODE.CONTINUUM_SPECTRAL],
      [TELESCOPE.MID, OBSERVING_MODE.SPECTRAL],
      [TELESCOPE.MID, OBSERVING_MODE.PST]
    ]);
  });

  test('loads a LOW spectral line observation', () => {
    expect(observationFromPdm(pdmObservations[2])).toEqual({
      id: 'low-spectral',
      groupId: null,
      telescope: TELESCOPE.LOW,
      observingBand: 'low_band',
      subarray: 'aa2_sv',
      minElevation: 20,
      numberOfStations: 68,
      centralFrequency: { value: 200, unit: 'MHz' },
      integrationTime: { value: 1, unit: 'h' },
      observingMode: OBSERVING_MODE.SPECTRAL,
      zoomFactor: 5,
      zoomChannels: 1000
    });
  });

  test('loads a MID PST observation, with each antenna count in its own field', () => {
    expect(observationFromPdm(pdmObservations[7])).toEqual({
      id: 'mid-pst',
      groupId: 'group-1',
      telescope: TELESCOPE.MID,
      observingBand: 'Band_2',
      subarray: 'custom',
      elevation: 45,
      weather: 10,
      number15mAntennas: 100,
      number13mAntennas: 20,
      numberOfSubBands: 2,
      centralFrequency: { value: 1.4, unit: 'GHz' },
      integrationTime: { value: 30, unit: 'min' },
      observingMode: OBSERVING_MODE.PST,
      bandwidth: { value: 0.4, unit: 'GHz' },
      pstMode: 'flow through'
    });
  });

  test.each(pdmObservations)('saves $observation_set_id as it was loaded', (set) => {
    expect(observationToPdm(schema.parse(observationFromPdm(set)))).toEqual(set);
  });

  test('loads an observation with no subarray, or one the editor does not know, without one', () => {
    const noSubarray = lowObservation('obs', { observation_type: 'continuum' });
    (noSubarray.array_details as { subarray?: string }).subarray = undefined;
    const unknown = midObservation('obs', { observation_type: 'continuum' });
    unknown.array_details.subarray = 'aa2';
    expect(observationFromPdm(noSubarray).subarray).toBeNull();
    expect(observationFromPdm(unknown).subarray).toBeNull();
  });

  test('saves the elevation of a MID observation and the minimum elevation of a LOW one', () => {
    expect(observationToPdm(schema.parse(observationFromPdm(pdmObservations[0]))).elevation).toBe(
      20
    );
    expect(observationToPdm(schema.parse(observationFromPdm(pdmObservations[4]))).elevation).toBe(
      45
    );
  });
});

describe('zoom spectral resolution', () => {
  test('gives the LOW zoom resolutions the editor has shown', () => {
    const shown = OSD_CONSTANTS.SpectralResolutionObLowZoom.map(({ value }) => {
      const [hz, velocity] = value.split(' Hz ');
      return `${Number(Number(hz).toFixed(2))} Hz ${velocity}`;
    });
    expect(
      LOW_ZOOM_RESOLUTIONS.map((factor) =>
        spectralResolutionText(TELESCOPE.LOW, factor, { value: 200, unit: 'MHz' })
      )
    ).toEqual(shown);
  });

  test('gives the MID zoom resolutions the editor has shown', () => {
    expect(
      MID_ZOOM_RESOLUTIONS.map(
        (factor) =>
          spectralResolutionText(TELESCOPE.MID, factor, { value: 1.4, unit: 'GHz' }).split(' (')[0]
      )
    ).toEqual([
      '0.21 kHz',
      '0.42 kHz',
      '0.84 kHz',
      '1.68 kHz',
      '3.36 kHz',
      '6.72 kHz',
      '13.44 kHz'
    ]);
  });

  test.each([
    [TELESCOPE.LOW, LOW_ZOOM_RESOLUTIONS],
    [TELESCOPE.MID, MID_ZOOM_RESOLUTIONS]
  ] as const)(
    'reads back the %s zoom factor from its spectral resolution',
    (telescope, factors) => {
      factors.forEach((factor) =>
        expect(
          zoomFactorFromSpectralResolution(
            telescope,
            spectralResolutionText(telescope, factor, { value: 300, unit: 'MHz' })
          )
        ).toBe(factor)
      );
    }
  );

  test('has no zoom factor for a spectral resolution that is not one', () => {
    expect(zoomFactorFromSpectralResolution(TELESCOPE.LOW, '5.43 kHz (8.1 km/s)')).toBeNull();
    expect(zoomFactorFromSpectralResolution(TELESCOPE.LOW, 'undefined')).toBeNull();
    expect(zoomFactorFromSpectralResolution(TELESCOPE.MID, null)).toBeNull();
  });
});

describe('observation schema', () => {
  const lowSpectral = observationFromPdm(pdmObservations[2]);
  const midContinuum = observationFromPdm(pdmObservations[4]);

  test('accepts every loaded observation', () => {
    expect(getObservationsSchema().safeParse(observationsFromPdm(pdmObservations)).success).toBe(
      true
    );
  });

  test('needs a subarray', () => {
    expect(issues({ ...midContinuum, subarray: null })).toEqual([
      { path: ['subarray'], message: phtTranslations.subArrayConfiguration.error }
    ]);
  });

  test('needs a whole number of channels', () => {
    const message = 'Number of channels must be a whole number of at least 2';
    expect(issues({ ...lowSpectral, zoomChannels: 12.5 })).toEqual([
      { path: ['zoomChannels'], message }
    ]);
    expect(issues({ ...lowSpectral, zoomChannels: 1 })).toEqual([
      { path: ['zoomChannels'], message }
    ]);
  });

  test('has only the coarse zoom factors for LOW AA2 and AA*, even when other fields are invalid', () => {
    const restricted = { ...lowSpectral, zoomFactor: 4, zoomChannels: 1.5 };
    expect(issues(restricted)).toEqual([
      { path: ['zoomChannels'], message: expect.any(String) },
      { path: ['zoomFactor'], message: phtTranslations.spectralResolution.restrictedError }
    ]);
    expect(issues({ ...restricted, zoomChannels: 1000, subarray: 'custom' })).toEqual([]);
  });

  test('has the LOW and MID zoom factors', () => {
    expect(issues({ ...lowSpectral, zoomFactor: 8 })).toEqual([]);
    expect(issues({ ...lowSpectral, zoomFactor: 9 })).toEqual([
      { path: ['zoomFactor'], message: phtTranslations.spectralResolution.error }
    ]);
    const midSpectral = observationFromPdm(pdmObservations[6]);
    expect(issues({ ...midSpectral, zoomFactor: 7 })).toEqual([]);
    expect(issues({ ...midSpectral, zoomFactor: 8 })).toEqual([
      { path: ['zoomFactor'], message: phtTranslations.spectralResolution.error }
    ]);
  });

  test('limits the integration time to 4 hours in the chosen unit', () => {
    expect(issues({ ...midContinuum, integrationTime: { value: 240, unit: 'min' } })).toEqual([]);
    expect(issues({ ...midContinuum, integrationTime: { value: 241, unit: 'min' } })).toEqual([
      { path: ['integrationTime', 'value'], message: expect.any(String) }
    ]);
    expect(issues({ ...midContinuum, integrationTime: { value: 4, unit: 'h' } })).toEqual([]);
  });

  test('checks the elevation against the range in the OSD', () => {
    const osd = {
      mid: { minElevationDeg: 15, maxElevationDeg: 85 },
      low: { minElevationDeg: 20, maxElevationDeg: 90 }
    };
    const withOsd = (obs: object) =>
      getObservationSchema(osd)
        .safeParse(obs)
        .error?.issues.map(({ path, message }) => ({ path, message })) ?? [];
    expect(withOsd({ ...lowSpectral, minElevation: 20 })).toEqual([]);
    expect(withOsd({ ...lowSpectral, minElevation: 19 })).toEqual([
      { path: ['minElevation'], message: expect.any(String) }
    ]);
    expect(withOsd({ ...midContinuum, elevation: 85 })).toEqual([]);
    expect(withOsd({ ...midContinuum, elevation: 86 })).toEqual([
      { path: ['elevation'], message: expect.any(String) }
    ]);
  });

  test('does not check the elevation range while the OSD is not loaded', () => {
    expect(issues({ ...lowSpectral, minElevation: 5 })).toEqual([]);
  });
});

describe('SV default observation', () => {
  test.each(Object.values(OBSERVING_MODE))('is valid in %s mode', (observingMode) => {
    const osd = { low: { minElevationDeg: 15, maxElevationDeg: 90 } };
    expect(
      getObservationSchema(osd).safeParse(newSvObservation(observingMode, 15)).error
    ).toBeUndefined();
  });
});
