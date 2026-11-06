import { DECIMAL_PLACES, SENSITIVITY_STATE } from '@/utils/constants';
import { shiftSensitivity } from '@/utils/helpersSensCalc';
import { presentUnits } from '@/utils/present/present';
import type { Sensitivity, SensitivityValues } from '@/models/proposals/targetObservation';
import type { SensCalcError, SensCalcSuccess } from './client';
import type { SensitivityResult } from './calculate';
import type { BeamSize } from './types';

/**
 * The values of the continuum or spectral results, in the order they are shown. Each is labelled
 * by its part followed by its label, e.g. continuumSensitivityWeighted.
 */
export const SENSITIVITY_FIELDS = [
  { key: 'weightedSensitivity', label: 'SensitivityWeighted' },
  { key: 'confusionNoise', label: 'ConfusionNoise' },
  { key: 'totalSensitivity', label: 'TotalSensitivity' },
  { key: 'synthesizedBeamSize', label: 'SynthBeamSize' },
  { key: 'surfaceBrightnessSensitivity', label: 'SurfaceBrightnessSensitivity' }
] as const satisfies readonly { key: keyof SensitivityValues; label: string }[];

const beamSize = (beam: BeamSize) => ({
  value:
    beam.beam_maj.value.toFixed(DECIMAL_PLACES) +
    ' x ' +
    beam.beam_min.value.toFixed(DECIMAL_PLACES),
  unit: presentUnits('arcsec2')
});

/**
 * Converts a sendSensitivityRequest response into the results stored on a target–observation
 * link. Sensitivities are scaled to a readable unit, e.g. μJy/beam.
 *
 * Returns undefined when no calculation applies (SSO targets and PST observing mode). Errors are
 * stored as a single line: the calculator's detail, or its title when there is no detail.
 */
export const toSensitivity = (
  response: SensCalcSuccess<SensitivityResult> | SensCalcError | null
): Sensitivity | undefined => {
  if (response === null) {
    return undefined;
  }
  if (!response.ok) {
    return { state: SENSITIVITY_STATE.FAILED, error: response.detail || response.title };
  }

  const result = response.data;
  const spectral: SensitivityValues = {
    weightedSensitivity: shiftSensitivity(result.weighted_spectral_sensitivity),
    confusionNoise: shiftSensitivity(result.spectral_confusion_noise),
    totalSensitivity: shiftSensitivity(result.total_spectral_sensitivity),
    synthesizedBeamSize: beamSize(result.spectral_synthesized_beam_size),
    surfaceBrightnessSensitivity: result.spectral_surface_brightness_sensitivity
  };

  // Zoom results have no continuum part
  if (!('weighted_continuum_sensitivity' in result)) {
    return { state: SENSITIVITY_STATE.DONE, spectral };
  }

  const continuum: SensitivityValues = {
    weightedSensitivity: shiftSensitivity(result.weighted_continuum_sensitivity),
    confusionNoise: shiftSensitivity(result.continuum_confusion_noise),
    totalSensitivity: shiftSensitivity(result.total_continuum_sensitivity),
    synthesizedBeamSize: beamSize(result.continuum_synthesized_beam_size),
    surfaceBrightnessSensitivity: result.continuum_surface_brightness_sensitivity
  };
  return { state: SENSITIVITY_STATE.DONE, continuum, spectral };
};
