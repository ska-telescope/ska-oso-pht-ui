import { STATUS_OK } from '@/utils/constants';
import { SensCalcResults } from '@/utils/types/sensCalcResults';

export const CONTINUUM_DATA_MOCKED: SensCalcResults = {
  id: 1,
  statusGUI: STATUS_OK,
  error: '',
  results: [
    { field: 'continuumSensitivityWeighted', value: '84.47', units: 'μJy/beam' },
    { field: 'continuumConfusionNoise', value: '3.63', units: 'mJy/beam' },
    { field: 'continuumTotalSensitivity', value: '3.64', units: 'mJy/beam' },
    { field: 'continuumSynthBeamSize', value: '190.0 x 171.3', units: 'arcsec2' },
    { field: 'continuumSurfaceBrightnessSensitivity', value: '3.40', units: 'K' },
    { field: 'spectralSensitivityWeighted', value: '2.62', units: 'μJy/beam' },
    { field: 'spectralConfusionNoise', value: '6.02', units: 'mJy/beam' },
    { field: 'spectralTotalSensitivity', value: '9.45', units: 'mJy/beam' },
    { field: 'spectralSynthBeamSize', value: '230.0 x 207.8', units: 'arcsec2' },
    { field: 'spectralSurfaceBrightnessSensitivity', value: '6.04', units: 'K' },
    { field: 'integrationTime', value: '19.3', units: 'hours' }
  ]
};
