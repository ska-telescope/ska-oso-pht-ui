import { STATUS_OK } from '@/utils/constants.ts';
import { SensCalcResults } from '@/utils/types/sensCalc.tsx';

export const CONTINUUM_DATA_MOCKED: SensCalcResults = {
  id: 1,
  statusGUI: STATUS_OK,
  error: '',
  results: [
    { field: 'continuumSensitivityWeighted', value: '84.47', units: 'μJy/beam' },
    { field: 'continuumConfusionNoise', value: '3.63', units: 'mjy/beam' },
    { field: 'continuumTotalSensitivity', value: '3.64', units: 'mjy/beam' },
    { field: 'continuumSynthBeamSize', value: '190.0 x 171.3', units: 'arcsec2' },
    { field: 'continuumSurfaceBrightnessSensitivity', value: '3.40', units: 'k' },
    { field: 'spectralSensitivityWeighted', value: '2.62', units: 'μJy/beam' },
    { field: 'spectralConfusionNoise', value: '6.02', units: 'mjy/beam' },
    { field: 'spectralTotalSensitivity', value: '9.45', units: 'mjy/beam' },
    { field: 'spectralSynthBeamSize', value: '230.0 x 207.8', units: 'arcsec2' },
    { field: 'spectralSurfaceBrightnessSensitivity', value: '6.04', units: 'k' },
    { field: 'integrationTime', value: '19.3', units: 'hours' }
  ]
};
