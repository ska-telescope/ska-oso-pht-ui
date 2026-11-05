import { describe, expect, test } from 'vitest';
import {
  STATUS_ERROR,
  STATUS_OK,
  SUPPLIED_TYPE_INTEGRATION,
  TIME_HOURS,
  TYPE_CONTINUUM,
  TYPE_ZOOM
} from '@/utils/constants';
import type Observation from '@/utils/types/observation';
import { SENS_CALC_ERROR_KIND } from './client';
import { toSensCalcResults } from './results';
import type { ContinuumResult, ZoomResult } from './types';

const OBSERVATION = {
  type: TYPE_CONTINUUM,
  supplied: { type: SUPPLIED_TYPE_INTEGRATION, value: 1.5, units: TIME_HOURS }
} as Observation;

const jyPerBeam = (value: number) => ({ value, unit: 'Jy / beam' });
const beam = {
  beam_maj: { value: 1.23456, unit: 'arcsec' },
  beam_min: { value: 2.5, unit: 'arcsec' }
};

const SPECTRAL_RESULT: ZoomResult = {
  weighted_spectral_sensitivity: jyPerBeam(0.0012345),
  spectral_confusion_noise: jyPerBeam(0),
  total_spectral_sensitivity: jyPerBeam(2.5),
  spectral_synthesized_beam_size: beam,
  spectral_surface_brightness_sensitivity: { value: 9.87, unit: 'K' }
};

const CONTINUUM_RESULT: ContinuumResult = {
  ...SPECTRAL_RESULT,
  weighted_continuum_sensitivity: jyPerBeam(0.0000123),
  continuum_confusion_noise: jyPerBeam(0.000456),
  total_continuum_sensitivity: jyPerBeam(0.0000789),
  continuum_synthesized_beam_size: beam,
  continuum_surface_brightness_sensitivity: { value: 4.5, unit: 'K' }
};

const SPECTRAL_SECTION = [
  { field: 'spectralSensitivityWeighted', value: '1.2345', units: 'mJy/beam' },
  { field: 'spectralConfusionNoise', value: '0', units: 'Jy / beam' },
  { field: 'spectralTotalSensitivity', value: '2.5', units: 'Jy/beam' },
  { field: 'spectralSynthBeamSize', value: '1.23 x 2.50', units: 'arcsec²' },
  { field: 'spectralSurfaceBrightnessSensitivity', value: '9.87', units: 'K' }
];

const INTEGRATION_TIME_SECTION = [{ field: 'integrationTime', value: '1.5', units: 'h' }];

describe('toSensCalcResults', () => {
  test('continuum results go in section1 and spectral results in section2', () => {
    expect(toSensCalcResults({ ok: true, data: CONTINUUM_RESULT }, OBSERVATION)).toEqual({
      statusGUI: STATUS_OK,
      section1: [
        { field: 'continuumSensitivityWeighted', value: '12.3', units: 'μJy/beam' },
        { field: 'continuumConfusionNoise', value: '456', units: 'μJy/beam' },
        { field: 'continuumTotalSensitivity', value: '78.9', units: 'μJy/beam' },
        { field: 'continuumSynthBeamSize', value: '1.23 x 2.50', units: 'arcsec²' },
        { field: 'continuumSurfaceBrightnessSensitivity', value: '4.5', units: 'K' }
      ],
      section2: SPECTRAL_SECTION,
      section3: INTEGRATION_TIME_SECTION
    });
  });

  test('zoom results go in section1', () => {
    expect(
      toSensCalcResults({ ok: true, data: SPECTRAL_RESULT }, { ...OBSERVATION, type: TYPE_ZOOM })
    ).toEqual({
      statusGUI: STATUS_OK,
      section1: SPECTRAL_SECTION,
      section3: INTEGRATION_TIME_SECTION
    });
  });

  test('an error stores the detail', () => {
    const error = {
      ok: false as const,
      kind: SENS_CALC_ERROR_KIND.FAILED,
      title: 'Validation Error',
      detail: 'Bandwidth too small'
    };
    expect(toSensCalcResults(error, OBSERVATION)).toEqual({
      statusGUI: STATUS_ERROR,
      error: 'Bandwidth too small'
    });
  });

  test('an error without a detail stores the title', () => {
    const error = {
      ok: false as const,
      kind: SENS_CALC_ERROR_KIND.FAILED,
      title: 'Validation Error',
      detail: ''
    };
    expect(toSensCalcResults(error, OBSERVATION)).toEqual({
      statusGUI: STATUS_ERROR,
      error: 'Validation Error'
    });
  });

  test('no calculation gives no results', () => {
    expect(toSensCalcResults(null, OBSERVATION)).toBeUndefined();
  });
});
