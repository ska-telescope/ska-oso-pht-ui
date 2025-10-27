import { STATUS_INITIAL, STATUS_OK, STATUS_PARTIAL } from '../../../utils/constants';
import { SensCalcResults } from '../../../utils/types/sensCalcResults';

export const SENSCALC_EMPTY_MOCKED: SensCalcResults = {
  statusGUI: STATUS_INITIAL,
  id: 0,
  title: ''
};

export const SENSCALC_PARTIAL_MOCKED: SensCalcResults = {
  statusGUI: STATUS_PARTIAL,
  error: '',
  id: 0,
  title: ''
};

export const SENSCALC_CONTINUUM_MOCKED: SensCalcResults = {
  id: 1,
  title: 'TITLE FIELD',
  statusGUI: STATUS_OK,
  error: '',
  section1: [
    { field: 'continuumSensitivityWeighted', value: '84.47', units: 'μJy/beam' },
    { field: 'continuumConfusionNoise', value: '3.63', units: 'mJy/beam' },
    { field: 'continuumTotalSensitivity', value: '3.64', units: 'mJy/beam' },
    { field: 'continuumSynthBeamSize', value: '190.0 x 171.3', units: 'arcsec2' },
    { field: 'continuumSurfaceBrightnessSensitivity', value: '3.40', units: 'K' }
  ],
  section2: [
    { field: 'spectralSensitivityWeighted', value: '2.62', units: 'μJy/beam' },
    { field: 'spectralConfusionNoise', value: '6.02', units: 'mJy/beam' },
    { field: 'spectralTotalSensitivity', value: '9.45', units: 'mJy/beam' },
    { field: 'spectralSynthBeamSize', value: '230.0 x 207.8', units: 'arcsec2' },
    { field: 'spectralSurfaceBrightnessSensitivity', value: '6.04', units: 'K' }
  ],
  section3: [{ field: 'integrationTime', value: '19.3', units: 'hours' }]
};

export const SENSCALC_SPECTRAL_MOCKED: SensCalcResults = {
  id: 2,
  title: 'TITLE FIELD',
  statusGUI: STATUS_OK,
  error: '',
  section1: [
    { field: 'spectralSensitivityWeighted', value: '84.47', units: 'μJy/beam' },
    { field: 'spectralConfusionNoise', value: '3.63', units: 'mJy/beam' },
    { field: 'spectralTotalSensitivity', value: '3.64', units: 'mJy/beam' },
    { field: 'spectralSynthBeamSize', value: '190.0 x 171.3', units: 'arcsec2' },
    { field: 'spectralSurfaceBrightnessSensitivity', value: '3.40', units: 'K' }
  ],
  section3: [{ field: 'integrationTime', value: '19.3', units: 'hours' }]
};
