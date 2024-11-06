import axios from 'axios';
import {
  AXIOS_CONFIG,
  OBSERVATION_TYPE_BACKEND,
  OBSERVATION,
  SKA_SENSITIVITY_CALCULATOR_API_URL,
  TYPE_CONTINUUM,
  USE_LOCAL_DATA_SENSITIVITY_CALC,
  TELESCOPE_LOW_NUM,
  TYPE_ZOOM,
  SUPPLIED_TYPE_SENSITIVITY,
  FREQUENCY_UNITS
} from '../../../../utils/constants';
import { MockResponseMidCalculateZoom, MockResponseMidCalculate } from './mockResponseMidCalculate';
import { MockResponseLowCalculate, MockResponseLowCalculateZoom } from './mockResponseLowCalculate';
import Observation from '../../../../utils/types/observation';
import sensCalHelpers from '../sensCalHelpers';
import { TELESCOPE_LOW, TELESCOPE_MID } from '@ska-telescope/ska-gui-components';
import Target from '../../../../utils/types/target';
import { helpers } from '../../../../utils/helpers';
import {
  CalculateMidContinuumQuery,
  CalculateMidZoomQuery,
  CalculateLowContinuumQuery,
  CalculateLowZoomQuery
} from '../../../../utils/types/sensCalcCalculateQuery';
import { WeightingResponse } from '../../../../utils/types/sensitivityCalculatorAPIResponse';

const URL_CALCULATE = `calculate`;

async function GetCalculate(
  observation: Observation,
  target: Target,
  weightingResponse: WeightingResponse,
  inMode: number
) {
  const isLow = () => observation.telescope === TELESCOPE_LOW_NUM;
  const isZoom = () => observation.type === TYPE_ZOOM;
  const isContinuum = () => observation.type === TYPE_CONTINUUM;

  const getTelescope = () => (isLow() ? TELESCOPE_LOW.code : TELESCOPE_MID.code);
  const getMode = () => OBSERVATION_TYPE_BACKEND[observation.type].toLowerCase() + '/';

  const getBandwidthValues = () =>
    OBSERVATION.array.find(item => item.value === observation.telescope).bandWidth;

  const apiUrl = SKA_SENSITIVITY_CALCULATOR_API_URL;
  const SUPPLIED_IS_SENSITIVITY = observation?.supplied?.type === 2 ? true : false;

  const getSubArray = () => {
    const array = OBSERVATION.array.find(obj => obj.value === observation.telescope);
    const arrConfig = array?.subarray.find(obj => obj.value === observation.subarray);
    return arrConfig?.map;
  };

  // TODO : Need to know if we are getting Equatorial or Galactic  ( units ? )
  function rightAscension() {
    return target.ra.replace('+', '').replace(' ', '');
  }

  function declination() {
    return target.dec.replace('+', '').replace(' ', '');
  }

  function getZoomBandwidthValueUnit() {
    const bandWidthValue = getBandwidthValues()?.find(item => item.value === observation?.bandwidth)
      ?.label;
    return bandWidthValue?.split(' ');
  }

  const getBandNumber = (inValue: number) => {
    if (inValue === 3) {
      return '5a';
    } else if (inValue === 4) {
      return '5b';
    } else {
      return inValue;
    }
  };

  /*********************************************************** MID *********************************************************/

  const convertFrequency = (value: number | string, units: number | string) => {
    return sensCalHelpers.format.convertBandwidthToHz(value, units);
  };
  const getSpectralResolution = () => {
    const units = FREQUENCY_UNITS[2].label;
    const spectralResValue = observation.spectralResolution.includes(units)
      ? Number(observation.spectralResolution.split(' ')[0]) * 1000
      : Number(observation.spectralResolution.split(' ')[0]);
    return spectralResValue?.toString();
  };

  const getParamZoom = (): CalculateMidZoomQuery => {
    const bandwidthValueUnit = getZoomBandwidthValueUnit();
    return {
      rx_band: `Band ${getBandNumber(observation.observingBand)}`,
      subarray_configuration: getSubArray(),
      freq_centres_hz: convertFrequency(
        observation.centralFrequency,
        observation.centralFrequencyUnits
      ),
      pointing_centre: rightAscension() + ' ' + declination(),
      pwv: observation.weather?.toString(),
      el: observation.elevation?.toString(),
      spectral_resolutions_hz: getSpectralResolution(),
      total_bandwidths_hz: convertFrequency(bandwidthValueUnit[0], bandwidthValueUnit[1])
    };
  };

  const getParamContinuum = (): CalculateMidContinuumQuery => {
    return {
      rx_band: `Band ${getBandNumber(observation.observingBand)}`,
      subarray_configuration: getSubArray(),
      freq_centre_hz: convertFrequency(
        observation.centralFrequency,
        observation.centralFrequencyUnits
      ),
      bandwidth_hz: convertFrequency(
        observation.continuumBandwidth,
        observation.continuumBandwidthUnits
      ),
      spectral_averaging_factor: observation.spectralAveraging,
      pointing_centre: rightAscension() + ' ' + declination(),
      pwv: observation.weather?.toString(),
      el: observation.elevation?.toString(),
      n_subbands: observation.numSubBands?.toString()
    };
  };

  const getSuppliedSensitivityUnits = () => {
    const suppliedSensitivityUnits = OBSERVATION.Supplied.find(
      item => item.value === SUPPLIED_TYPE_SENSITIVITY
    ).units;
    const units = suppliedSensitivityUnits.find(item => item.value === observation.supplied.units)
      .label;
    return units;
  };

  const getSBSConvFactor = () => {
    return inMode === TYPE_CONTINUUM
      ? weightingResponse?.sbs_conv_factor
      : weightingResponse[0]?.sbs_conv_factor;
  };

  const getSensitivityJy = () => {
    const selectedUnit = getSuppliedSensitivityUnits();
    /* handles conversion to Jy */
    const sensitivityJy = sensCalHelpers.format.convertSensitivityToJy(
      observation.supplied.value,
      selectedUnit
    );
    /* additional step to handle conversion from K/mK/uK conversion to Jy */
    const sbs_conv_factor = getSBSConvFactor();
    return sensCalHelpers.format.sensitivityOnUnit(selectedUnit, sensitivityJy, sbs_conv_factor);
  };

  const getConfusionNoise = () => {
    return inMode === TYPE_CONTINUUM
      ? weightingResponse?.confusion_noise.value
      : weightingResponse[0]?.confusion_noise.value;
  };

  const getWeightingFactor = () => {
    return inMode === TYPE_CONTINUUM
      ? weightingResponse.weighting_factor
      : weightingResponse[0]?.weighting_factor;
  };

  const getThermalSensitivity = () => {
    const sensitivityJy = getSensitivityJy();
    const confusionNoise = getConfusionNoise();
    const weightingFactor = getWeightingFactor();
    const thermalSensitivity = sensCalHelpers.calculate.thermalSensitivity(
      sensitivityJy,
      confusionNoise,
      weightingFactor
    );
    return thermalSensitivity.toString();
  };

  const getSensitivityJYSpelling = () => {
    return isZoom() ? 'sensitivities_jy' : 'sensitivity_jy';
  };

  function mapQueryCalculateMid(): URLSearchParams {
    const params = isZoom() ? getParamZoom() : getParamContinuum();
    helpers.transform.trimObject(params);
    const urlSearchParams = new URLSearchParams();

    if (SUPPLIED_IS_SENSITIVITY) {
      const sensitivityJYParamName = getSensitivityJYSpelling();
      urlSearchParams.append(sensitivityJYParamName, getThermalSensitivity());
    } else {
      const iTimeUnits: string = sensCalHelpers.format.getIntegrationTimeUnitsLabel(
        observation.supplied.units
      );
      const iTime = sensCalHelpers.format.convertIntegrationTimeToSeconds(
        Number(observation.supplied.value),
        iTimeUnits
      );
      urlSearchParams.append('integration_time_s', iTime?.toString());
    }

    for (let key in params) urlSearchParams.append(key, params[key]);
    return urlSearchParams;
  }

  /*********************************************************** LOW *********************************************************/

  const getParamContinuumLow = (): CalculateLowContinuumQuery => {
    return {
      subarray_configuration: getSubArray(),
      integration_time_h: Number(observation.supplied.value),
      pointing_centre: rightAscension() + ' ' + declination(),
      elevation_limit: observation.elevation?.toString(),
      freq_centre_mhz: observation.centralFrequency.toString(),
      spectral_averaging_factor: observation.spectralAveraging,
      bandwidth_mhz: sensCalHelpers.format.convertBandwidthToMHz(
        observation.continuumBandwidth,
        sensCalHelpers.map.getFrequencyAndBandwidthUnits(
          observation.continuumBandwidthUnits,
          observation.telescope
        )
      ), // low continuum bandwidth should be sent in MH
      n_subbands: observation.numSubBands?.toString()
    };
  };

  const getParamZoomLow = (): CalculateLowZoomQuery => {
    const bandwidthValueUnit: string[] = getZoomBandwidthValueUnit();
    return {
      subarray_configuration: getSubArray(),
      integration_time_h: Number(observation.supplied.value),
      pointing_centre: rightAscension() + ' ' + declination(),
      elevation_limit: observation.elevation?.toString(),
      freq_centres_mhz: observation.centralFrequency.toString(),
      spectral_averaging_factor: observation.spectralAveraging,
      spectral_resolutions_hz: getSpectralResolution(),
      total_bandwidths_khz: sensCalHelpers.format.convertBandwidthToKHz(
        bandwidthValueUnit[0],
        bandwidthValueUnit[1]
      ) // low zoom bandwidth should be sent in kHz
    };
  };

  function mapQueryCalculateLow(): URLSearchParams {
    const params = isContinuum() ? getParamContinuumLow() : getParamZoomLow();
    const urlSearchParams = new URLSearchParams();
    for (let key in params) urlSearchParams.append(key, params[key]);
    return urlSearchParams;
  }

  /*************************************************************************************************************************/

  const getQueryParams = () => (isLow() ? mapQueryCalculateLow() : mapQueryCalculateMid());

  const getPath = () =>
    `${apiUrl}${getTelescope()}/${getMode()}${URL_CALCULATE}?${getQueryParams()}`;

  const getLowCalculate = () =>
    observation.type ? MockResponseLowCalculate : MockResponseLowCalculateZoom;
  const getMidCalculate = () =>
    observation.type ? MockResponseMidCalculate : MockResponseMidCalculateZoom;

  if (USE_LOCAL_DATA_SENSITIVITY_CALC) {
    return isLow() ? getLowCalculate() : getMidCalculate();
  }

  try {
    const result = await axios.get(getPath(), AXIOS_CONFIG);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result;
  } catch (e) {
    const errorObject = {
      title: e.response?.data?.title,
      detail: e.response?.data?.detail
    };
    return { error: errorObject };
  }
}

export default GetCalculate;
