import {
  degDecToSexagesimal,
  degRaToSexagesimal,
  frequencyConversion,
  getRobustMapping,
  isGalactic,
  timeConversion,
  transformPerSubBandData,
  transformPerSubBandTime,
  transformSurfaceBrightnessPerSubBandData,
  transformSynthesizedBeamSizePerSubBandData
} from '../../../utils/helpersSensCalc';
import { IW_BRIGGS, SEPARATOR1 } from '../../../utils/constantsSensCalc';
import {
  AdvancedData,
  ContinuumData,
  StandardData,
  SubArrayResults,
  ValueUnitPair,
  ZoomData
} from '../../../utils/types/typesSensCalc';
import { t } from 'i18next';

/***************/

export const addMapping = (field: string, inPair: ValueUnitPair) => {
  const value = inPair?.value?.toString();
  const units = inPair?.unit?.toString();
  return { field: field, value: value, units: units };
};

export const addMappingString = (field: string, inStr: string) => {
  const stripped = inStr.replace(new RegExp('Warning: ', 'g'), '');
  return { field: field, value: stripped, units: '' };
};

/***************/

// TODO : Clean this up
export function addMainData(
  results: any[],
  field: string,
  data: any,
  obj: { field: string; value: string; units: string } | null,
  isCustom = false
) {
  if (data) {
    results.push(obj);
  } else {
    results.push({
      field: field,
      value: isCustom ? 'naNoBeam' : 'naNonGaussian',
      units: ''
    });
  }
}

export function addWarningData(data: string[], results: any[], fieldName: string = 'warning') {
  if (data?.length > 0) {
    results.push(addMappingString(fieldName, data[0]));
  }
  return results;
}

// A bit of fudging going on here so that the extra warning added to the string is suppressed
// and also to cater for the specific nature of the object.
// Eventually should be replaced with a string and then the previous function can be used.
export function addWarningObject(data: { continuum_sensitivity: string } | string, results: any[]) {
  if (typeof data === 'string') {
    results.push(addMappingString('warning', data));
  } else if (data?.continuum_sensitivity) {
    const warning = data?.continuum_sensitivity.split(': ');
    results.push(addMappingString('warning', warning[1]));
  }
}

/***************/

export function addRobustProperty(data: ContinuumData | ZoomData, properties: string) {
  if (data.imageWeighting === IW_BRIGGS) {
    properties += addValue('robustness', getRobustMapping(data.robust));
  }
  return properties;
}

/***************/

export function addSubBandResultData(data: any, results: any[]) {
  if (
    'continuum_subband_integration_times' in data?.calculate ||
    'continuum_subband_sensitivities' in data?.calculate
  ) {
    /* Keep for now, but we may be able to remove this
      results.push(
        addMappingString(
          'spectralSensitivityPerSubBand',
          transformWeightedSensitivityPerSubBandData(
            data?.transformed_result.weighted_sensitivity_per_subband,
            continuum_weighting?.weighting_factor,
            WEIGHTING_CORRECTION_FACTOR_30_PERCENT_BANDWIDTH
          )
        )
      );
      */
    if (data?.transformed_result.subbands.weighted_sensitivity_per_subband) {
      results.push(
        addMappingString(
          'weightedSensitivityPerSubband',
          transformPerSubBandData(
            data?.transformed_result.subbands.weighted_sensitivity_per_subband
          )
        )
      );
    }

    if (data?.transformed_result.subbands.confusion_noise_per_subband) {
      results.push(
        addMappingString(
          'spectralConfusionNoisePerSubBand',
          transformPerSubBandData(data?.transformed_result.subbands.confusion_noise_per_subband)
        )
      );
    } else if (data?.transformed_result.subbands.confusion_noise_per_subband === null) {
      results.push({
        field: 'spectralConfusionNoisePerSubBand',
        value: t('sensitivityCalculatorResults.naNonGaussian'),
        units: ''
      });
    }

    if (data?.transformed_result.subbands.total_sensitivity_per_subband) {
      results.push(
        addMappingString(
          'spectralTotalSensitivityPerSubBand',
          transformPerSubBandData(data?.transformed_result.subbands.total_sensitivity_per_subband)
        )
      );
    } else if (data?.transformed_result.subbands.total_sensitivity_per_subband === null) {
      results.push({
        field: 'spectralTotalSensitivityPerSubBand',
        value: t('sensitivityCalculatorResults.naNonGaussian'),
        units: ''
      });
    }

    if (data?.transformed_result.subbands.synthesized_beam_size_per_subband) {
      results.push(
        addMappingString(
          'spectralSynthBeamSizePerSubBand',
          transformSynthesizedBeamSizePerSubBandData(
            data?.transformed_result.subbands.synthesized_beam_size_per_subband
          )
        )
      );
    } else if (data?.transformed_result.subbands.synthesized_beam_size_per_subband === null) {
      results.push({
        field: 'spectralSynthBeamSizePerSubBand',
        value: t('sensitivityCalculatorResults.naNonGaussian'),
        units: ''
      });
    }

    if (data?.transformed_result.subbands.surface_brightness_sensitivity_per_subband) {
      results.push(
        addMappingString(
          'spectralSurfaceBrightnessSensitivityPerSubBand',
          transformSurfaceBrightnessPerSubBandData(
            data?.transformed_result.subbands.surface_brightness_sensitivity_per_subband
          )
        )
      );
    } else if (
      data?.transformed_result.subbands.surface_brightness_sensitivity_per_subband === null
    ) {
      results.push({
        field: 'spectralSurfaceBrightnessSensitivityPerSubBand',
        value: t('sensitivityCalculatorResults.naNonGaussian'),
        units: ''
      });
    }

    if (data?.transformed_result.subbands.integration_time_per_subband) {
      results.push(
        addMappingString(
          'integrationTimePerSubBand',
          transformPerSubBandTime(data?.transformed_result.subbands.integration_time_per_subband)
        )
      );
    }
  }
}

/***************/

export const addFrequency = (
  label: string,
  inPair: ValueUnitPair,
  conversion: number,
  prefix: string = SEPARATOR1
) => {
  return (
    prefix + label + '=' + frequencyConversion(inPair?.value, Number(inPair?.unit), conversion)
  );
};

export const addNonZero = (label: string, value: any, prefix: string = SEPARATOR1) => {
  return typeof value === 'number' && value !== 0 ? prefix + label + '=' + value : '';
};

export const addTime = (
  label: string,
  inPair: ValueUnitPair,
  conversion: number,
  prefix: string = SEPARATOR1
) => {
  return prefix + label + '=' + timeConversion(inPair?.value, Number(inPair?.unit), conversion);
};

export const addValue = (label: string, value: any, prefix: string = SEPARATOR1) => {
  return prefix + label + '=' + value;
};

/***************/

export const subArrayLookup = (
  standardData: StandardData,
  arr: SubArrayResults,
  prefix: string = SEPARATOR1
) => {
  const results = arr.find(e => e.name === standardData.subarray)?.label;
  return prefix + 'subarray_configuration=' + results;
};

export const pointingCentre = (standardData: StandardData, prefix: string = SEPARATOR1) => {
  if (isGalactic(standardData?.skyDirectionType)) {
    return (
      prefix +
      'pointing_centre=' +
      standardData?.raGalactic?.value +
      ' ' +
      standardData?.decGalactic?.value
    );
  } else {
    return (
      prefix +
      'pointing_centre=' +
      degRaToSexagesimal(String(standardData?.raEquatorial?.value)) +
      ' ' +
      degDecToSexagesimal(String(standardData?.decEquatorial?.value))
    );
  }
};

export const rxBand = (inValue: string, prefix: string = SEPARATOR1) => {
  switch (inValue) {
    case 'mid_band_1':
      return prefix + 'rx_band=Band 1';
    case 'mid_band_2':
      return prefix + 'rx_band=Band 2';
    case 'mid_band_3':
      return prefix + 'rx_band=Band 3';
    case 'mid_band_4':
      return prefix + 'rx_band=Band 4';
    case 'mid_band_5a':
      return prefix + 'rx_band=Band 5a';
    case 'mid_band_5b':
      return prefix + 'rx_band=Band 5b';
    default:
      return prefix + 'rx_band=?????';
  }
};

/***************/

export const addAdvancedData = (advancedData: AdvancedData) => {
  let params = '';
  params += addNonZero('eta_system', advancedData.efficiencySystem);
  params += addNonZero('eta_pointing', advancedData.efficiencyPointing);
  params += addNonZero('eta_coherence', advancedData.efficiencyCoherence);
  params += addNonZero('eta_digitisation', advancedData.efficiencyDigitisation);
  params += addNonZero('eta_correlation', advancedData.efficiencyCorrelation);
  params += addNonZero('eta_bandpass', advancedData.efficiencyBandpass);

  params += addNonZero('t_sys_ska', advancedData.temperature15System);
  params += addNonZero('t_rx_ska', advancedData.temperature15Receiver);
  params += addNonZero('t_spl_ska', advancedData.temperature15Spillover);

  params += addNonZero('t_sys_meer', advancedData.temperature13System);
  params += addNonZero('t_rx_meer', advancedData.temperature13Receiver);
  params += addNonZero('t_spl_meer', advancedData.temperature13Spillover);

  params += addNonZero('t_sky_ska', advancedData.skyBrightnessTemperature);
  params += addNonZero('t_gal_ska', advancedData.efficiencyAperture15);
  params += addNonZero('t_gal_meer', advancedData.efficiencyAperture13);
  params += addNonZero('t_sys_meer', advancedData.skyBrightnessTemperature);
  params += addNonZero('alpha', advancedData.skyBrightnessGalactic);
  return params;
};
