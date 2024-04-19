import { STATUS_INITIAL, STATUS_OK } from '../../../utils/constants';
import { SensCalcResult } from './getSensitivityCalculatorAPIData';

export const SENSCALC_EMPTY_MOCKED: SensCalcResult = {
  status: STATUS_INITIAL
};

export const SENSCALC_CONTINUUM_MOCKED: SensCalcResult = {
  title: 'TITLE FIELD',
  status: STATUS_OK,
  section1: [
    { field: 'continuumSensitivityWeighted', value: '84.47', units: 'ujy/beam (6.10)' },
    { field: 'continuumConfusionNoise', value: '3.63', units: 'mjy/beam' },
    { field: 'continuumTotalSensitivity', value: '3.64', units: 'mjy/beam' },
    { field: 'continuumSynthBeamSize', value: '190.0" x 171.3"', units: '' },
    { field: 'continuumSurfaceBrightnessSensitivity', value: '3.40', units: 'k' }
  ],
  section2: [
    { field: 'continuumSpectralLineSensitivityWeighted', value: '(2.62)', units: '' },
    { field: 'continuumSpectralLineConfusionNoise', value: '6.02', units: 'mjy/beam' },
    { field: 'continuumSpectralLineTotalSensitivity', value: '9.45', units: 'mjy/beam' },
    { field: 'continuumSpectralLineSynthBeamSize', value: '230.0" x 207.8"', units: '' },
    { field: 'continuumSpectralLineSurfaceBrightnessSensitivity', value: '6.04', units: 'k' }
  ],
  section3: [{ field: 'integrationTime', value: '19.3', units: 'rad/m squared' }]
};

export const SENSCALC_SPECTRAL_MOCKED: SensCalcResult = {
  title: 'TITLE FIELD',
  status: STATUS_OK,
  section1: [
    { field: 'spectralSensitivityWeighted', value: '84.47', units: 'ujy/beam (6.10)' },
    { field: 'spectralConfusionNoise', value: '3.63', units: 'mjy/beam' },
    { field: 'spectralTotalSensitivity', value: '3.64', units: 'mjy/beam' },
    { field: 'spectralSynthBeamSize', value: '190.0" x 171.3"', units: '' },
    { field: 'spectralSurfaceBrightnessSensitivity', value: '3.40', units: 'k' }
  ],
  section3: [{ field: 'integrationTime', value: '19.3', units: 'rad/m squared' }]
};
