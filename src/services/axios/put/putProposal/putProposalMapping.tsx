import Observation from '@utils/types/observation.tsx';
import GroupObservation from '@utils/types/groupObservation.tsx';
import { ValueUnitPair } from '@utils/types/valueUnitPair.tsx';
import TargetObservation from '@utils/types/targetObservation.tsx';
import {
  DETECTED_FILTER_BANK_VALUE,
  DP_TYPE_IMAGES,
  DP_TYPE_VISIBLE,
  FREQUENCY_UNITS,
  DETAILS,
  IMAGE_WEIGHTING,
  IW_BRIGGS,
  PROPOSAL_STATUS,
  PST_MODES,
  PULSAR_TIMING_VALUE,
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
import {
  DataProductSDPNew,
  DataProductSRC,
  SDPFilterbankPSTData,
  SDPFlowthroughPSTData,
  SDPImageContinuumData,
  SDPSpectralData,
  SDPVisibilitiesContinuumData
} from '@utils/types/dataProduct.tsx';
import { DocumentPDF } from '@utils/types/document.tsx';
import Proposal, { ProposalBackend } from '@utils/types/proposal.tsx';
import { getUserId } from '@utils/aaa/aaaUtils.tsx';
import { OSD_CONSTANTS } from '@utils/OSDConstants.ts';
import { getBandwidthZoom, helpers } from '@/utils/helpers';
import { referenceCoordinateToPdm, targetsToPdm } from '@/models/proposals/targets';
import {
  getSuppliedFieldsIntegrationTime,
  targetObservationToPdm
} from '@/models/proposals/targetObservation';
import { calibrationStrategyToPdm } from '@/models/proposals/calibrationStrategy';
import type {
  ContinuumVisibilities,
  DataProductSDP as DataProductSDPTransport,
  DataProductSRC as DataProductSRCTransport,
  Document as DocumentTransport,
  LowArray,
  MidArray,
  ObservationSets,
  Polarisation,
  ScriptParameters,
  Supplied as SuppliedTransport,
  Weighting
} from '@/generated/models';

const isContinuum = (type: string) => type === TYPE_CONTINUUM || type === TYPE_CONTINUUM_SPECTRAL;
const isPST = (type: string) => type === TYPE_PST;

// The slice mappers now hold these; the names stay for existing callers
export const getReferenceCoordinate = referenceCoordinateToPdm;
export const getTargets = targetsToPdm;
export const mapCalibrationStrategyToBackend = calibrationStrategyToPdm;
export { getSuppliedFieldsIntegrationTime };

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

/**
 * Maps a data product to the backend's script_parameters shape for its observation's type.
 */
export const getDataProductScriptParameters = (
  obs: Observation[] | null,
  dp: DataProductSDPNew
): ScriptParameters => {
  const IMAGE_SIZE_UNITS = ['deg', 'arcmin', 'arcsec'];
  const getWeight = (data: SDPImageContinuumData | SDPSpectralData): Weighting => ({
    weighting: IMAGE_WEIGHTING.find((item) => item.value === Number(data?.weighting))
      ?.label as Weighting['weighting'],
    ...(Number(data?.weighting) === IW_BRIGGS && {
      robust: data?.robust != null ? Number(data?.robust) : undefined
    })
  });
  const getVisibilities = (
    data: SDPVisibilitiesContinuumData
  ): ContinuumVisibilities & { variant: 'visibilities' } => ({
    time_averaging: data?.timeAveraging ?? 0,
    frequency_averaging: data?.frequencyAveraging ?? 0,
    kind: 'continuum',
    variant: 'visibilities'
  });
  const obType = obs?.find((o) => o?.id === dp.observationId)?.type;
  switch (obType) {
    case TYPE_CONTINUUM: {
      if (
        (dp?.data as SDPImageContinuumData | SDPVisibilitiesContinuumData)?.dataProductType ===
        DP_TYPE_IMAGES
      ) {
        const data = dp?.data as SDPImageContinuumData;
        return {
          image_size: { value: data?.imageSizeValue, unit: IMAGE_SIZE_UNITS[data?.imageSizeUnits] },
          image_cellsize: {
            value: data?.pixelSizeValue,
            unit: IMAGE_SIZE_UNITS[data?.pixelSizeUnits]
          },
          weight: getWeight(data),
          polarisations: data?.polarisations as Polarisation[],
          channels_out: data?.channelsOut,
          gaussian_taper: data?.taperValue,
          kind: 'continuum',
          variant: 'continuum image'
        };
      } else {
        return getVisibilities(dp?.data as SDPVisibilitiesContinuumData);
      }
    }
    case TYPE_ZOOM:
    case TYPE_CONTINUUM_SPECTRAL: {
      // Both modes also produce a hidden visibilities data product (see HiddenSDPData in
      // AutoLinking.tsx) - the backend only has one "visibilities" script-parameters shape
      // (kind: continuum / variant: visibilities), regardless of the mode that created it.
      if ((dp?.data as SDPVisibilitiesContinuumData)?.dataProductType === DP_TYPE_VISIBLE) {
        return getVisibilities(dp?.data as SDPVisibilitiesContinuumData);
      }
      const data = dp?.data as SDPSpectralData;
      const common = {
        image_size: { value: data?.imageSizeValue, unit: IMAGE_SIZE_UNITS[data?.imageSizeUnits] },
        image_cellsize: {
          value: data?.pixelSizeValue,
          unit: IMAGE_SIZE_UNITS[data?.pixelSizeUnits]
        },
        weight: getWeight(data),
        polarisations: (data?.polarisations ?? []) as Polarisation[],
        channels_out: data?.channelsOut ?? 0,
        gaussian_taper: data?.taperValue ?? 0
      };
      if (obType === TYPE_CONTINUUM_SPECTRAL) {
        return {
          ...common,
          kind: TYPE_CONTINUUM_SPECTRAL_LONG,
          variant: 'continuum and spectral line image'
        };
      }
      return {
        ...common,
        kind: 'spectral',
        variant: 'spectral image',
        continuum_subtraction: data?.continuumSubtraction
      };
    }
    case TYPE_PST:
    default:
      const pstMode = obs?.find((o) => o?.id === dp.observationId)?.pstMode;
      if (pstMode === DETECTED_FILTER_BANK_VALUE) {
        const data = dp?.data as SDPFilterbankPSTData;
        return {
          polarisations: data?.polarisations as Polarisation[],
          bit_depth: Number(data?.bitDepth),
          output_frequency_resolution: data?.outputFrequencyResolution ?? 0,
          output_sampling_interval: data?.outputSamplingInterval ?? 0,
          dispersion_measure: data?.dispersionMeasure ?? 0,
          rotation_measure: data?.rotationMeasure ?? 0,
          kind: 'pst',
          variant: 'detected filterbank'
        };
      } else if (pstMode === PULSAR_TIMING_VALUE) {
        return {
          kind: 'pst',
          variant: 'pulsar timing'
        };
      } else {
        const data = dp?.data as SDPFlowthroughPSTData;
        return {
          polarisations: data?.polarisations as Polarisation[],
          bit_depth: data?.bitDepth ?? 1,
          kind: 'pst',
          variant: 'flow through'
        };
      }
  }
};

const getDataProductSDP = (
  obs: Observation[] | null,
  dataProducts: DataProductSDPNew[]
): DataProductSDPTransport[] => {
  const sdp = dataProducts?.map((dp) => ({
    data_product_id: dp.id?.toString(),
    observation_set_ref: dp.observationId,
    script_parameters: getDataProductScriptParameters(obs, dp)
  }));
  return sdp;
};

export const getDataProductSRC = (dataProducts: DataProductSRC[]): DataProductSRCTransport[] => {
  return dataProducts?.map((dp) => ({ data_products_src_id: dp?.id }));
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
  const observationSets = getObservationsSets(proposal.observations, proposal.groupObservations);

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
        ? proposal.investigators.map((investigator) => {
            return {
              user_id: investigator?.id?.toString(),
              status: investigator.status,
              given_name: investigator.firstName,
              family_name: investigator.lastName,
              email: investigator.email,
              organization: investigator.affiliation,
              for_phd: investigator.phdThesis,
              principal_investigator: investigator.pi,
              officeLocation: investigator.officeLocation,
              jobTitle: investigator.jobTitle
            };
          })
        : (null as unknown as undefined) // still sent as null; the PDM type has no null here
    },
    observation_info: {
      targets: targetsToPdm(proposal?.targets ? proposal.targets : []),
      documents: getDocuments(proposal.sciencePDF, proposal.technicalPDF),
      observation_sets: observationSets,
      calibration_strategy:
        proposal.calibrationStrategy && proposal.calibrationStrategy.length > 0
          ? calibrationStrategyToPdm(proposal.calibrationStrategy)
          : [],
      data_product_sdps:
        proposal?.dataProductSDP && proposal?.dataProductSDP?.length > 0
          ? getDataProductSDP(
              proposal.observations as Observation[],
              proposal.dataProductSDP as DataProductSDPNew[]
            )
          : [],
      data_product_src_nets:
        proposal?.dataProductSRC && proposal?.dataProductSRC?.length > 0
          ? getDataProductSRC(proposal.dataProductSRC as DataProductSRC[])
          : [],
      result_details: targetObservationToPdm(
        proposal.targetObservation as TargetObservation[],
        observationSets
      )
    }
  };
  helpers.transform.trimObject(transformedProposal);
  return transformedProposal;
}
