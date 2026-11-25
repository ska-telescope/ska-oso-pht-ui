import Observation from '@utils/types/observation.tsx';
import GroupObservation from '@utils/types/groupObservation.tsx';
import { ValueUnitPair } from '@utils/types/valueUnitPair.tsx';
import TargetObservation from '@utils/types/targetObservation.tsx';
import {
  FREQUENCY_UNITS,
  DETAILS,
  PROPOSAL_STATUS,
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
import { DocumentPDF } from '@utils/types/document.tsx';
import Proposal, { ProposalBackend } from '@utils/types/proposal.tsx';
import { getUserId } from '@utils/aaa/aaaUtils.tsx';
import { OSD_CONSTANTS } from '@utils/OSDConstants.ts';
import { getBandwidthZoom, helpers } from '@/utils/helpers';
import { referenceCoordinateToPdm, targetsToPdm } from '@/models/proposals/targets';
import { targetObservationToPdm } from '@/models/proposals/targetObservation';
import { savedDataProductsAndLinks } from '@/models/proposals/dataProducts';
import { calibrationStrategyToPdm } from '@/models/proposals/calibrationStrategy';
import { investigatorToPdm } from '@/models/proposals/team';
import type {
  Document as DocumentTransport,
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

// const isZoom = (type: number) => type === TYPE_ZOOM;
const getDocuments = (
  sciencePDF: DocumentPDF | null,
  technicalPDF: DocumentPDF | null
): DocumentTransport[] => {
  const documents: DocumentTransport[] = [];
  if (sciencePDF) {
    documents.push({
      document_id: sciencePDF.documentId as string,
      uploaded_pdf: sciencePDF.isUploadedPdf
    });
  }
  if (technicalPDF) {
    documents.push({
      document_id: technicalPDF.documentId as string,
      uploaded_pdf: technicalPDF.isUploadedPdf
    });
  }
  return documents;
};

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
        effective_resolution: obs.effectiveResolution,
        number_of_channels: obs.zoomChannels?.toString()
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

const getObservationsSets = (
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

/*************************************************************************************************************************/

export default function MappingPutProposal(proposal: Proposal, status: string) {
  const userId = getUserId();
  // The same data products and links as a save from the form (see mapFormToPdm)
  const saved = savedDataProductsAndLinks(
    proposal.dataProducts ?? [],
    (proposal.targetObservation ?? []) as TargetObservation[]
  );

  const transformedProposal: ProposalBackend = {
    prsl_id: proposal?.id,
    status: status as ProposalBackend['status'],
    submitted_on: status === PROPOSAL_STATUS.SUBMITTED ? new Date().toISOString() : null, // note: null since oso-services 1.1.0  does not support ''
    submitted_by: status === PROPOSAL_STATUS.SUBMITTED ? userId : '',
    investigator_refs: proposal.investigators?.map((investigator) => {
      return investigator?.id?.toString();
    }),
    cycle: proposal.cycle as string,
    proposal_info: {
      title: proposal.title,
      proposal_type: {
        main_type: proposal.proposalType as string,
        attributes: proposal.proposalSubType ?? []
      },
      abstract: proposal.abstract as string,
      science_category: DETAILS.ScienceCategory?.find(
        (category) => category.value === proposal?.scienceCategory
      )?.label as string,
      investigators: proposal?.investigators
        ? proposal.investigators.map((investigator) =>
            investigatorToPdm({ ...investigator, id: investigator?.id?.toString() })
          )
        : (null as unknown as undefined) // still sent as null; the PDM type has no null here
    },
    observation_info: {
      targets: targetsToPdm(proposal?.targets ? proposal.targets : []),
      documents: getDocuments(proposal.sciencePDF, proposal.technicalPDF),
      observation_sets: getObservationsSets(proposal.observations, proposal.groupObservations),
      calibration_strategy:
        proposal.calibrationStrategy && proposal.calibrationStrategy.length > 0
          ? calibrationStrategyToPdm(proposal.calibrationStrategy)
          : [],
      data_product_sdps: saved.dataProducts,
      result_details: targetObservationToPdm(saved.links)
    }
  };
  helpers.transform.trimObject(transformedProposal);
  return transformedProposal;
}
