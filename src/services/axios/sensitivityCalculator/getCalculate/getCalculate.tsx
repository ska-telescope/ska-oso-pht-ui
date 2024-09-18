import axios from 'axios';
import {
  AXIOS_CONFIG,
  OBSERVATION_TYPE_BACKEND,
  OBSERVATION,
  SKA_SENSITIVITY_CALCULATOR_API_URL,
  TYPE_CONTINUUM,
  USE_LOCAL_DATA_SENSITIVITY_CALC,
  TELESCOPE_LOW_NUM,
  TYPE_ZOOM
} from '../../../../utils/constants';
import { MockResponseMidCalculateZoom, MockResponseMidCalculate } from './mockResponseMidCalculate';
import { MockResponseLowCalculate, MockResponseLowCalculateZoom } from './mockResponseLowCalculate';
import Observation from '../../../../utils/types/observation';
import sensCalHelpers from '../sensCalHelpers';
import { TELESCOPE_LOW, TELESCOPE_MID } from '@ska-telescope/ska-gui-components';
import Target from '../../../../utils/types/target';
import { helpers } from '../../../../utils/helpers';

const URL_CALCULATE = `calculate`;

async function GetCalculate(
  observation: Observation,
  target: Target,
  weightingResponse: any,
  inMode: number
) {
  // TODO create propoer type for weightingResponse
  console.log('::: HEY in GetCalculate - weightingResponse', weightingResponse);
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
    return target.ra
      .replace('+', '')
      .replace('-', '')
      .replace(' ', '');
  }

  function declination() {
    return target.dec
      .replace('+', '')
      .replace('-', '')
      .replace(' ', '');
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
    const spectralResValue = observation.spectralResolution.includes('kHz')
      ? Number(observation.spectralResolution.split(' ')[0]) * 1000
      : Number(observation.spectralResolution.split(' ')[0]);
    return spectralResValue?.toString();
  };

  const getParamZoom = () => {
    const bandwidthValueUnit = getZoomBandwidthValueUnit();
    return {
      rx_band: `Band ${getBandNumber(observation.observingBand)}`, // MANDATORY
      subarray_configuration: getSubArray(),
      // n_ska
      // n_meer
      freq_centres_hz: [
        convertFrequency(observation.centralFrequency, observation.centralFrequencyUnits)
      ], // MANDATORY
      bandwidth_hz: convertFrequency(bandwidthValueUnit[0], bandwidthValueUnit[1]), // MANDATORY
      // spectral_averaging_factor
      pointing_centre: rightAscension() + ' ' + declination(), // MANDATORY
      pwv: observation.weather?.toString(),
      el: observation.elevation?.toString(),
      spectral_resolutions_hz: getSpectralResolution(), // MANDATORY,
      total_bandwidths_hz: sensCalHelpers.format.convertBandwidthToHz(bandwidthValueUnit[0], 2),
      n_subbands: observation.numSubBands?.toString()
      // subband_sensitivities_jy
      // eta_system
      // eta_pointing
      // eta_coherence
      // eta_digitisation
      // eta-correlation
      // eta_bandpass
      // t_sys_ska
      // t_rx_ska
      // t_spl_ska
      // t_sys_meer
      // t_rx_meer
      // t_spl_meer
      // t_sky_ska
      // t_gal_ska
      // t_gal_meer
      // alpha
      // eta_meer
      // eta_ska
    };
  };

  const getParamContinuum = () => {
    return {
      rx_band: `Band ${getBandNumber(observation.observingBand)}`, // MANDATORY
      subarray_configuration: getSubArray(),
      // n_ska
      // n_meer
      freq_centre_hz: convertFrequency(
        observation.centralFrequency,
        observation.centralFrequencyUnits
      ), // MANDATORY
      bandwidth_hz: convertFrequency(
        observation.continuumBandwidth,
        observation.continuumBandwidthUnits
      ), // MANDATORY
      // spectral_averaging_factor
      pointing_centre: rightAscension() + ' ' + declination(), // MANDATORY
      pwv: observation.weather?.toString(),
      el: observation.elevation?.toString(),
      n_subbands: observation.numSubBands?.toString()
      // subband_sensitivities_jy
      // eta_system
      // eta_pointing
      // eta_coherence
      // eta_digitisation
      // eta-correlation
      // eta_bandpass
      // t_sys_ska
      // t_rx_ska
      // t_spl_ska
      // t_sys_meer
      // t_rx_meer
      // t_spl_meer
      // t_sky_ska
      // t_gal_ska
      // t_gal_meer
      // alpha
      // eta_meer
      // eta_ska
    };
  };

  const getThermalSensitivity = () => {
    console.log('::: HEY in getThermalSensitivity');
    console.log('::: HEY weightingResponse', weightingResponse);
    console.log('HEY inMode', inMode);
    const confusionNoise =
      inMode === TYPE_CONTINUUM
        ? weightingResponse?.confusion_noise.value
        : weightingResponse[0]?.confusion_noise.value;
    const weightingFactor =
      inMode === TYPE_CONTINUUM
        ? weightingResponse.weighting_factor
        : weightingResponse[0]?.weighting_factor;
    const thermalSensitivity = sensCalHelpers.calculate.thermalSensitivity(
      observation.supplied.value,
      confusionNoise,
      weightingFactor
    );
    console.log('HEY thermalSensitivity', thermalSensitivity);
    return observation.supplied.value.toString();
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

  interface ModeSpecificParametersLow {
    bandwidth_mhz?: number;
    spectral_averaging_factor?: string;
    spectral_resolution_hz?: string;
    total_bandwidth_khz?: number;
    n_subbands?: string;
  }

  // TODO double check observation parameters passed in observation form as some values seem off (spectral resolution always 1? tapering always 1? -> keys mapping?)

  function mapQueryCalculateLow(): URLSearchParams {
    let mode_specific_parameters: ModeSpecificParametersLow = {};
    if (isContinuum()) {
      mode_specific_parameters.bandwidth_mhz = sensCalHelpers.format.convertBandwidthToMHz(
        observation.continuumBandwidth,
        sensCalHelpers.map.getFrequencyAndBandwidthUnits(
          observation.continuumBandwidthUnits,
          observation.telescope
        )
      ); // low continuum bandwidth should be sent in MH
      mode_specific_parameters.spectral_averaging_factor = observation.spectralAveraging?.toString();
      mode_specific_parameters.n_subbands = observation.numSubBands?.toString();
    } else {
      mode_specific_parameters.spectral_resolution_hz = getSpectralResolution();

      const bandwidthValueUnit: string[] = getZoomBandwidthValueUnit();
      mode_specific_parameters.total_bandwidth_khz = sensCalHelpers.format.convertBandwidthToKHz(
        bandwidthValueUnit[0],
        bandwidthValueUnit[1]
      ); // low zoom bandwidth should be sent in KHz
    }
    const params = {
      subarray_configuration: getSubArray(),
      integration_time_h: Number(observation.supplied.value),
      pointing_centre: rightAscension() + ' ' + declination(),
      elevation_limit: observation.elevation?.toString(),
      freq_centre_mhz: observation.centralFrequency.toString(),
      spectral_averaging_factor: observation.spectralAveraging,
      ...mode_specific_parameters
    };
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
