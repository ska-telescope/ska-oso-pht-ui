import { describe, test, expect } from 'vitest';
import { SUPPLIED_TYPE_SENSITIVITY } from '@utils/constants.ts';
import { getFinalIndividualResultsForContinuum } from './getContinuumData';

describe('getFinalIndividualResultsForContinuum', () => {
  const baseObservation = {
    supplied: { type: 0, value: { toString: () => '42' }, units: 1 },
    type: 0
  };

  const baseResults = {
    transformed_result: {
      weighted_continuum_sensitivity: { value: 1, unit: 'Jy' },
      continuum_confusion_noise: { value: 2, unit: 'Jy' },
      total_continuum_sensitivity: { value: 3, unit: 'Jy' },
      continuum_synthesized_beam_size: {
        beam_maj: { value: 1.1 },
        beam_min: { value: 2.2 }
      },
      continuum_integration_time: { value: 100, unit: 's' },
      continuum_surface_brightness_sensitivity: { value: 0.5, unit: 'Jy/beam' },
      weighted_spectral_sensitivity: { value: 4, unit: 'Jy' },
      spectral_confusion_noise: { value: 5, unit: 'Jy' },
      total_spectral_sensitivity: { value: 6, unit: 'Jy' },
      spectral_synthesized_beam_size: {
        beam_maj: { value: 3.3 },
        beam_min: { value: 4.4 }
      },
      spectral_integration_time: { value: 200, unit: 's' },
      spectral_surface_brightness_sensitivity: { value: 0.7, unit: 'Jy/beam' }
    }
  };

  test('should return correct fields for supplied sensitivity', () => {
    const obs = {
      ...baseObservation,
      supplied: { ...baseObservation.supplied, type: SUPPLIED_TYPE_SENSITIVITY }
    };
    const result = getFinalIndividualResultsForContinuum(baseResults, obs);

    expect(result.results5.field).toMatch(/IntegrationTime/);
    expect(result.results10.field).toBe('spectralIntegrationTime');
  });

  test('should handle missing transformed_result gracefully', () => {
    const obs = { ...baseObservation };
    const result = getFinalIndividualResultsForContinuum({}, obs);

    expect(result.results1.value).toBe('0');
    expect(result.results4.value).toContain('0 x 0');
  });
});
