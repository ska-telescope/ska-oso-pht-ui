import { describe, test, expect } from 'vitest';
import { getFinalIndividualResultsForZoom } from './getZoomData';

describe('getFinalIndividualResultsForZoom', () => {
  const mockObservation = {
    supplied: {
      type: 'SENSITIVITY',
      value: 42,
      units: 'Jy'
    }
  };

  const mockResults = {
    transformed_result: [
      {
        weighted_continuum_sensitivity: { value: 1, unit: 'Jy' },
        continuum_confusion_noise: { value: 2, unit: 'Jy' },
        total_continuum_sensitivity: { value: 3, unit: 'Jy' },
        continuum_synthesized_beam_size: {
          beam_maj: { value: 1.1 },
          beam_min: { value: 2.2 }
        },
        continuum_integration_time: { value: 100, unit: 'h' },
        continuum_surface_brightness_sensitivity: { value: 4, unit: 'Jy/beam' },
        weighted_spectral_sensitivity: { value: 5, unit: 'Jy' },
        spectral_confusion_noise: { value: 6, unit: 'Jy' },
        total_spectral_sensitivity: { value: 7, unit: 'Jy' },
        spectral_synthesized_beam_size: {
          beam_maj: { value: 3.3 },
          beam_min: { value: 4.4 }
        },
        spectral_integration_time: { value: 200, unit: 's' },
        spectral_surface_brightness_sensitivity: { value: 8, unit: 'Jy/beam' }
      }
    ]
  };

  test('should return all result fields with correct structure', () => {
    const results = getFinalIndividualResultsForZoom(mockResults, mockObservation);

    expect(results).toHaveProperty('results1');
    expect(results).toHaveProperty('results2');
    expect(results).toHaveProperty('results3');
    expect(results).toHaveProperty('results4');
    expect(results).toHaveProperty('results5');
    expect(results).toHaveProperty('results6');
    expect(results).toHaveProperty('results7');
    expect(results).toHaveProperty('results8');
    expect(results).toHaveProperty('results9');
    expect(results).toHaveProperty('results10');
    expect(results).toHaveProperty('results11');
  });

  test('should handle missing optional fields gracefully', () => {
    const incompleteResults = {
      transformed_result: [{}]
    };
    const results = getFinalIndividualResultsForZoom(incompleteResults, mockObservation);
    expect(results.results1.value).toBe('0');
    expect(results.results4.value).toContain('0');
  });

  test('should use correct field names for non-supplied sensitivity', () => {
    const obs = {
      supplied: {
        type: 'NOT_SENSITIVITY',
        value: 42,
        units: 'Jy'
      }
    };
    const results = getFinalIndividualResultsForZoom(mockResults, obs);
    expect(results.results5.field).toBe('continuumSurfaceBrightnessSensitivity');
    expect(results.results10.field).toBe('spectralSurfaceBrightnessSensitivity');
  });

  test('should set units and values correctly for results11', () => {
    const results = getFinalIndividualResultsForZoom(mockResults, mockObservation);
    expect(results.results11.value).toBe('42');
    // The units label depends on OSD_CONSTANTS, so just check it's a string
    expect(typeof results.results11.units).toBe('string');
  });
});
