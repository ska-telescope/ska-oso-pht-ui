import { STATUS_INITIAL, STATUS_OK, STATUS_PARTIAL } from '../../../utils/constants';
import { SensCalcResult } from './getSensitivityCalculatorAPIData';

export const SENSCALC_EMPTY_MOCKED: SensCalcResult = {
  status: STATUS_INITIAL
};

export const SENSCALC_PARTIAL_MOCKED: SensCalcResult = {
  status: STATUS_PARTIAL,
  error: ''
};

export const SENSCALC_CONTINUUM_MOCKED: SensCalcResult = {
  title: 'TITLE FIELD',
  status: STATUS_OK,
  error: '',
  section1: [
    { field: 'continuumSensitivityWeighted', value: '84.47', units: 'ujy/beam' },
    { field: 'continuumConfusionNoise', value: '3.63', units: 'mjy/beam' },
    { field: 'continuumTotalSensitivity', value: '3.64', units: 'mjy/beam' },
    { field: 'continuumSynthBeamSize', value: '190.0 x 171.3', units: 'arcsecs2' },
    { field: 'continuumSurfaceBrightnessSensitivity', value: '3.40', units: 'k' }
  ],
  section2: [
    { field: 'spectralSensitivityWeighted', value: '2.62', units: 'ujy/beam' },
    { field: 'spectralConfusionNoise', value: '6.02', units: 'mjy/beam' },
    { field: 'spectralTotalSensitivity', value: '9.45', units: 'mjy/beam' },
    { field: 'spectralSynthBeamSize', value: '230.0 x 207.8', units: 'arcsecs2' },
    { field: 'spectralSurfaceBrightnessSensitivity', value: '6.04', units: 'k' }
  ],
  section3: [{ field: 'integrationTime', value: '19.3', units: 'hours' }]
};

export const SENSCALC_SPECTRAL_MOCKED: SensCalcResult = {
  title: 'TITLE FIELD',
  status: STATUS_OK,
  error: '',
  section1: [
    { field: 'spectralSensitivityWeighted', value: '84.47', units: 'ujy/beam' },
    { field: 'spectralConfusionNoise', value: '3.63', units: 'mjy/beam' },
    { field: 'spectralTotalSensitivity', value: '3.64', units: 'mjy/beam' },
    { field: 'spectralSynthBeamSize', value: '190.0 x 171.3', units: 'arcsecs2' },
    { field: 'spectralSurfaceBrightnessSensitivity', value: '3.40', units: 'k' }
  ],
  section3: [{ field: 'integrationTime', value: '19.3', units: 'hours' }]
};
