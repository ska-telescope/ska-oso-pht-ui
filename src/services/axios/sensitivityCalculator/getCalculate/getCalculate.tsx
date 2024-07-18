import axios from 'axios';
import {
  AXIOS_CONFIG,
  OBSERVATION_TYPE_BACKEND,
  OBSERVATION,
  SKA_SENSITIVITY_CALCULATOR_API_URL,
  TYPE_CONTINUUM,
  USE_LOCAL_DATA_SENSITIVITY_CALC,
  TELESCOPE_LOW_NUM,
  OBSERVATION_TYPE_SENSCALC,
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

async function GetCalculate(observation: Observation, target: Target) {
  const apiUrl = SKA_SENSITIVITY_CALCULATOR_API_URL;

  const SUPPLIED_IS_SENSITIVITY = observation?.supplied?.type === 2 ? true : false;

  const getTelescope = () =>
    observation.telescope === TELESCOPE_LOW_NUM ? TELESCOPE_LOW.code : TELESCOPE_MID.code;

  const getMode = () =>
    observation.telescope === TELESCOPE_LOW_NUM
      ? OBSERVATION_TYPE_BACKEND[observation.type].toLowerCase() + '/'
      : '';

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
    const telescopeBandwidthValues = OBSERVATION.array.find(
      item => item.value === observation.telescope
    ).bandWidth;
    const bandWidthValue = telescopeBandwidthValues.find(
      item => item.value === observation?.bandwidth
    )?.label;
    return bandWidthValue?.split(' ');
  }

  /*
  const getFrequencyAndBandwidthUnits = (unitsField) => {
    const array = OBSERVATION.array.find(item => item.value === observation.telescope);
    let units = array.CentralFrequencyAndBandWidthUnits.find(item => item.value === unitsField)?.label;
    return units;
  }
    */

  /*********************************************************** MID *********************************************************/

  interface ModeSpecificParametersMid {
    n_subbands?: string;
    resolution?: string;
    zoom_frequencies?: string;
    zoom_resolutions?: string;
  }

  function mapQueryCalculateMid(): URLSearchParams {
    let mode_specific_parameters: ModeSpecificParametersMid = {};
    if (observation.type === TYPE_CONTINUUM) {
      mode_specific_parameters.n_subbands = observation.numSubBands?.toString();
      console.log(observation.spectralResolution);
      mode_specific_parameters.resolution = (
        Number(observation.spectralResolution.split(' ')[0]) * 1000
      ).toString(); // resolution should be sent in Hz
    } else {
      mode_specific_parameters.zoom_frequencies = sensCalHelpers.format
        .convertFrequencyToHz(
          observation.centralFrequency,
          sensCalHelpers.map.getFrequencyAndBandwidthUnits(
            observation.centralFrequencyUnits,
            observation.telescope
          )
        )
        .toString();
      // convert Khz to Hz as effective Resolution should be sent in Hz
      const effectiveResMultiplier = String(observation.effectiveResolution).includes('kHz')
        ? 1000
        : 1;
      mode_specific_parameters.zoom_resolutions = (
        Number(observation.effectiveResolution.split(' ')[0]) * effectiveResMultiplier
      ).toString();
    }

    const weighting = OBSERVATION.ImageWeighting.find(
      obj => obj.value === observation.imageWeighting
    );
    const iTimeUnits: string = sensCalHelpers.format.getIntegrationTimeUnitsLabel(
      observation.supplied.units
    );
    const iTime = sensCalHelpers.format.convertIntegrationTimeToSeconds(
      Number(observation.supplied.value),
      iTimeUnits
    );

    const bandwidthValueUnit: string[] = getZoomBandwidthValueUnit(); // only for zoom
    const params = {
      rx_band: `Band ${observation.observingBand}`,
      ra_str: rightAscension(),
      dec_str: declination(),
      array_configuration: getSubArray(),
      pwv: observation.weather?.toString(),
      el: observation.elevation?.toString(),
      frequency: sensCalHelpers.format
        .convertFrequencyToHz(
          observation.centralFrequency,
          sensCalHelpers.map.getFrequencyAndBandwidthUnits(
            observation.centralFrequencyUnits,
            observation.telescope
          )
        )
        .toString(),
      bandwidth: sensCalHelpers.format.convertBandwidthToHz(
        observation.type === TYPE_ZOOM ? bandwidthValueUnit[0] : observation.continuumBandwidth,
        observation.type === TYPE_ZOOM
          ? bandwidthValueUnit[1]
          : sensCalHelpers.map.getFrequencyAndBandwidthUnits(
              observation.continuumBandwidthUnits,
              observation.telescope
            )
      ), // mid zoom and mid continuum bandwidth should be sent in Hz
      resolution: '0',
      weighting: weighting?.label.toLowerCase(),
      calculator_mode: OBSERVATION_TYPE_SENSCALC[observation.type],
      taper:
        observation.tapering === 'No tapering'
          ? 0
          : observation.tapering.replace('"', '').replace(' ', ''),
      integration_time: SUPPLIED_IS_SENSITIVITY ? undefined : iTime?.toString(),
      // TODO convert sensitivity to units expected by the sens calc (check logic in sens calc)
      sensitivity: !SUPPLIED_IS_SENSITIVITY ? undefined : observation.supplied.value,
      ...mode_specific_parameters
    };
    helpers.transform.trimObject(params);
    const urlSearchParams = new URLSearchParams();
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

  function pointingCentre() {
    return rightAscension() + ' ' + declination();
  }

  function mapQueryCalculateLow(): URLSearchParams {
    let mode_specific_parameters: ModeSpecificParametersLow = {};
    if (observation.type === TYPE_CONTINUUM) {
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
      const spectralResValue = observation.spectralResolution.includes('kHz')
        ? Number(observation.spectralResolution.split(' ')[0]) * 1000
        : Number(observation.spectralResolution.split(' ')[0]);
      mode_specific_parameters.spectral_resolution_hz = spectralResValue?.toString();

      const bandwidthValueUnit: string[] = getZoomBandwidthValueUnit();
      mode_specific_parameters.total_bandwidth_khz = sensCalHelpers.format.convertBandwidthToKHz(
        bandwidthValueUnit[0],
        bandwidthValueUnit[1]
      ); // low zoom bandwidth should be sent in KHz
    }
    const integrationTimeUnits: string = sensCalHelpers.format.getIntegrationTimeUnitsLabel(
      observation.supplied.units
    );

    const params = {
      subarray_configuration: getSubArray(),
      duration: sensCalHelpers.format
        .convertIntegrationTimeToSeconds(Number(observation.supplied.value), integrationTimeUnits)
        ?.toString(),
      pointing_centre: pointingCentre(),
      freq_centre: observation.centralFrequency.toString(),
      elevation_limit: observation.elevation?.toString(),
      ...mode_specific_parameters
    };
    const urlSearchParams = new URLSearchParams();
    for (let key in params) urlSearchParams.append(key, params[key]);

    return urlSearchParams;
  }

  /*************************************************************************************************************************/

  const getQueryParams = () => {
    return observation.telescope === TELESCOPE_LOW_NUM
      ? mapQueryCalculateLow()
      : mapQueryCalculateMid();
  };

  const getMockData = () => {
    if (observation.telescope === TELESCOPE_LOW_NUM) {
      return observation.type ? MockResponseLowCalculate : MockResponseLowCalculateZoom;
    }
    return observation.type ? MockResponseMidCalculate : MockResponseMidCalculateZoom;
  };

  if (USE_LOCAL_DATA_SENSITIVITY_CALC) {
    return getMockData();
  }

  try {
    const path = `${apiUrl}${getTelescope()}/${getMode()}${URL_CALCULATE}?${getQueryParams()}`;
    const result = await axios.get(path, AXIOS_CONFIG);
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
