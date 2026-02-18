import { describe, test, expect } from 'vitest';
import { SUPPLIED_TYPE_SENSITIVITY, STATUS_OK, TYPE_CONTINUUM } from '@utils/constants.ts';
import { getFinalResults, getFinalIndividualResultsForContinuum } from './getContinuumData';

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

describe('getFinalResults', () => {
  const target = { id: 'target1', name: 'Target 1' };

  const observationBase = {
    type: TYPE_CONTINUUM,
    supplied: { type: 0, value: { toString: () => '42' }, units: 1 }
  };

  const resultsBase = {
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

  test('should return correct structure for continuum, not supplied sensitivity', () => {
    const obs = { ...observationBase, supplied: { ...observationBase.supplied, type: 999 } };
    const result = getFinalResults(target, resultsBase, obs);

    expect(result.id).toBe(target.id);
    expect(result.title).toBe(target.name);
    expect(result.statusGUI).toBe(STATUS_OK);
    expect(result.section1?.length).toBeGreaterThan(0);
    expect(result.section2?.length).toBeGreaterThan(0);
    expect(result.section3?.length).toBe(1);
  });

  test('should return correct structure for supplied sensitivity', () => {
    const obs = {
      ...observationBase,
      supplied: { ...observationBase.supplied, type: SUPPLIED_TYPE_SENSITIVITY }
    };
    const result = getFinalResults(target, resultsBase, obs);

    expect(result.section1?.find(r => r.field.includes('SensitivityWeighted'))).toBeUndefined();
    expect(result.section2?.find(r => r.field === 'spectralSensitivityWeighted')).toBeUndefined();
    expect(result.section3?.length).toBe(1);
  });

  test('should handle missing transformed_result gracefully', () => {
    const obs = { ...observationBase };
    const result = getFinalResults(target, {}, obs);

    expect(result.section1?.length).toBeGreaterThan(0);
    expect(result.section3?.length).toBe(1);
  });

  test('should not include section2 if not continuum', () => {
    const obs = { ...observationBase, type: 1234 };
    const result = getFinalResults(target, resultsBase, obs);

    expect(result.section2).toBeUndefined();
  });
});
