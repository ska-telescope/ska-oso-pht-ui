import { describe, expect, test } from 'vitest';
import type { ObservationSets } from '@/generated/models';
import { OSD_CONSTANTS } from '@/utils/OSDConstants';
import {
  BAND_1_STR,
  BAND_2_STR,
  BAND_5B_STR,
  BAND_LOW_STR,
  SA_AA2,
  SA_AA_STAR,
  SA_CUSTOM
} from '@/utils/constants';
import { MockObservatoryDataFrontend } from '@services/axios/get/getObservatoryData/mockObservatoryDataFrontend';
import phtTranslations from '@/locales/en/pht.json';
import {
  centralFrequencyGridHz,
  getObservationSchema,
  getObservationsSchema,
  LOW_ZOOM_RESOLUTIONS,
  MID_ZOOM_RESOLUTIONS,
  newObservation,
  newSvObservation,
  ObservationInput,
  observationForBand,
  observationForMode,
  observationForSubarray,
  OBSERVING_MODE,
  observationFromPdm,
  observationsFromPdm,
  observationToPdm,
  spectralBandwidth,
  spectralResolutionText,
  TELESCOPE,
  zoomChannelsForBandwidth,
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
      central_frequency: { value: 1400, unit: 'MHz' },
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
    bandwidth: { value: 400, unit: 'MHz' }
  }),
  midObservation('mid-continuum-spectral', {
    observation_type: 'continuum and spectral line',
    bandwidth: { value: 400, unit: 'MHz' }
  }),
  midObservation('mid-spectral', {
    observation_type: 'spectral line',
    bandwidth: { value: (4000 * 3360) / 1e6, unit: 'MHz' },
    spectral_resolution: '3.36 kHz (719.5 m/s)',
    number_of_channels: 4000
  }),
  midObservation('mid-pst', {
    observation_type: 'pst',
    bandwidth: { value: 400, unit: 'MHz' },
    pst_mode: 'flow through'
  })
];

const schema = getObservationSchema();
const issues = (obs: object) =>
  schema.safeParse(obs).error?.issues.map(({ path, message }) => ({ path, message })) ?? [];

// The mock OSD: LOW 49.609375-349.609375 MHz in coarse channels of 781.25 kHz, LOW AA2 with up to
// 150 MHz and 1800 zoom channels, MID band 2 0.95-1.76 GHz, elevations 15-85 (MID) and 15-90 (LOW)
const osd = MockObservatoryDataFrontend.capabilities;
const osdSchema = getObservationSchema(osd);
const osdIssues = (obs: object) =>
  osdSchema.safeParse(obs).error?.issues.map(({ path, message }) => ({ path, message })) ?? [];

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
      // 1000 channels of 226.06 Hz, to 0.01 Hz
      bandwidth: { value: 0.22605613, unit: 'MHz' },
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
      centralFrequency: { value: 1400, unit: 'MHz' },
      integrationTime: { value: 30, unit: 'min' },
      observingMode: OBSERVING_MODE.PST,
      bandwidth: { value: 400, unit: 'MHz' },
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

test('loads a central frequency and bandwidth saved in another unit in MHz', () => {
  const inGhz = midObservation('obs', {
    observation_type: 'continuum',
    central_frequency: { value: 1.4, unit: 'GHz' },
    bandwidth: { value: 0.4, unit: 'GHz' }
  });
  expect(observationFromPdm(inGhz)).toMatchObject({
    centralFrequency: { value: 1400, unit: 'MHz' },
    bandwidth: { value: 400, unit: 'MHz' }
  });
});

describe('spectral line bandwidth', () => {
  test('is the channels times their width, to 0.01 Hz in its unit', () => {
    expect(spectralBandwidth(TELESCOPE.LOW, 5, 1000, 'kHz')).toEqual({
      value: 226.05613,
      unit: 'kHz'
    });
    expect(spectralBandwidth(TELESCOPE.MID, 1, 14880, 'MHz')).toEqual({
      value: 3.1248,
      unit: 'MHz'
    });
    expect(spectralBandwidth(TELESCOPE.LOW, null, 1000, 'MHz')).toEqual({
      value: null,
      unit: 'MHz'
    });
  });

  test('gives back its whole number of channels, and a fraction for any other bandwidth', () => {
    const bandwidth = spectralBandwidth(TELESCOPE.LOW, 5, 1000, 'kHz');
    expect(zoomChannelsForBandwidth(TELESCOPE.LOW, 5, bandwidth)).toBe(1000);
    expect(zoomChannelsForBandwidth(TELESCOPE.LOW, 5, { value: 226.2, unit: 'kHz' })).toBeCloseTo(
      1000.64,
      2
    );
    expect(zoomChannelsForBandwidth(TELESCOPE.LOW, 5, { value: null, unit: 'kHz' })).toBeNull();
  });

  test('is saved in its own unit, from the channels', () => {
    const loaded = observationFromPdm(
      lowObservation('obs', {
        observation_type: 'spectral line',
        bandwidth: { value: 226.05613, unit: 'kHz' },
        spectral_resolution: '226.06 Hz (338.8 m/s)',
        number_of_channels: 1000
      })
    );
    expect(loaded).toMatchObject({ bandwidth: { value: 226.05613, unit: 'kHz' } });
    expect(observationToPdm(schema.parse(loaded)).observation_type_details.bandwidth).toEqual({
      value: 226.05613425925927,
      unit: 'kHz'
    });
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

  test('needs a whole number of channels, shown on the bandwidth that sets them too', () => {
    const message = 'Number of channels must be a whole number of at least 2';
    expect(issues({ ...lowSpectral, zoomChannels: 12.5 })).toEqual([
      { path: ['zoomChannels'], message },
      { path: ['bandwidth', 'value'], message }
    ]);
    expect(issues({ ...lowSpectral, zoomChannels: 1 })).toEqual([
      { path: ['zoomChannels'], message },
      { path: ['bandwidth', 'value'], message }
    ]);
  });

  test('has only the coarse zoom factors for LOW AA2 and AA*, even when other fields are invalid', () => {
    const restricted = { ...lowSpectral, zoomFactor: 4, zoomChannels: 1.5 };
    expect(issues(restricted)).toEqual([
      { path: ['zoomChannels'], message: expect.any(String) },
      { path: ['bandwidth', 'value'], message: expect.any(String) },
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
});

describe('observation rules from the OSD', () => {
  const lowContinuum = newSvObservation(OBSERVING_MODE.CONTINUUM, 15);
  const lowSpectral = newSvObservation(OBSERVING_MODE.SPECTRAL, 15);
  // MID band 2, with a bandwidth of a whole number of 20-channel (268.8 kHz) steps
  const midContinuum = {
    ...observationFromPdm(pdmObservations[4]),
    subarray: 'aa2_sv',
    bandwidth: { value: (1488 * 268800) / 1e6, unit: 'MHz' }
  } as ObservationInput;
  const bandwidthMessage = (
    key: 'minimumChannelWidthError' | 'contMaximumExceededError' | 'divisibilityError',
    value: string
  ) => phtTranslations.bandwidth.range[key].replace('{{value}}', value);

  test('accepts valid observations', () => {
    expect(osdIssues(lowContinuum)).toEqual([]);
    expect(osdIssues(lowSpectral)).toEqual([]);
    expect(osdIssues(midContinuum)).toEqual([]);
  });

  test('checks the elevation against the range in the OSD', () => {
    expect(osdIssues({ ...lowContinuum, minElevation: 90 })).toEqual([]);
    expect(osdIssues({ ...lowContinuum, minElevation: 14 })).toEqual([
      { path: ['minElevation'], message: expect.any(String) }
    ]);
    expect(osdIssues({ ...midContinuum, elevation: 85 })).toEqual([]);
    expect(osdIssues({ ...midContinuum, elevation: 86 })).toEqual([
      { path: ['elevation'], message: expect.any(String) }
    ]);
  });

  test('keeps the whole bandwidth in the band', () => {
    const outOfBand = {
      path: ['centralFrequency', 'value'],
      message: phtTranslations.centralFrequency.error.range
    };
    // 60 MHz +- 75 MHz goes below the LOW band
    expect(osdIssues({ ...lowContinuum, centralFrequency: { value: 60, unit: 'MHz' } })).toEqual([
      outOfBand
    ]);
    // 1 GHz +- 200 MHz goes below band 2
    expect(osdIssues({ ...midContinuum, centralFrequency: { value: 1, unit: 'GHz' } })).toEqual([
      outOfBand
    ]);
  });

  test('keeps a LOW central frequency on the coarse channel grid', () => {
    expect(osdIssues({ ...lowContinuum, centralFrequency: { value: 200, unit: 'MHz' } })).toEqual([
      {
        path: ['centralFrequency', 'value'],
        message: phtTranslations.centralFrequency.error.divisibility
      }
    ]);
  });

  test('keeps a LOW spectral line central frequency on its channel grid, which an odd number of channels moves', () => {
    expect(osdIssues({ ...lowSpectral, zoomChannels: 1002 })).toEqual([]);
    expect(osdIssues({ ...lowSpectral, zoomChannels: 1001 })).toEqual([
      {
        path: ['centralFrequency', 'value'],
        message: phtTranslations.centralFrequency.error.divisibility
      }
    ]);
  });

  test('needs a bandwidth of whole channels, up to what the subarray has', () => {
    const lowBandwidth = (value: number) =>
      osdIssues({ ...lowContinuum, bandwidth: { value, unit: 'MHz' } });
    // A LOW bandwidth is a multiple of 8 coarse channels, 6.25 MHz
    expect(lowBandwidth(5)).toEqual([
      {
        path: ['bandwidth', 'value'],
        message: bandwidthMessage('minimumChannelWidthError', '6250.00')
      }
    ]);
    expect(lowBandwidth(10)).toEqual([
      { path: ['bandwidth', 'value'], message: bandwidthMessage('divisibilityError', '6250.00') }
    ]);
    expect(lowBandwidth(156.25)).toEqual([
      {
        path: ['bandwidth', 'value'],
        message: bandwidthMessage('contMaximumExceededError', '150.00')
      }
    ]);
    // MID AA2 has up to 800 MHz, here 2977 steps of 268.8 kHz in the middle of band 2
    expect(
      osdIssues({
        ...midContinuum,
        centralFrequency: { value: 1.355, unit: 'GHz' },
        bandwidth: { value: (2977 * 268800) / 1e6, unit: 'MHz' }
      })
    ).toEqual([
      {
        path: ['bandwidth', 'value'],
        message: bandwidthMessage('contMaximumExceededError', '800.00')
      }
    ]);
    expect(osdIssues({ ...midContinuum, bandwidth: { value: 0.4, unit: 'GHz' } })).toEqual([
      { path: ['bandwidth', 'value'], message: bandwidthMessage('divisibilityError', '268.80') }
    ]);
  });

  test('has at most the zoom channels of the subarray, and their bandwidth', () => {
    expect(osdIssues({ ...lowSpectral, zoomChannels: 1800 })).toEqual([]);
    const tooMany = osdSchema.safeParse({ ...lowSpectral, zoomChannels: 1802 }).error?.issues;
    expect(tooMany).toEqual([
      expect.objectContaining({ path: ['zoomChannels'], maximum: 1800 }),
      // 1800 channels of 1808.45 Hz, in the bandwidth's MHz
      expect.objectContaining({ path: ['bandwidth', 'value'], maximum: expect.closeTo(3.2552, 4) })
    ]);
  });

  test('needs each MID continuum sub-band to be at least a channel wide', () => {
    // One 268.8 kHz step in 32 sub-bands of 8.4 kHz, less than a 13.44 kHz channel
    const narrow = { ...midContinuum, bandwidth: { value: 268800 / 1e6, unit: 'MHz' } };
    expect(osdIssues({ ...narrow, numberOfSubBands: 1 })).toEqual([]);
    expect(osdIssues({ ...narrow, numberOfSubBands: 32 })).toEqual([
      { path: ['numberOfSubBands'], message: phtTranslations.subBands.range.bandwidthSubBand }
    ]);
  });

  test('are checked even when other fields are invalid', () => {
    expect(
      osdIssues({
        ...lowContinuum,
        integrationTime: { value: null, unit: 'h' },
        centralFrequency: { value: 200, unit: 'MHz' }
      })
    ).toEqual([
      { path: ['integrationTime', 'value'], message: expect.any(String) },
      {
        path: ['centralFrequency', 'value'],
        message: phtTranslations.centralFrequency.error.divisibility
      }
    ]);
  });

  test.skip('TODO: Enable again with BTN-3688 resolved. are not checked without the OSD', () => {
    expect(
      issues({
        ...lowContinuum,
        minElevation: 5,
        centralFrequency: { value: 60, unit: 'MHz' },
        bandwidth: { value: 5, unit: 'MHz' }
      })
    ).toEqual([]);
  });

  test.each(Object.values(OBSERVING_MODE))(
    'accept the SV default observation in %s mode',
    (mode) => {
      expect(osdIssues(newSvObservation(mode, 15))).toEqual([]);
    }
  );
});

describe('central frequency grid', () => {
  const low = newObservation(BAND_LOW_STR, SA_AA2, OBSERVING_MODE.CONTINUUM, osd);
  const spectral = (zoomChannels: number) =>
    ({
      ...newObservation(BAND_LOW_STR, SA_AA2, OBSERVING_MODE.SPECTRAL, osd),
      zoomChannels
    }) as ObservationInput;
  // A zoom channel of zoom factor 8
  const zoomChannelHz = (781250 * 32 * 128) / 27 / 4096 / 16;

  test('is two coarse channels from the bottom of the LOW band', () => {
    expect(centralFrequencyGridHz(low, osd)).toEqual({ stepHz: 1562500, minHz: 49609375 });
  });

  test('is a zoom channel for spectral line, half a channel up with an odd number of them', () => {
    expect(centralFrequencyGridHz(spectral(1000), osd)).toEqual({
      stepHz: zoomChannelHz,
      minHz: 49609375
    });
    expect(centralFrequencyGridHz(spectral(1001), osd)).toEqual({
      stepHz: zoomChannelHz,
      minHz: 49609375 + zoomChannelHz / 2
    });
  });

  test("isn't there on MID or without the OSD", () => {
    expect(
      centralFrequencyGridHz(newObservation(BAND_1_STR, SA_AA2, OBSERVING_MODE.CONTINUUM, osd), osd)
    ).toBeNull();
    expect(centralFrequencyGridHz(low, {})).toBeNull();
  });
});

describe('observation defaults', () => {
  // ids aren't compared
  const withoutId = ({ id: _id, ...rest }: ObservationInput) => rest;

  test.each([
    [BAND_LOW_STR, OBSERVING_MODE.CONTINUUM],
    [BAND_LOW_STR, OBSERVING_MODE.CONTINUUM_SPECTRAL],
    [BAND_LOW_STR, OBSERVING_MODE.SPECTRAL],
    [BAND_LOW_STR, OBSERVING_MODE.PST],
    [BAND_1_STR, OBSERVING_MODE.CONTINUUM],
    [BAND_5B_STR, OBSERVING_MODE.CONTINUUM_SPECTRAL],
    [BAND_2_STR, OBSERVING_MODE.SPECTRAL],
    [BAND_1_STR, OBSERVING_MODE.PST]
  ] as const)('give a valid new observation in %s, %s mode', (band, mode) => {
    expect(osdIssues(newObservation(band, SA_AA2, mode, osd))).toEqual([]);
  });

  test('start a MID band 1 observation in the middle of the band, with the widest bandwidth that fits it', () => {
    // As in the ODT: 700 MHz, and 2604 steps of 268.8 kHz in the 700 MHz wide band
    expect(newObservation(BAND_1_STR, SA_AA2, OBSERVING_MODE.CONTINUUM, osd)).toMatchObject({
      centralFrequency: { value: 700, unit: 'MHz' },
      bandwidth: { value: 699.9552, unit: 'MHz' }
    });
  });

  test('start a LOW AA2 observation with the bandwidth of the subarray', () => {
    expect(withoutId(newObservation(BAND_LOW_STR, SA_AA2, OBSERVING_MODE.PST, osd))).toEqual({
      groupId: null,
      telescope: TELESCOPE.LOW,
      observingBand: BAND_LOW_STR,
      subarray: SA_AA2,
      integrationTime: { value: 1, unit: 'h' },
      minElevation: 15,
      numberOfStations: 68,
      observingMode: OBSERVING_MODE.PST,
      pstMode: 'pulsar timing',
      centralFrequency: { value: 199.609375, unit: 'MHz' },
      bandwidth: { value: 150, unit: 'MHz' }
    });
  });

  test('use all the zoom channels of the subarray', () => {
    expect(newObservation(BAND_2_STR, SA_AA2, OBSERVING_MODE.SPECTRAL, osd)).toMatchObject({
      zoomFactor: 1,
      zoomChannels: 14880
    });
  });

  test('leave the values that need the OSD missing without it', () => {
    expect(newObservation(BAND_1_STR, SA_AA2, OBSERVING_MODE.CONTINUUM, {})).toMatchObject({
      elevation: null,
      number15mAntennas: null,
      centralFrequency: { value: null, unit: 'MHz' },
      bandwidth: { value: null, unit: 'MHz' }
    });
  });
});

describe('observation changes', () => {
  const low = {
    ...newObservation(BAND_LOW_STR, SA_AA2, OBSERVING_MODE.CONTINUUM, osd),
    id: 'obs-1',
    groupId: 'group-1',
    integrationTime: { value: 3, unit: 'h' },
    minElevation: 40
  } as ObservationInput;

  test('on another telescope start again from its defaults, keeping the identifiers, subarray and mode', () => {
    const mid = observationForBand(low, BAND_1_STR, osd);

    expect(mid).toEqual({
      ...newObservation(BAND_1_STR, SA_AA2, OBSERVING_MODE.CONTINUUM, osd),
      id: 'obs-1',
      groupId: 'group-1'
    });
    expect(osdIssues(mid)).toEqual([]);
  });

  test('in another band of the same telescope keep all but the frequencies', () => {
    const band1 = {
      ...observationForBand(low, BAND_1_STR, osd),
      elevation: 50,
      weather: 5
    } as ObservationInput;

    expect(observationForBand(band1, BAND_2_STR, osd)).toEqual({
      ...band1,
      observingBand: BAND_2_STR,
      centralFrequency: { value: 1355, unit: 'MHz' },
      // Band 2 is 810 MHz wide, so the 800 MHz of AA2 fits: 2976 steps of 268.8 kHz
      bandwidth: { value: 799.9488, unit: 'MHz' }
    });
  });

  test('to a subarray in the OSD take its stations, and keep the entered ones for a custom one', () => {
    const custom = observationForSubarray(low, SA_CUSTOM, osd);
    expect(custom).toEqual({ ...low, subarray: SA_CUSTOM });

    const entered = { ...custom, numberOfStations: 100 } as ObservationInput;
    expect(observationForSubarray(entered, SA_CUSTOM, osd)).toMatchObject({
      numberOfStations: 100
    });
    expect(observationForSubarray(entered, SA_AA_STAR, osd)).toMatchObject({
      subarray: SA_AA_STAR,
      numberOfStations: 68
    });
  });

  test('to a subarray with fewer zoom channels reduce them to its maximum', () => {
    const spectral = {
      ...newObservation(BAND_2_STR, SA_CUSTOM, OBSERVING_MODE.SPECTRAL, osd),
      zoomChannels: 20000
    } as ObservationInput;

    expect(observationForSubarray(spectral, SA_AA2, osd)).toMatchObject({
      zoomChannels: 14880,
      // 14880 channels of 210 Hz
      bandwidth: { value: 3.1248, unit: 'MHz' }
    });
  });

  test('to another mode keep the shared fields and a bandwidth of its own', () => {
    const narrow = { ...low, bandwidth: { value: 75, unit: 'MHz' } } as ObservationInput;

    expect(observationForMode(narrow, OBSERVING_MODE.PST, osd)).toEqual({
      ...narrow,
      observingMode: OBSERVING_MODE.PST,
      pstMode: 'pulsar timing'
    });
    const spectral = observationForMode(narrow, OBSERVING_MODE.SPECTRAL, osd);
    expect(spectral).toEqual({
      ...narrow,
      observingMode: OBSERVING_MODE.SPECTRAL,
      // 1800 channels of 1808.45 Hz
      bandwidth: { value: 3.25520833, unit: 'MHz' },
      zoomFactor: 8,
      zoomChannels: 1800
    });
    // Back from spectral line, the bandwidth starts again from the default
    expect(observationForMode(spectral, OBSERVING_MODE.CONTINUUM, osd)).toEqual({
      ...narrow,
      bandwidth: { value: 150, unit: 'MHz' }
    });
  });
});
