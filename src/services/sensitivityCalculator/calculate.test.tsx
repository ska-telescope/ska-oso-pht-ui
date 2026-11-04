import { afterEach, describe, expect, test, vi } from 'vitest';
import { AxiosError, CanceledError, InternalAxiosRequestConfig } from 'axios';
import axiosClient from '@/services/axios/axiosClient/axiosClient';
import {
  BAND_1_STR,
  DEFAULT_CONTINUUM_OBSERVATION_LOW,
  DEFAULT_PST_OBSERVATION_LOW,
  DEFAULT_ZOOM_OBSERVATION_LOW,
  DP_TYPE_IMAGES,
  DP_TYPE_VISIBLE,
  FREQUENCY_GHZ,
  FREQUENCY_MHZ,
  IW_BRIGGS,
  IW_NATURAL,
  REFERENCE_COORDINATE_TYPE_GALACTIC,
  REFERENCE_COORDINATE_TYPE_ICRS,
  REFERENCE_COORDINATE_TYPE_SSO,
  SA_AA_STAR,
  SA_CUSTOM,
  SUPPLIED_TYPE_INTEGRATION,
  TELESCOPE_MID_NUM,
  TIME_HOURS,
  TYPE_CONTINUUM,
  TYPE_CONTINUUM_SPECTRAL,
  TYPE_ZOOM
} from '@/utils/constants';
import type Observation from '@/utils/types/observation';
import type Target from '@/utils/types/target';
import type { DataProductSDPNew } from '@/utils/types/dataProduct';
import { calculateSensitivity } from './calculate';
import { SENS_CALC_ERROR_KIND } from './client';
import type { ContinuumResult, ZoomResult } from './types';

const ICRS_TARGET: Target = {
  id: 'target-1',
  name: 'M1',
  kind: REFERENCE_COORDINATE_TYPE_ICRS.value,
  raStr: '05:34:31.94',
  decStr: '+22:00:52.2'
};

const GALACTIC_TARGET: Target = {
  id: 'target-2',
  name: 'Galactic',
  kind: REFERENCE_COORDINATE_TYPE_GALACTIC.value,
  l: 10,
  b: 5
};

const SSO_TARGET: Target = {
  id: 'target-3',
  name: 'Mars',
  kind: REFERENCE_COORDINATE_TYPE_SSO.value
};

const imageDataProduct = (overrides: Record<string, unknown> = {}): DataProductSDPNew => ({
  id: 'dp-1',
  observationId: 'obs-1',
  data: {
    dataProductType: DP_TYPE_IMAGES,
    imageSizeValue: 2.2,
    imageSizeUnits: 0,
    pixelSizeValue: 1,
    pixelSizeUnits: 0,
    weighting: IW_NATURAL,
    robust: 0,
    taperValue: 0,
    channelsOut: 40,
    polarisations: ['I'],
    ...overrides
  }
});

const MID_CONTINUUM_OBSERVATION: Observation = {
  id: 'obs-mid',
  telescope: TELESCOPE_MID_NUM,
  subarray: SA_AA_STAR,
  type: TYPE_CONTINUUM,
  observingBand: BAND_1_STR,
  weather: 5,
  elevation: 45,
  centralFrequency: 0.7975,
  centralFrequencyUnits: FREQUENCY_GHZ,
  bandwidth: null,
  continuumBandwidth: 400,
  continuumBandwidthUnits: FREQUENCY_MHZ,
  supplied: { type: SUPPLIED_TYPE_INTEGRATION, value: 1, units: TIME_HOURS },
  spectralResolution: '13.44 kHz',
  effectiveResolution: '13.44 kHz',
  numSubBands: 1
};

const MID_ZOOM_OBSERVATION: Observation = { ...MID_CONTINUUM_OBSERVATION, type: TYPE_ZOOM };

const quantity = (value: number, unit = 'uJy / beam') => ({ value, unit });
const beam = { beam_maj: quantity(1, 'arcsec'), beam_min: quantity(2, 'arcsec') };

const SPECTRAL_RESULT: ZoomResult = {
  weighted_spectral_sensitivity: quantity(6),
  spectral_confusion_noise: quantity(7),
  total_spectral_sensitivity: quantity(8),
  spectral_synthesized_beam_size: beam,
  spectral_surface_brightness_sensitivity: quantity(9, 'K')
};

const CONTINUUM_RESULT: ContinuumResult = {
  ...SPECTRAL_RESULT,
  weighted_continuum_sensitivity: quantity(1),
  continuum_confusion_noise: quantity(2),
  total_continuum_sensitivity: quantity(3),
  continuum_synthesized_beam_size: beam,
  continuum_surface_brightness_sensitivity: quantity(4, 'K')
};

const continuumResponse = { data: [{ transformed_result: CONTINUUM_RESULT }] };
const zoomResponse = { data: [{ transformed_result: [SPECTRAL_RESULT] }] };

const mockPost = (response: unknown) => vi.spyOn(axiosClient, 'post').mockResolvedValue(response);

/** The path and body of the one request made. */
const postedRequest = (post: ReturnType<typeof mockPost>) => {
  expect(post).toHaveBeenCalledTimes(1);
  const [url, body] = post.mock.calls[0];
  return { url: url as string, body };
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('calculateSensitivity request bodies', () => {
  test('LOW continuum', async () => {
    const post = mockPost(continuumResponse);

    await calculateSensitivity(DEFAULT_CONTINUUM_OBSERVATION_LOW, ICRS_TARGET, imageDataProduct());

    const { url, body } = postedRequest(post);
    expect(url).toMatch(/low\/continuum\/calculate$/);
    expect(body).toEqual({
      subarray_configuration: 'LOW_AA2_all',
      weighting_mode: 'natural',
      integration_time_h: 1,
      elevation_limit: 15,
      freq_centre_mhz: 199.609375,
      bandwidth_mhz: 150,
      // 150 MHz is 27648 channels of 5.43 kHz, averaged over 40 output channels
      spectral_averaging_factor: 691,
      n_subbands: 1,
      reference_coordinates: [{ kind: 'icrs', ra_str: '05:34:31.94', dec_str: '+22:00:52.2' }]
    });
  });

  test('LOW zoom', async () => {
    const post = mockPost(zoomResponse);

    await calculateSensitivity(DEFAULT_ZOOM_OBSERVATION_LOW, ICRS_TARGET, imageDataProduct());

    const { url, body } = postedRequest(post);
    expect(url).toMatch(/low\/zoom\/calculate$/);
    expect(body).toEqual({
      subarray_configuration: 'LOW_AA2_all',
      weighting_mode: 'natural',
      integration_time_h: 1,
      elevation_limit: 15,
      freq_centres_mhz: [200],
      spectral_resolutions_hz: [1808.45],
      total_bandwidths_khz: [3125],
      reference_coordinates: [{ kind: 'icrs', ra_str: '05:34:31.94', dec_str: '+22:00:52.2' }]
    });
  });

  test('MID continuum', async () => {
    const post = mockPost(continuumResponse);

    await calculateSensitivity(
      MID_CONTINUUM_OBSERVATION,
      ICRS_TARGET,
      imageDataProduct({ taperValue: 0.25 })
    );

    const { url, body } = postedRequest(post);
    expect(url).toMatch(/mid\/continuum\/calculate$/);
    expect(body).toEqual({
      subarray_configuration: 'AA*',
      weighting_mode: 'natural',
      rx_band: 'Band 1',
      integration_time_s: 3600,
      taper: 0.25,
      el: 45,
      freq_centre_hz: 797500000,
      bandwidth_hz: 400000000,
      spectral_averaging_factor: 1,
      n_subbands: 1,
      reference_coordinates: [{ kind: 'icrs', ra_str: '05:34:31.94', dec_str: '+22:00:52.2' }]
    });
  });

  test('MID zoom', async () => {
    const post = mockPost(zoomResponse);

    await calculateSensitivity(MID_ZOOM_OBSERVATION, ICRS_TARGET, imageDataProduct());

    const { url, body } = postedRequest(post);
    expect(url).toMatch(/mid\/zoom\/calculate$/);
    expect(body).toEqual({
      subarray_configuration: 'AA*',
      weighting_mode: 'natural',
      rx_band: 'Band 1',
      integration_time_s: 3600,
      taper: 0,
      el: 45,
      freq_centres_hz: [797500000],
      spectral_resolutions_hz: [13440],
      total_bandwidths_hz: [3125000],
      reference_coordinates: [{ kind: 'icrs', ra_str: '05:34:31.94', dec_str: '+22:00:52.2' }]
    });
  });

  test('a galactic target is sent as l and b', async () => {
    const post = mockPost(continuumResponse);

    await calculateSensitivity(
      DEFAULT_CONTINUUM_OBSERVATION_LOW,
      GALACTIC_TARGET,
      imageDataProduct()
    );

    expect(postedRequest(post).body).toMatchObject({
      reference_coordinates: [{ kind: 'galactic', l: 10, b: 5 }]
    });
  });

  test('robustness is only sent with Briggs weighting', async () => {
    const post = mockPost(continuumResponse);

    await calculateSensitivity(
      DEFAULT_CONTINUUM_OBSERVATION_LOW,
      ICRS_TARGET,
      imageDataProduct({ weighting: IW_BRIGGS, robust: -1 })
    );

    expect(postedRequest(post).body).toMatchObject({ weighting_mode: 'robust', robustness: -1 });
  });

  test('a custom LOW subarray sends the number of stations', async () => {
    const post = mockPost(continuumResponse);

    await calculateSensitivity(
      { ...DEFAULT_CONTINUUM_OBSERVATION_LOW, subarray: SA_CUSTOM, numStations: 100 },
      ICRS_TARGET,
      imageDataProduct()
    );

    const { body } = postedRequest(post);
    expect(body).toMatchObject({ num_stations: 100 });
    expect(body).not.toHaveProperty('subarray_configuration');
  });

  test('a custom MID subarray sends the antenna numbers', async () => {
    const post = mockPost(continuumResponse);

    await calculateSensitivity(
      { ...MID_CONTINUUM_OBSERVATION, subarray: SA_CUSTOM, num15mAntennas: 10, num13mAntennas: 4 },
      ICRS_TARGET,
      imageDataProduct()
    );

    const { body } = postedRequest(post);
    expect(body).toMatchObject({ n_ska: 10, n_meer: 4 });
    expect(body).not.toHaveProperty('subarray_configuration');
  });

  test('the combined mode uses the continuum endpoint', async () => {
    const post = mockPost(continuumResponse);

    await calculateSensitivity(
      { ...DEFAULT_CONTINUUM_OBSERVATION_LOW, type: TYPE_CONTINUUM_SPECTRAL },
      ICRS_TARGET,
      imageDataProduct({ dataProductType: undefined, channelsOut: 4000 })
    );

    const { url, body } = postedRequest(post);
    expect(url).toMatch(/low\/continuum\/calculate$/);
    expect(body).toMatchObject({ bandwidth_mhz: 150, spectral_averaging_factor: 6 });
  });

  test('continuum visibilities average over the default number of channels', async () => {
    const post = mockPost(continuumResponse);

    await calculateSensitivity(
      DEFAULT_CONTINUUM_OBSERVATION_LOW,
      ICRS_TARGET,
      imageDataProduct({ dataProductType: DP_TYPE_VISIBLE })
    );

    // 27648 channels / CHANNELS_OUT_DEFAULT (10)
    expect(postedRequest(post).body).toMatchObject({ spectral_averaging_factor: 2764 });
  });

  test('passes the abort signal to the request', async () => {
    const post = mockPost(continuumResponse);
    const controller = new AbortController();

    await calculateSensitivity(DEFAULT_CONTINUUM_OBSERVATION_LOW, ICRS_TARGET, imageDataProduct(), {
      signal: controller.signal
    });

    expect(post.mock.calls[0][2]).toEqual({ signal: controller.signal });
  });
});

describe('calculateSensitivity results', () => {
  test('returns the continuum results', async () => {
    mockPost(continuumResponse);

    const response = await calculateSensitivity(
      DEFAULT_CONTINUUM_OBSERVATION_LOW,
      ICRS_TARGET,
      imageDataProduct()
    );

    expect(response).toEqual({ ok: true, data: CONTINUUM_RESULT });
  });

  test('returns the results of the zoom window', async () => {
    mockPost(zoomResponse);

    const response = await calculateSensitivity(
      DEFAULT_ZOOM_OBSERVATION_LOW,
      ICRS_TARGET,
      imageDataProduct()
    );

    expect(response).toEqual({ ok: true, data: SPECTRAL_RESULT });
  });

  test.each([
    {
      name: 'an SSO target',
      observation: DEFAULT_CONTINUUM_OBSERVATION_LOW,
      target: SSO_TARGET
    },
    {
      name: 'a PST observation',
      observation: DEFAULT_PST_OBSERVATION_LOW,
      target: ICRS_TARGET
    }
  ])('returns null and makes no request for $name', async ({ observation, target }) => {
    const post = vi.spyOn(axiosClient, 'post');

    const response = await calculateSensitivity(observation, target, imageDataProduct());

    expect(response).toBeNull();
    expect(post).not.toHaveBeenCalled();
  });

  test('returns an error for an unknown observation type', async () => {
    const post = vi.spyOn(axiosClient, 'post');

    const response = await calculateSensitivity(
      { ...DEFAULT_CONTINUUM_OBSERVATION_LOW, type: 'unknown' },
      ICRS_TARGET,
      imageDataProduct()
    );

    expect(response).toMatchObject({
      ok: false,
      kind: SENS_CALC_ERROR_KIND.FAILED,
      title: 'Unsupported Observation Type'
    });
    expect(post).not.toHaveBeenCalled();
  });
});

describe('calculateSensitivity errors', () => {
  const calculate = () =>
    calculateSensitivity(DEFAULT_CONTINUUM_OBSERVATION_LOW, ICRS_TARGET, imageDataProduct());

  const responseError = (status: number, data: unknown) =>
    new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
      status,
      statusText: '',
      data,
      headers: {},
      config: {} as InternalAxiosRequestConfig
    });

  test("uses the calculator's own title and detail", async () => {
    vi.spyOn(axiosClient, 'post').mockRejectedValue(
      responseError(400, {
        title: 'Validation Error',
        detail: 'Maximum bandwidth (150 MHz) for this subarray has been exceeded.'
      })
    );

    expect(await calculate()).toEqual({
      ok: false,
      kind: SENS_CALC_ERROR_KIND.FAILED,
      title: 'Validation Error',
      detail: 'Maximum bandwidth (150 MHz) for this subarray has been exceeded.'
    });
  });

  test('falls back to the request error when the body is not from the calculator', async () => {
    vi.spyOn(axiosClient, 'post').mockRejectedValue(responseError(502, '<html>Bad Gateway</html>'));

    expect(await calculate()).toEqual({
      ok: false,
      kind: SENS_CALC_ERROR_KIND.FAILED,
      title: 'Sensitivity Calculator Error',
      detail: 'Request failed'
    });
  });

  test('falls back to the request error when there is no response', async () => {
    vi.spyOn(axiosClient, 'post').mockRejectedValue(new AxiosError('Network Error'));

    expect(await calculate()).toEqual({
      ok: false,
      kind: SENS_CALC_ERROR_KIND.FAILED,
      title: 'Sensitivity Calculator Error',
      detail: 'Network Error'
    });
  });

  test('reports a canceled request as aborted', async () => {
    vi.spyOn(axiosClient, 'post').mockRejectedValue(new CanceledError());

    expect(await calculate()).toMatchObject({
      ok: false,
      kind: SENS_CALC_ERROR_KIND.ABORTED
    });
  });
});
