import Observation from '@utils/types/observation.tsx';
import GroupObservation from '@utils/types/groupObservation.tsx';
import { ValueUnitPair } from '@utils/types/valueUnitPair.tsx';
import {
  FREQUENCY_UNITS,
  PST_MODES,
  TELESCOPE_LOW_BACKEND_MAPPING,
  TELESCOPE_LOW_NUM,
  TELESCOPE_MID_BACKEND_MAPPING,
  TYPE_CONTINUUM,
  TYPE_CONTINUUM_SPECTRAL,
  TYPE_CONTINUUM_SPECTRAL_LONG,
  TYPE_PST,
  TYPE_ZOOM,
  TYPE_ZOOM_LONG,
  SA_AA4
} from '@utils/constants.ts';
import { OSD_CONSTANTS } from '@utils/OSDConstants.ts';
import { getBandwidthZoom } from '@/utils/helpers';
import { referenceCoordinateToPdm, targetsToPdm } from '@/models/proposals/targets';
import { calibrationStrategyToPdm } from '@/models/proposals/calibrationStrategy';
import type {
  LowArray,
  MidArray,
  ObservationSets,
  Supplied as SuppliedTransport
} from '@/generated/models';

const isContinuum = (type: string) => type === TYPE_CONTINUUM || type === TYPE_CONTINUUM_SPECTRAL;
const isPST = (type: string) => type === TYPE_PST;

// The slice mappers now hold these; the names stay for existing callers
export const getReferenceCoordinate = referenceCoordinateToPdm;
export const getTargets = targetsToPdm;
export const mapCalibrationStrategyToBackend = calibrationStrategyToPdm;

const getGroupObservation = (obsId: string, observationGroups: GroupObservation[] | undefined) => {
  const groupId = observationGroups?.find((group) => group.observationId === obsId)?.groupId ?? '';
  return groupId ? groupId : '';
};

const getObservingBand = (observingBand: string) => observingBand;

const getSubArray = (incSubArray: string, incTelescope: number): string => {
  const array = OSD_CONSTANTS.array.find((a) => a.value === incTelescope);
  const subArray = array?.subarray?.find((sub) => sub.value === incSubArray)?.value;
  return subArray ? subArray : SA_AA4;
};

const getArrayDetails = (incObs: Observation): LowArray | MidArray => {
  if (incObs.telescope === TELESCOPE_LOW_NUM) {
    const lowArrayDetails: LowArray = {
      array: TELESCOPE_LOW_BACKEND_MAPPING,
      subarray: getSubArray(incObs.subarray, incObs.telescope),
      number_of_stations: incObs.numStations
    };
    return lowArrayDetails;
  } else {
    const midArrayDetails: MidArray = {
      array: TELESCOPE_MID_BACKEND_MAPPING,
      subarray: getSubArray(incObs.subarray, incObs.telescope),
      weather: incObs.weather,
      number_15_antennas: incObs.num15mAntennas,
      number_13_antennas: incObs.num13mAntennas,
      number_sub_bands: incObs.numSubBands
    };
    return midArrayDetails;
  }
};

const getFrequencyAndBandwidthUnits = (incUnitValue: number): string => {
  return FREQUENCY_UNITS.find((u) => u.value === incUnitValue)?.mapping as string;
};

const getBandwidthContinuum = (incObs: Observation): ValueUnitPair => {
  return {
    value: incObs.continuumBandwidth as number,
    unit: getFrequencyAndBandwidthUnits(incObs.continuumBandwidthUnits as number)
  };
};

const getBandwidth = (ob: Observation): ValueUnitPair =>
  isContinuum(ob.type) || isPST(ob.type) ? getBandwidthContinuum(ob) : getBandwidthZoom(ob);

const getCentralFrequency = (incObs: Observation): ValueUnitPair => {
  return {
    value: incObs.centralFrequency,
    unit: getFrequencyAndBandwidthUnits(incObs.centralFrequencyUnits)
  };
};

const getSupplied = (inObs: Observation) => {
  const supplied = OSD_CONSTANTS.Supplied.find((s) => s.value === inObs?.supplied?.type);
  return {
    supplied_type: supplied?.mappingLabel,
    quantity: {
      value: inObs.supplied?.value,
      unit: supplied?.units?.find((u) => u.value === inObs?.supplied?.units)?.label
    }
  };
};

/**
 * Maps an observation to the backend's observation_type_details shape for its type.
 */
export const getObservationTypeDetails = (obs: Observation) => {
  switch (obs.type) {
    case TYPE_CONTINUUM:
      return {
        bandwidth: getBandwidth(obs),
        central_frequency: getCentralFrequency(obs),
        supplied: getSupplied(obs) as SuppliedTransport,
        observation_type: TYPE_CONTINUUM
      };
    case TYPE_CONTINUUM_SPECTRAL:
      return {
        bandwidth: getBandwidth(obs),
        central_frequency: getCentralFrequency(obs),
        supplied: getSupplied(obs) as SuppliedTransport,
        observation_type: TYPE_CONTINUUM_SPECTRAL_LONG
      };
    case TYPE_ZOOM:
      return {
        bandwidth: getBandwidth(obs),
        central_frequency: getCentralFrequency(obs),
        supplied: getSupplied(obs) as SuppliedTransport,
        observation_type: TYPE_ZOOM_LONG,
        spectral_resolution: obs.spectralResolution,
        number_of_channels: obs.zoomChannels
      };
    case TYPE_PST:
    default:
      return {
        bandwidth: getBandwidth(obs),
        central_frequency: getCentralFrequency(obs),
        supplied: getSupplied(obs) as SuppliedTransport,
        observation_type: TYPE_PST,
        pst_mode: typeof obs.pstMode !== 'undefined' ? PST_MODES[obs.pstMode].mapping : undefined
      };
  }
};

export const getObservationsSets = (
  incObservationsSets: Observation[] | undefined,
  incObservationGroups: GroupObservation[] | undefined
): ObservationSets[] => {
  const outObservationsSets = [];
  if (incObservationsSets) {
    for (const obs of incObservationsSets) {
      const observation: ObservationSets = {
        observation_set_id: obs?.id,
        group_id: getGroupObservation(obs?.id, incObservationGroups),
        elevation: obs.elevation,
        observing_band: getObservingBand(obs.observingBand) as string,
        array_details: getArrayDetails(obs) as ObservationSets['array_details'],
        observation_type_details: getObservationTypeDetails(
          obs
        ) as unknown as ObservationSets['observation_type_details']
      };
      outObservationsSets.push(observation);
    }
  }
  return outObservationsSets;
};
