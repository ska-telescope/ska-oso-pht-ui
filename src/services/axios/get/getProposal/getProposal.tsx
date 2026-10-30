import { FileUploadStatus } from '@ska-telescope/ska-gui-components';
import Proposal, { ProposalBackend } from '@utils/types/proposal.tsx';
import {
  ReferenceCoordinateGalactic,
  ReferenceCoordinateICRS,
  ReferenceCoordinateSSO
} from '@utils/types/target.tsx';
import Observation from '@utils/types/observation.tsx';
import Supplied from '@utils/types/supplied.tsx';
import {
  SKA_OSO_SERVICES_URL,
  DETAILS,
  TYPE_CONTINUUM,
  TYPE_CONTINUUM_SPECTRAL,
  TYPE_CONTINUUM_SPECTRAL_LONG,
  TYPE_ZOOM,
  TELESCOPE_MID_BACKEND_MAPPING,
  TELESCOPE_LOW_BACKEND_MAPPING,
  SA_AA2,
  FREQUENCY_UNITS,
  OSO_SERVICES_PROPOSAL_PATH,
  PDF_NAME_PREFIXES,
  REFERENCE_COORDINATE_TYPE_ICRS,
  REFERENCE_COORDINATE_TYPE_GALACTIC,
  PROPOSAL_TYPE,
  ProposalSubTypeType,
  ProposalTypeType,
  TYPE_PST,
  PST_MODES,
  DP_TYPE_IMAGES,
  DP_TYPE_VISIBLE,
  IMAGE_WEIGHTING,
  IMAGE_WEIGHTING_DEFAULT,
  ROBUST_DEFAULT,
  FREQUENCY_STR_MHZ,
  BAND_LOW_STR,
  FREQUENCY_STR_GHZ,
  PULSAR_TIMING_VALUE,
  DETECTED_FILTER_BANK_VALUE,
  FLOW_THROUGH_VALUE,
  TYPE_ZOOM_LONG,
  REFERENCE_COORDINATE_TYPE_SSO
} from '@utils/constants.ts';
import { DocumentPDF } from '@utils/types/document.tsx';
import { DataProductSDPNew, DataProductSRC } from '@utils/types/dataProduct.tsx';
import Investigator, { InvestigatorBackend } from '@utils/types/investigator.tsx';
import { OSD_CONSTANTS } from '@utils/OSDConstants.ts';
import { AxiosAuthClient } from '../../axiosAuthClient/axiosAuthClient.ts';
import { targetsFromPdm } from '@/models/proposals/targets';
import { targetObservationFromPdm } from '@/models/proposals/targetObservation';
import { calibrationStrategyFromPdm } from '@/models/proposals/calibrationStrategy';
import type {
  DataProductSDP as DataProductSDPTransport,
  DataProductSRC as DataProductSRCTransport,
  Document as DocumentTransport,
  GalacticCoordinates,
  ICRSCoordinates,
  LowArray,
  MidArray,
  ObservationSets,
  PstSetup,
  Result,
  SpecialCoordinates,
  SpectralLineSetup,
  Supplied as SuppliedTransport
} from '@/generated/models';

export const getInvestigators = (inValue: InvestigatorBackend[] | null | undefined) => {
  const investigators = [] as Investigator[];
  if (!inValue || inValue.length === 0) {
    return investigators;
  }
  for (let i = 0; i < inValue?.length; i++) {
    investigators.push({
      id: inValue[i].user_id as string,
      status: inValue[i].status,
      firstName: inValue[i].given_name as string,
      lastName: inValue[i].family_name as string,
      email: inValue[i]?.email as string,
      affiliation: inValue[i].organization as string,
      phdThesis: inValue[i].for_phd as boolean,
      pi: inValue[i].principal_investigator as boolean,
      officeLocation: inValue[i].officeLocation as string | null,
      jobTitle: inValue[i].jobTitle as string | null
    });
  }
  return investigators;
};

export const getScienceCategory = (scienceCat: string) => {
  const cat = DETAILS.ScienceCategory?.find(
    (c) => c.label.toLowerCase() === scienceCat?.toLowerCase()
  )?.value;
  return cat === null || cat === undefined ? null : cat;
};

const getPDF = (
  documents: DocumentTransport[] | null | undefined,
  documentId: string
): DocumentPDF | null => {
  if (!documents) return null;

  const documentById = documents.find((document) => document.document_id === documentId);

  if (!documentById) return null;

  return {
    documentId: documentById.document_id,
    isUploadedPdf: documentById.uploaded_pdf
  };
};

export const getReferenceCoordinate = (
  tar: ICRSCoordinates | GalacticCoordinates | SpecialCoordinates
): ReferenceCoordinateICRS | ReferenceCoordinateGalactic | ReferenceCoordinateSSO => {
  switch (tar.kind) {
    case REFERENCE_COORDINATE_TYPE_ICRS.label:
      return {
        kind: REFERENCE_COORDINATE_TYPE_ICRS.label,
        raStr: (tar as ICRSCoordinates).ra_str as string,
        decStr: (tar as ICRSCoordinates).dec_str as string,
        pmRa: (tar as ICRSCoordinates).pm_ra as number | undefined,
        pmDec: (tar as ICRSCoordinates).pm_dec as number | undefined,
        epoch: (tar as ICRSCoordinates).epoch,
        parallax: (tar as ICRSCoordinates).parallax as number | undefined
      };

    case REFERENCE_COORDINATE_TYPE_GALACTIC.label:
      return {
        kind: REFERENCE_COORDINATE_TYPE_GALACTIC.label,
        l: (tar as GalacticCoordinates).l,
        b: (tar as GalacticCoordinates).b,
        pmL: (tar as GalacticCoordinates).pm_l,
        pmB: (tar as GalacticCoordinates).pm_b,
        epoch: (tar as GalacticCoordinates).epoch,
        parallax: (tar as GalacticCoordinates).parallax
      };

    case REFERENCE_COORDINATE_TYPE_SSO.label:
      return {
        kind: REFERENCE_COORDINATE_TYPE_SSO.label
      };

    default:
      throw new Error(`Unsupported reference coordinate kind: ${tar.kind}`);
  }
};

const getGroupObservations = (inValue: ObservationSets[] | null | undefined) => {
  const results: any = [];
  if (!inValue || inValue.length === 0) {
    return results;
  }
  for (let i = 0; i < inValue?.length; i++) {
    if (inValue[i].group_id) {
      const observationSetId = inValue[i].observation_set_id;
      const observationId =
        observationSetId && observationSetId.trim() !== '' ? observationSetId : i + 1;
      results.push({
        observationId: observationId,
        groupId: inValue[i].group_id
      });
    }
  }
  return results;
};

const getDataProductSRC = (
  inValue: DataProductSRCTransport[] | null | undefined
): DataProductSRC[] => {
  return inValue
    ? inValue.map((dp) => ({
        id: dp?.data_products_src_id,
        dataProductType: 0,
        observationId: ''
      }))
    : [];
};

// The image/visibilities split is carried on `variant`, not `kind` - `kind` is 'continuum' for
// both a continuum image and its hidden visibilities companion (see getDataProductScriptParameters
// in putProposalMapping.tsx), so switching on kind here could never actually match either of them.
const getDataProductType = (el: any) => {
  switch ((el.variant ?? '').toLowerCase()) {
    case 'visibilities':
      return DP_TYPE_VISIBLE;
    case 'detected filterbank':
      return DETECTED_FILTER_BANK_VALUE;
    case 'pulsar timing':
      return PULSAR_TIMING_VALUE;
    case 'flow through':
      return FLOW_THROUGH_VALUE;
    default:
      return DP_TYPE_IMAGES;
  }
};

/**
 * Marks the data products linked to results as selected. Selection is not stored in the backend,
 * so this keeps it in step with the results and keeps it if the target is later removed.
 */
const markSelectedDataProducts = (
  dataProducts: DataProductSDPNew[],
  results: Result[] | null | undefined
): DataProductSDPNew[] => {
  const linkedIds = new Set((results ?? []).map((result) => result.data_product_ref));
  return dataProducts.map((dp) => (linkedIds.has(dp.id) ? { ...dp, selected: true } : dp));
};

const getDataProductSDP = (
  inValue: DataProductSDPTransport[] | null | undefined
): DataProductSDPNew[] => {
  const IMAGE_SIZE_UNITS = ['deg', 'arcmin', 'arcsec'];
  const PIXEL_SIZE_UNITS = ['deg', 'arcmin', 'arcsec', 'arcsecs'];

  const getImageSizeUnits = (unit: string | null): number =>
    unit ? IMAGE_SIZE_UNITS.indexOf(unit) : 0;

  const getPixelSizeUnits = (unit: string | null): number =>
    unit ? PIXEL_SIZE_UNITS.indexOf(unit) : 0;

  return (
    inValue?.map((dp) => {
      const script = dp?.script_parameters ?? {};
      return {
        id: dp?.data_product_id ?? '',
        observationId: dp?.observation_set_ref ?? '',
        data: {
          dataProductType: getDataProductType(script) ?? 0,
          imageSizeValue: 'image_size' in script ? (script.image_size?.value ?? 0) : 0,
          imageSizeUnits:
            'image_size' in script ? getImageSizeUnits(script.image_size?.unit ?? null) : 0,

          pixelSizeValue: 'image_cellsize' in script ? (script.image_cellsize?.value ?? 0) : 0,
          pixelSizeUnits:
            'image_cellsize' in script ? getPixelSizeUnits(script.image_cellsize?.unit ?? null) : 0,
          weighting:
            getWeighting('weight' in script ? script.weight?.weighting : undefined) ??
            IMAGE_WEIGHTING_DEFAULT,
          robust:
            'weight' in script && script.weight?.weighting === 'briggs'
              ? Number(script.weight.robust ?? ROBUST_DEFAULT)
              : ROBUST_DEFAULT,
          polarisations: 'polarisations' in script ? script.polarisations : undefined,
          channelsOut: 'channels_out' in script ? (Number(script.channels_out) ?? 0) : 0,
          taperValue: 'gaussian_taper' in script ? (Number(script.gaussian_taper) ?? 0) : 0,
          // TODO - we shouldn't need so many conditionals in this function. Fix when we have
          // refactored with better typing
          timeAveraging: 'time_averaging' in script ? (script.time_averaging ?? 1) : 1,
          frequencyAveraging:
            'frequency_averaging' in script ? (script.frequency_averaging ?? 1) : 1,
          bitDepth: 'bit_depth' in script ? (Number(script.bit_depth) ?? 1) : 1,
          continuumSubtraction:
            'continuum_subtraction' in script ? Boolean(script.continuum_subtraction) : false,
          outputFrequencyResolution:
            'output_frequency_resolution' in script
              ? (Number(script.output_frequency_resolution) ?? 0)
              : 0,
          outputSamplingInterval:
            'output_sampling_interval' in script
              ? (Number(script.output_sampling_interval) ?? 0)
              : 0,
          dispersionMeasure:
            'dispersion_measure' in script ? (Number(script.dispersion_measure) ?? 0) : 0,
          rotationMeasure: 'rotation_measure' in script ? (Number(script.rotation_measure) ?? 0) : 0
        }
      };
    }) ?? []
  );
};

/*********************************************************** observation parameters mapping *********************************************************/
// Returns undefined for a missing label, or one the backend sends that we don't know, leaving the
// caller to apply the default.
const getWeighting = (inImageWeighting?: string): number | undefined =>
  IMAGE_WEIGHTING?.find((item) => item.label.toLowerCase() === inImageWeighting?.toLowerCase())
    ?.value;

const getSupplied = (inSupplied: SuppliedTransport | null): Supplied => {
  const suppliedType = OSD_CONSTANTS.Supplied?.find(
    (s) => s.mappingLabel === inSupplied?.supplied_type
  );
  const suppliedUnits =
    suppliedType?.units?.find((u) => u.label === inSupplied?.quantity.unit)?.value ??
    inSupplied?.supplied_type;
  const supplied = {
    type: suppliedType?.value,
    value: inSupplied?.quantity.value,
    units: suppliedUnits ? suppliedUnits : 1
  };
  return supplied as Supplied;
};

export const getFrequencyAndBandwidthUnits = (
  inUnits: string | null,
  observingBand: string
): number => {
  const units = FREQUENCY_UNITS.find(
    (item) => item.mapping.toLowerCase() === inUnits?.toLowerCase()
  )?.value;
  return units
    ? units
    : (FREQUENCY_UNITS.find(
        (item) =>
          item.label.toLowerCase() ===
          (observingBand === BAND_LOW_STR ? FREQUENCY_STR_GHZ : FREQUENCY_STR_MHZ).toLowerCase()
      )?.value as number);
};

export const getBandwidth = (incBandwidth: number, telescope: number): number => {
  const options = OSD_CONSTANTS.array?.find((item) => item?.value === telescope)?.bandWidth ?? [];
  if (options.length === 0) return 1;
  // Match by nearest numeric value rather than an exact substring of the label, since the
  // backend can round/reformat the stored number (e.g. 390.625 -> 390.63) - an exact string
  // match would silently fall through to the default and lose the saved selection.
  const closest = options.reduce((best, candidate) =>
    Math.abs(Number(candidate?.label?.split(' ')[0]) - incBandwidth) <
    Math.abs(Number(best?.label?.split(' ')[0]) - incBandwidth)
      ? candidate
      : best
  );
  return closest.value;
};

// This is here as there is inconsistent representation of spectral and spectral line.
const typeCheck = (inType: string | undefined): any => {
  if (inType === TYPE_ZOOM_LONG) return TYPE_ZOOM;
  if (inType === TYPE_CONTINUUM_SPECTRAL_LONG) return TYPE_CONTINUUM_SPECTRAL;
  return inType;
};

export const getObservations = (inValue: ObservationSets[] | null | undefined): Observation[] => {
  const results: Observation[] = [];
  if (!inValue || inValue.length === 0) {
    return results;
  }
  for (let i = 0; i < inValue?.length; i++) {
    const arr = inValue[i]?.array_details?.array === TELESCOPE_MID_BACKEND_MAPPING ? 1 : 2;
    //TODO: Rework logic to reference array label rather than number
    // Older observations may have been saved as 'aa2' before the LOW array assembly was
    // renamed to 'aa2_sv' - normalise so those still resolve to the current SA_AA2 entry.
    const backendSubarray = inValue[i]?.array_details?.subarray?.toLocaleLowerCase();
    const normalizedSubarray = backendSubarray === 'aa2' ? SA_AA2 : backendSubarray;
    const sub = OSD_CONSTANTS.array[arr - 1].subarray?.find(
      (p) => p.value.toLowerCase() === normalizedSubarray
    )?.value;

    const type = typeCheck(inValue[i]?.observation_type_details?.observation_type);

    const observingBand = inValue[i]?.observing_band;

    // MID array details
    let weather, num15mAntennas, num13mAntennas, numSubBands;
    if (inValue[i]?.array_details?.array === TELESCOPE_MID_BACKEND_MAPPING) {
      const midDetails = inValue[i].array_details as MidArray;
      weather = midDetails.weather;
      num15mAntennas = midDetails.number_15_antennas;
      num13mAntennas = midDetails.number_13_antennas;
      numSubBands = midDetails.number_sub_bands;
    }

    // LOW array details
    let numStations;
    if (inValue[i]?.array_details?.array === TELESCOPE_LOW_BACKEND_MAPPING) {
      const lowDetails = inValue[i].array_details as LowArray;
      numStations = lowDetails.number_of_stations;
    }

    const obs: Observation = {
      id: inValue[i].observation_set_id,
      telescope: arr,
      subarray: sub ? sub : '',
      type: String(type),
      observingBand: observingBand,
      weather: weather,
      centralFrequency: inValue[i]?.observation_type_details?.central_frequency?.value as number,
      centralFrequencyUnits: getFrequencyAndBandwidthUnits(
        inValue[i]?.observation_type_details?.central_frequency?.unit ?? null,
        observingBand
      ),
      elevation: inValue[i]?.elevation as number,
      num15mAntennas: num13mAntennas,
      num13mAntennas: num15mAntennas,
      numSubBands: numSubBands ? numSubBands : 1,
      bandwidth:
        type === TYPE_ZOOM
          ? getBandwidth(inValue[i].observation_type_details?.bandwidth?.value ?? 0, arr)
          : null,
      supplied: getSupplied(inValue[i].observation_type_details?.supplied ?? null),
      spectralResolution: String(
        (inValue[i].observation_type_details as SpectralLineSetup)?.spectral_resolution
      ),
      effectiveResolution: String(
        (inValue[i].observation_type_details as SpectralLineSetup)?.effective_resolution
      ),
      continuumBandwidth:
        type === TYPE_CONTINUUM || type === TYPE_PST || type === TYPE_CONTINUUM_SPECTRAL
          ? (inValue[i].observation_type_details?.bandwidth?.value ?? null)
          : null,
      continuumBandwidthUnits:
        type === TYPE_CONTINUUM || type === TYPE_PST || type === TYPE_CONTINUUM_SPECTRAL
          ? getFrequencyAndBandwidthUnits(
              inValue[i]?.observation_type_details?.bandwidth?.unit ?? null,
              observingBand
            )
          : null,
      numStations: numStations,
      ...(type === TYPE_ZOOM && {
        zoomChannels: Number(
          (inValue[i].observation_type_details as SpectralLineSetup)?.number_of_channels
        )
      }),
      ...(type === TYPE_PST && {
        pstMode: PST_MODES?.find(
          (mode) => mode?.mapping === (inValue[i].observation_type_details as PstSetup)?.pst_mode
        )?.value
      })
    };
    results.push(obs);
  }
  return results;
};

/*************************************************************************************************************************/

export function mapping(inRec: ProposalBackend): Proposal {
  const isSV: boolean =
    inRec.proposal_info?.proposal_type?.main_type === PROPOSAL_TYPE.SCIENCE_VERIFICATION;

  const sciencePDF: DocumentPDF = getPDF(
    inRec?.observation_info?.documents,
    PDF_NAME_PREFIXES.SCIENCE + inRec.prsl_id
  ) as unknown as DocumentPDF;
  const technicalPDF: DocumentPDF | undefined = isSV
    ? undefined
    : (getPDF(
        inRec?.observation_info?.documents,
        PDF_NAME_PREFIXES.TECHNICAL + inRec.prsl_id
      ) as unknown as DocumentPDF);

  const targets = targetsFromPdm(inRec.observation_info?.targets);

  const convertedProposal = {
    metadata: inRec.metadata,
    id: inRec.prsl_id,
    title: inRec.proposal_info?.title,
    proposalType: inRec.proposal_info?.proposal_type?.main_type as ProposalTypeType,
    proposalSubType: (inRec.proposal_info?.proposal_type?.attributes ??
      []) as ProposalSubTypeType[],
    status: inRec.status,
    lastUpdated: inRec.metadata?.last_modified_on,
    lastUpdatedBy: inRec.metadata?.last_modified_by,
    createdOn: inRec.metadata?.created_on,
    createdBy: inRec.metadata?.created_by,
    version: inRec.metadata?.version,
    cycle: inRec.cycle,
    investigators: getInvestigators(inRec.proposal_info?.investigators),
    abstract: inRec.proposal_info?.abstract,
    scienceCategory: getScienceCategory((inRec.proposal_info?.science_category as string) || ''),
    scienceSubCategory: [1], // Not used currently
    sciencePDF: sciencePDF,
    scienceLoadStatus: sciencePDF?.isUploadedPdf ? FileUploadStatus.OK : FileUploadStatus.INITIAL,
    targetOption: 1, // TODO check what to map to
    targets: targets,
    observations: getObservations(inRec.observation_info?.observation_sets),
    groupObservations: getGroupObservations(inRec.observation_info?.observation_sets),
    targetObservation: targetObservationFromPdm(
      inRec.observation_info?.result_details,
      inRec.observation_info?.observation_sets
    ),
    calibrationStrategy: calibrationStrategyFromPdm(inRec.observation_info?.calibration_strategy),
    technicalPDF: isSV ? undefined : technicalPDF,
    technicalLoadStatus: isSV
      ? FileUploadStatus.INITIAL
      : technicalPDF
        ? FileUploadStatus.OK
        : FileUploadStatus.INITIAL,
    dataProductSDP: inRec?.observation_info?.data_product_sdps
      ? markSelectedDataProducts(
          getDataProductSDP(inRec.observation_info?.data_product_sdps as DataProductSDPTransport[]),
          inRec.observation_info?.result_details
        )
      : [],
    dataProductSRC: getDataProductSRC(inRec.observation_info?.data_product_src_nets),
    pipeline: '' // TODO remove this property from type as not needed
  };
  return convertedProposal as Proposal;
}

// Unmapped version: fetch proposal from the ODA in its PDM (backend) shape, without mapping it.
export async function GetProposalPdm(
  authAxiosClient: AxiosAuthClient,
  id: string
): Promise<ProposalBackend | string> {
  try {
    const URL_PATH = `${OSO_SERVICES_PROPOSAL_PATH}/${id}`;
    const result = await authAxiosClient.get(`${SKA_OSO_SERVICES_URL}${URL_PATH}`);
    if (!result || !result?.data) {
      return 'error.API_UNKNOWN_ERROR';
    }
    return result.data;
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'error.API_UNKNOWN_ERROR';
  }
}

async function GetProposal(
  authAxiosClient: AxiosAuthClient,
  id: string
): Promise<Proposal | string> {
  const response = await GetProposalPdm(authAxiosClient, id);
  if (typeof response === 'string') {
    return response;
  }
  try {
    return mapping(response);
  } catch (error) {
    return error instanceof Error ? error.message : 'error.API_UNKNOWN_ERROR';
  }
}

export default GetProposal;
