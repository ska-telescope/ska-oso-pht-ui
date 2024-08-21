import sensCalHelpers from './sensCalHelpers';
import Observation from '../../../utils/types/observation';
import { SensCalcResults } from '../../../utils/types/sensCalcResults';
import {
  LOW_BEAM_SIZE_PRECISION,
  MID_BEAM_SIZE_PRECISION,
  OBS_TYPES,
  OBSERVATION,
  STATUS_OK,
  TELESCOPE_LOW_NUM,
  TYPE_CONTINUUM,
  TYPE_SUPPLIED_SENSITIVITY,
  TYPE_ZOOM
} from '../../../utils/constants';
import {
  SensitivityCalculatorAPIResponseLow,
  SensitivityCalculatorAPIResponseMid
} from './../../../utils/types/sensitivityCalculatorAPIResponse';
import Target from '../../../utils/types/target';
import { ValueUnitPair } from 'utils/types/valueUnitPair';

export default function calculateSensitivityCalculatorResults(
  response: any,
  observation: Observation,
  target: Target
): SensCalcResults {
  const isLow = () => observation.telescope === TELESCOPE_LOW_NUM;
  const isZoom = () => observation.type === TYPE_ZOOM;
  const isSensitivitySupplied = () => observation.supplied.type === TYPE_SUPPLIED_SENSITIVITY;

  const weightedSensitivity = isLow()
    ? getWeightedSensitivityLOW(response, isZoom())
    : getWeightedSensitivityMid(response, isZoom(), observation);

  const confusionNoise = getConfusionNoise(response, isZoom());

  const totalSensitivity = getSensitivity(confusionNoise, weightedSensitivity);
  console.log('totalSensitivity', totalSensitivity);
  const beamSize = isLow()
    ? getBeamSizeLOW(response, isZoom())
    : getBeamSizeMID(response, isZoom());

  const spectralWeightedSensitivity = isLow()
    ? getSpectralWeightedSensitivityLOW(response, isZoom())
    : getSpectralWeightedSensitivityMID(observation, response, isZoom());

  const spectralConfusionNoise = getSpectralConfusionNoise(response, isZoom());

  const spectralTotalSensitivity = getSensitivity(
    spectralConfusionNoise,
    spectralWeightedSensitivity
  );

  // SBS for LOW should now be correct for Continuum/Spectral/Zoom
  /* TODO
    - refactor SBS LOW code (remove duplication, etc.)
    - fix SBS results for MID
  */
  const getSurfaceBrightnessSensitivity = (
    response: SensitivityCalculatorAPIResponseLow | SensitivityCalculatorAPIResponseMid,
    sense: number,
    isZoom: boolean
  ): ValueUnitPair => {
    const rec = isZoom ? response?.weighting[0] : response?.weighting;
    const rawSurfaceBrightnessSensitivity = rec ? sense * rec?.sbs_conv_factor : 0;
    return rec
      ? sensCalHelpers.format.convertKelvinsToDisplayValue(rawSurfaceBrightnessSensitivity)
      : { value: 0, unit: '' };
  };
  const sbs = getSurfaceBrightnessSensitivity(
    response,
    isZoom() ? spectralTotalSensitivity : totalSensitivity,
    isZoom()
  );

  const spectralSbs = isLow()
    ? getSpectralSurfaceBrightnessLOW(response, spectralTotalSensitivity, isZoom())
    : getSpectralSurfaceBrightnessMID(response, spectralTotalSensitivity, isZoom());

  const spectralBeamSize = isLow()
    ? getSpectralBeamSizeLOW(response, isZoom())
    : getSpectralBeamSizeMID(response, isZoom());

  const convertSuppliedSensitivityToDisplayValue = (suppliedSensitivity: number) => {
    const suppliedSensitivityUnits = OBSERVATION.Supplied.find(
      item => item.value === TYPE_SUPPLIED_SENSITIVITY
    ).units;
    const displayValue = {
      value: suppliedSensitivity,
      unit: suppliedSensitivityUnits.find(u => u.value === observation.supplied.units)?.label
    };
    return displayValue;
  };

  const confusionNoiseDisplay = sensCalHelpers.format.convertReturnedSensitivityToDisplayValue(
    confusionNoise
  );
  const weightedSensitivityDisplay = isSensitivitySupplied()
    ? convertSuppliedSensitivityToDisplayValue(weightedSensitivity)
    : sensCalHelpers.format.convertReturnedSensitivityToDisplayValue(weightedSensitivity);
  const totalSensitivityDisplay = sensCalHelpers.format.convertReturnedSensitivityToDisplayValue(
    isZoom() ? spectralTotalSensitivity : totalSensitivity
  );
  const beamSizeDisplay = { value: beamSize, units: 'arcsec2' };

  const spectralConfusionNoiseDisplay = sensCalHelpers.format.convertReturnedSensitivityToDisplayValue(
    spectralConfusionNoise
  );

  const spectralWeightedSensitivityDisplay = isSensitivitySupplied()
    ? convertSuppliedSensitivityToDisplayValue(spectralWeightedSensitivity)
    : sensCalHelpers.format.convertReturnedSensitivityToDisplayValue(spectralWeightedSensitivity);

  const spectralTotalSensitivityDisplay = sensCalHelpers.format.convertReturnedSensitivityToDisplayValue(
    spectralTotalSensitivity
  );
  const spectralBeamSizeDisplay = { value: spectralBeamSize, units: 'arcsec2' };

  const observationTypeLabel: string = OBS_TYPES[observation.type];

  const suppliedType = OBSERVATION.Supplied.find(sup => sup.value === observation.supplied.type)
    ?.sensCalcResultsLabel;

  const theResults: SensCalcResults = {
    id: target.id,
    title: target.name,
    statusGUI: STATUS_OK,
    section1: [
      {
        field: `${observationTypeLabel}SensitivityWeighted`,
        value: isZoom()
          ? spectralWeightedSensitivityDisplay?.value.toString()
          : weightedSensitivityDisplay?.value.toString(),
        units: weightedSensitivityDisplay?.unit
      },
      {
        field: `${observationTypeLabel}ConfusionNoise`,
        value: isZoom()
          ? spectralConfusionNoiseDisplay?.value.toString()
          : confusionNoiseDisplay?.value.toString(),
        units: confusionNoiseDisplay?.unit
      },
      {
        field: `${observationTypeLabel}TotalSensitivity`,
        value: isZoom()
          ? spectralTotalSensitivityDisplay?.value.toString()
          : totalSensitivityDisplay?.value.toString(),
        units: totalSensitivityDisplay?.unit
      },
      {
        field: `${observationTypeLabel}SynthBeamSize`,
        value: beamSizeDisplay?.value,
        units: beamSizeDisplay?.units
      },
      {
        field: `${observationTypeLabel}SurfaceBrightnessSensitivity`,
        value: sbs?.value.toString(),
        units: sbs?.unit
      }
    ],
    // only return section2 if continuum
    ...(observation.type === TYPE_CONTINUUM && {
      section2: [
        {
          field: 'spectralSensitivityWeighted',
          value: spectralWeightedSensitivityDisplay.value.toString(),
          units: spectralWeightedSensitivityDisplay.unit // TODO set correct unit when using supplied sensitivity
        },
        {
          field: 'spectralConfusionNoise',
          value: spectralConfusionNoiseDisplay?.value.toString(),
          units: spectralConfusionNoiseDisplay?.unit
        },
        {
          field: 'spectralTotalSensitivity',
          value: spectralTotalSensitivityDisplay.value.toString(),
          units: spectralTotalSensitivityDisplay.unit
        },
        {
          field: 'spectralSynthBeamSize',
          value: spectralBeamSizeDisplay?.value,
          units: spectralBeamSizeDisplay?.units
        },
        {
          field: 'spectralSurfaceBrightnessSensitivity',
          value: spectralSbs?.value.toString(),
          units: spectralSbs?.unit
        }
      ]
    }),
    section3: [
      {
        field: suppliedType,
        value: observation.supplied.value.toString(),
        units: OBSERVATION.Supplied.find(s => s.sensCalcResultsLabel === suppliedType)?.units?.find(
          u => u.value === observation.supplied.units
        )?.label
      }
    ]
  };
  return theResults;
}

/******************************************* LOW ********************************************/

const getWeightedSensitivityLOW = (
  response: SensitivityCalculatorAPIResponseLow,
  isZoom: boolean
) => {
  console.log('::: in getWeightedSensitivityLOW');
  const sensitivity = isZoom
    ? response.calculate.data.spectral_sensitivity?.value
    : response.calculate.data.continuum_sensitivity?.value;
  const factor = isZoom
    ? response.weighting[0].weighting_factor
    : response.weighting.weighting_factor;
  console.log('sensitivity', sensitivity);
  console.log('factor', factor);
  return (sensitivity ?? 0) * factor;
};

const getBeamSizeLOW = (response: SensitivityCalculatorAPIResponseLow, isZoom): string => {
  const rec = isZoom ? response.weighting[0] : response.weighting;
  return sensCalHelpers.format.convertBeamValueDegreesToDisplayValue(
    rec?.beam_size.beam_maj_scaled,
    rec?.beam_size.beam_min_scaled,
    LOW_BEAM_SIZE_PRECISION
  );
};

/* -------------- */

const getSpectralWeightedSensitivityLOW = (
  response: SensitivityCalculatorAPIResponseLow,
  isZoom: boolean
) => {
  const rec = isZoom ? response.weighting[0] : response.weightingLine[0];
  const calc = isZoom ? response.calculate.data[0] : response.calculate.data;
  return (calc.spectral_sensitivity?.value ?? 0) * rec.weighting_factor;
};

const getSpectralBeamSizeLOW = (response: SensitivityCalculatorAPIResponseLow, isZoom: boolean) => {
  const rec = isZoom ? response.weighting[0].beam_size : response.weightingLine[0].beam_size;
  const formattedBeams = sensCalHelpers.format.convertBeamValueDegreesToDisplayValue(
    rec.beam_maj_scaled,
    rec.beam_min_scaled,
    LOW_BEAM_SIZE_PRECISION
  );
  return formattedBeams;
};

const getSpectralSurfaceBrightnessLOW = (
  response: SensitivityCalculatorAPIResponseLow,
  sense: number,
  isZoom: boolean
) => {
  const rec = isZoom ? response.weighting[0] : response.weightingLine[0];
  return rec
    ? sensCalHelpers.format.convertKelvinsToDisplayValue(sense * rec.sbs_conv_factor)
    : { value: 0, unit: '' };
};

/******************************************* MID ********************************************/

const getWeightedSensitivityRawValueMid = (
  response: SensitivityCalculatorAPIResponseMid,
  isZoom: boolean,
  observation: Observation
) => {
  const recCalc = isZoom ? response?.calculate?.data[0] : response?.calculate?.data;
  const recWeight = isZoom ? response?.weighting[0] : response?.weighting;
  if (recCalc?.continuum_sensitivity?.value) {
    return recCalc.continuum_sensitivity!.value! * recWeight.weighting_factor * 1e6;
  } else {
    return observation?.supplied.value;
  }
};

const getWeightedSensitivityMid = (
  response: SensitivityCalculatorAPIResponseMid,
  isZoom: boolean,
  observation: Observation
) => {
  return getWeightedSensitivityRawValueMid(response, isZoom, observation);
};

const getBeamSizeMID = (response: SensitivityCalculatorAPIResponseMid, isZoom): string => {
  const rec = isZoom ? response?.weighting[0] : response?.weighting;
  if (rec) {
    return sensCalHelpers.format.convertBeamValueDegreesToDisplayValue(
      rec?.beam_size?.beam_maj_scaled,
      rec?.beam_size?.beam_min_scaled,
      MID_BEAM_SIZE_PRECISION
    );
  } else {
    return '';
  }
};

/* -------------- */

const getSpectralWeightedSensitivityRawValueMid = (
  observation: Observation,
  response: SensitivityCalculatorAPIResponseLow,
  isZoom: boolean
) => {
  const recCalc = isZoom ? response?.calculate?.data[0] : response?.calculate?.data;
  const recWeightLine = isZoom ? response?.weighting[0] : response?.weightingLine[0];
  if (recCalc?.spectral_sensitivity?.value) {
    return recCalc.spectral_sensitivity?.value! * recWeightLine.weighting_factor * 1e6;
  } else {
    return observation?.supplied.value;
  }
};

const getSpectralWeightedSensitivityMID = (
  observation: Observation,
  response: SensitivityCalculatorAPIResponseLow,
  isZoom: boolean
) => {
  return getSpectralWeightedSensitivityRawValueMid(observation, response, isZoom);
};

const getSpectralBeamSizeMID = (response: SensitivityCalculatorAPIResponseMid, isZoom: boolean) => {
  const rec = isZoom ? response?.weighting[0]?.beam_size : response?.weightingLine[0]?.beam_size;
  if (!rec) {
    return null;
  }
  const formattedBeams = sensCalHelpers.format.convertBeamValueDegreesToDisplayValue(
    rec.beam_maj_scaled,
    rec.beam_min_scaled,
    MID_BEAM_SIZE_PRECISION
  );
  return formattedBeams;
};

const getSpectralSurfaceBrightnessMID = (
  response: SensitivityCalculatorAPIResponseMid,
  sense: number,
  isZoom: boolean
) => {
  const conv_factor = isZoom
    ? response?.weighting?.sbs_conv_factor
    : response?.weightingLine[0]?.sbs_conv_factor;
  return sense * conv_factor;
};

/********************************************* COMMON ***********************************************/

const getSensitivity = (confusionNoise: number, weightedSensitivity: number): number =>
  sensCalHelpers.calculate.sqrtOfSumSqs(confusionNoise, weightedSensitivity);

const getConfusionNoise = (response: SensitivityCalculatorAPIResponseLow, isZoom): number => {
  const rawConfusionNoise = getRawConfusionNoise(response, isZoom);
  return rawConfusionNoise
    ? sensCalHelpers.format.convertConfusionNoiseRawValueInuJy(Number(rawConfusionNoise))
    : 0;
};

const getSpectralConfusionNoise = (
  response: SensitivityCalculatorAPIResponseLow | SensitivityCalculatorAPIResponseMid,
  isZoom: Boolean
) => {
  const rawSpectralConfusionNoise = getSpectralRawConfusionNoise(response, isZoom);
  return rawSpectralConfusionNoise
    ? sensCalHelpers.format.convertConfusionNoiseRawValueInuJy(Number(rawSpectralConfusionNoise))
    : 0;
};

const getRawConfusionNoise = (response: SensitivityCalculatorAPIResponseLow, isZoom): number => {
  return isZoom
    ? response.weighting[0].confusion_noise.value
    : response.weighting.confusion_noise.value;
};

const getSpectralRawConfusionNoise = (
  response: SensitivityCalculatorAPIResponseLow | SensitivityCalculatorAPIResponseMid,
  isZoom
): number => {
  return isZoom
    ? response.weighting[0].confusion_noise.value
    : response.weightingLine[0].confusion_noise.value;
};
