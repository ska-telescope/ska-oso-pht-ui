import { describe, expect, test } from 'vitest';
import { SENSITIVITY_STATE } from '@/utils/constants';
import { SENS_CALC_ERROR_KIND } from './client';
import { toSensitivity } from './results';
import type { ContinuumResult, ZoomResult } from './types';

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

// Sensitivities are scaled to a readable unit; a zero keeps the calculator's unit
const SPECTRAL_VALUES = {
  weightedSensitivity: { value: 1.2345, unit: 'mJy/beam' },
  confusionNoise: { value: 0, unit: 'Jy / beam' },
  totalSensitivity: { value: 2.5, unit: 'Jy/beam' },
  synthesizedBeamSize: { value: '1.23 x 2.50', unit: 'arcsec²' },
  surfaceBrightnessSensitivity: { value: 9.87, unit: 'K' }
};

describe('toSensitivity', () => {
  test('continuum results have a continuum and a spectral part', () => {
    expect(toSensitivity({ ok: true, data: CONTINUUM_RESULT })).toEqual({
      state: SENSITIVITY_STATE.DONE,
      continuum: {
        weightedSensitivity: { value: 12.3, unit: 'μJy/beam' },
        confusionNoise: { value: 456, unit: 'μJy/beam' },
        totalSensitivity: { value: 78.9, unit: 'μJy/beam' },
        synthesizedBeamSize: { value: '1.23 x 2.50', unit: 'arcsec²' },
        surfaceBrightnessSensitivity: { value: 4.5, unit: 'K' }
      },
      spectral: SPECTRAL_VALUES
    });
  });

  test('zoom results have only a spectral part', () => {
    expect(toSensitivity({ ok: true, data: SPECTRAL_RESULT })).toEqual({
      state: SENSITIVITY_STATE.DONE,
      spectral: SPECTRAL_VALUES
    });
  });

  test('values the calculator gives as null are left out', () => {
    // For a non-Gaussian beam or a custom subarray, the calculator gives only the weighted
    // sensitivities: the other values depend on the synthesized beam
    const weightedOnly: ContinuumResult = {
      weighted_continuum_sensitivity: jyPerBeam(0.0000123),
      continuum_confusion_noise: null,
      total_continuum_sensitivity: null,
      continuum_synthesized_beam_size: null,
      continuum_surface_brightness_sensitivity: null,
      weighted_spectral_sensitivity: jyPerBeam(0.0012345),
      spectral_confusion_noise: null,
      total_spectral_sensitivity: null,
      spectral_synthesized_beam_size: null,
      spectral_surface_brightness_sensitivity: null
    };
    expect(toSensitivity({ ok: true, data: weightedOnly })).toEqual({
      state: SENSITIVITY_STATE.DONE,
      continuum: { weightedSensitivity: { value: 12.3, unit: 'μJy/beam' } },
      spectral: { weightedSensitivity: { value: 1.2345, unit: 'mJy/beam' } }
    });
  });

  test('an error stores the detail', () => {
    const error = {
      ok: false as const,
      kind: SENS_CALC_ERROR_KIND.FAILED,
      title: 'Validation Error',
      detail: 'Bandwidth too small'
    };
    expect(toSensitivity(error)).toEqual({
      state: SENSITIVITY_STATE.FAILED,
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
    expect(toSensitivity(error)).toEqual({
      state: SENSITIVITY_STATE.FAILED,
      error: 'Validation Error'
    });
  });

  test('no calculation gives no results', () => {
    expect(toSensitivity(null)).toBeUndefined();
  });
});
