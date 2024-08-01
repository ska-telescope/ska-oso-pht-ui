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

async function GetCalculate(observation: Observation, target: Target) {
  const isLow = () => observation.telescope === TELESCOPE_LOW_NUM;
  const isZoom = () => observation.type === TYPE_ZOOM;
  const isContinuum = () => observation.type === TYPE_CONTINUUM;

  const getTelescope = () => (isLow() ? TELESCOPE_LOW.code : TELESCOPE_MID.code);
  const getMode = () => OBSERVATION_TYPE_BACKEND[observation.type].toLowerCase() + '/';

  const getBandwidthValues = () =>
    OBSERVATION.array.find(item => item.value === observation.telescope).bandWidth;
  //const getWeighting = () =>
  //  OBSERVATION.ImageWeighting.find(item => item.value === observation.imageWeighting);

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

  /*
  const getFrequencyAndBandwidthUnits = (unitsField) => {
    const array = OBSERVATION.array.find(item => item.value === observation.telescope);
    let units = array.centralFrequencyAndBandWidthUnits.find(item => item.value === unitsField)?.label;
    return units;
  }
    */

  /*********************************************************** MID *********************************************************/

  //interface ModeSpecificParametersMid {
  //  n_subbands?: string;
  //  resolution?: string;
  //  zoom_frequencies?: string;
  //  zoom_resolutions?: string;
  //}

  function mapQueryCalculateMid(): URLSearchParams {
    /*
    if (isContinuum()) {
      mode_specific_parameters.n_subbands = observation.numSubBands?.toString();
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
    */

    const bandwidthValueUnit: string[] = getZoomBandwidthValueUnit();
    const convertFrequency = (value: number | string, units: number | string) =>
      sensCalHelpers.format.convertBandwidthToHz(value, units);

    let params = null;
    if (isZoom()) {
      params = {
        rx_band: `Band ${observation.observingBand}`, // MANDATORY
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
        // spectral_averaging_factor
        spectral_resolutions_hz: 13440, // TODO
        total_bandwidths_hz: 200000000, // TODO
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
    } else {
      params = {
        rx_band: `Band ${observation.observingBand}`, // MANDATORY
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
    }
    /*


      ra_str: rightAscension(),
      dec_str: declination(),


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
        isZoom() ? bandwidthValueUnit[0] : observation.continuumBandwidth,
        isZoom()
          ? bandwidthValueUnit[1]
          : sensCalHelpers.map.getFrequencyAndBandwidthUnits(
              observation.continuumBandwidthUnits,
              observation.telescope
            )
      ), // mid zoom and mid continuum bandwidth should be sent in Hz
      resolution: '0',
      weighting: getWeighting()?.label.toLowerCase(),
      calculator_mode: OBSERVATION_TYPE_SENSCALC[observation.type],
      taper: observation.tapering, // TODO : Need to check the mapping
      integration_time: SUPPLIED_IS_SENSITIVITY ? undefined : iTime?.toString(),
      // TODO convert sensitivity to units expected by the sens calc (check logic in sens calc)
      sensitivity: !SUPPLIED_IS_SENSITIVITY ? undefined : observation.supplied.value,
      */

    helpers.transform.trimObject(params);
    const urlSearchParams = new URLSearchParams();

    if (SUPPLIED_IS_SENSITIVITY) {
      urlSearchParams.append('sensitivity_jy', observation.supplied.value.toString());
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
      // TODO handle sensitivity?
      observation.supplied.units
    );
    const params = {
      subarray_configuration: getSubArray(),
      // LOW should always use integration time in supplied
      duration: sensCalHelpers.format
        .convertIntegrationTimeToSeconds(Number(observation.supplied.value), integrationTimeUnits)
        ?.toString(),
      pointing_centre: rightAscension() + ' ' + declination(),
      freq_centre: observation.centralFrequency.toString(),
      elevation_limit: observation.elevation?.toString(),
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
