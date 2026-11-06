import { DECIMAL_PLACES, STATUS_ERROR, STATUS_OK, TIME_UNITS } from '@/utils/constants';
import { shiftSensitivity } from '@/utils/helpersSensCalc';
import { presentUnits } from '@/utils/present/present';
import type Observation from '@/utils/types/observation';
import type { ResultsSection, SensCalcResults } from '@/utils/types/sensCalcResults';
import type { SensCalcError, SensCalcSuccess } from './client';
import type { SensitivityResult } from './calculate';
import type { BeamSize, Quantity } from './types';

// TODO BTN-3595 Store the calculator results directly and remove this mapping to the legacy
//  section1/2/3 format, once the displays and the PDM mapping read the results instead.

const sensitivity = (field: string, quantity: Quantity): ResultsSection => {
  const shifted = shiftSensitivity(quantity);
  return { field, value: shifted.value.toString(), units: shifted.unit };
};

const beamSize = (field: string, beam: BeamSize): ResultsSection => ({
  field,
  value:
    beam.beam_maj.value.toFixed(DECIMAL_PLACES) +
    ' x ' +
    beam.beam_min.value.toFixed(DECIMAL_PLACES),
  units: presentUnits('arcsec2')
});

const quantity = (field: string, value: Quantity): ResultsSection => ({
  field,
  value: value.value.toString(),
  units: value.unit
});

/**
 * Converts a sendSensitivityRequest response into the results stored on a target–observation
 * link.
 *
 * Returns undefined when no calculation applies (SSO targets and PST observing mode). Errors are
 * stored as a single line: the calculator's detail, or its title when there is no detail.
 */
export const toSensCalcResults = (
  response: SensCalcSuccess<SensitivityResult> | SensCalcError | null,
  observation: Observation
): SensCalcResults | undefined => {
  if (response === null) {
    return undefined;
  }
  if (!response.ok) {
    return { statusGUI: STATUS_ERROR, error: response.detail || response.title };
  }

  const result = response.data;
  const spectral = [
    sensitivity('spectralSensitivityWeighted', result.weighted_spectral_sensitivity),
    sensitivity('spectralConfusionNoise', result.spectral_confusion_noise),
    sensitivity('spectralTotalSensitivity', result.total_spectral_sensitivity),
    beamSize('spectralSynthBeamSize', result.spectral_synthesized_beam_size),
    quantity('spectralSurfaceBrightnessSensitivity', result.spectral_surface_brightness_sensitivity)
  ];

  // The integration time the results were calculated for
  const section3 = [
    {
      field: 'integrationTime',
      value: observation.supplied.value.toString(),
      units: TIME_UNITS.find((u) => u.id === observation.supplied.units)?.value ?? ''
    }
  ];

  // Zoom results have no continuum part, and their spectral results go in section1
  if (!('weighted_continuum_sensitivity' in result)) {
    return { statusGUI: STATUS_OK, section1: spectral, section3 };
  }

  const continuum = [
    sensitivity('continuumSensitivityWeighted', result.weighted_continuum_sensitivity),
    sensitivity('continuumConfusionNoise', result.continuum_confusion_noise),
    sensitivity('continuumTotalSensitivity', result.total_continuum_sensitivity),
    beamSize('continuumSynthBeamSize', result.continuum_synthesized_beam_size),
    quantity(
      'continuumSurfaceBrightnessSensitivity',
      result.continuum_surface_brightness_sensitivity
    )
  ];
  return { statusGUI: STATUS_OK, section1: continuum, section2: spectral, section3 };
};
