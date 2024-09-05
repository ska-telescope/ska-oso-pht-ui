import {
  BANDWIDTH_TELESCOPE,
  GENERAL,
  IMAGE_WEIGHTING,
  OBSERVATION,
  OBSERVATION_TYPE_BACKEND,
  PROJECTS,
  PROPOSAL_STATUS,
  REF_COORDINATES_UNITS,
  TELESCOPE_LOW_BACKEND_MAPPING,
  TELESCOPE_LOW_NUM,
  TELESCOPE_MID_BACKEND_MAPPING,
  TYPE_CONTINUUM,
  VEL_UNITS,
  VELOCITY_TYPE
} from '../../../utils/constants';
import Proposal, { ProposalBackend } from '../../../utils/types/proposal';
import { helpers } from '../../../utils/helpers';
import Target, { TargetBackend } from 'utils/types/target';
import { DocumentBackend, DocumentPDF } from '../../../utils/types/document';
import {
  DataProductSDP,
  DataProductSDPsBackend,
  DataProductSRC,
  DataProductSRCNetBackend
} from '../../../utils/types/dataProduct';
import Observation from 'utils/types/observation';
import { ObservationSetBackend } from 'utils/types/observationSet';
import GroupObservation from 'utils/types/groupObservation';
import { ArrayDetailsLowBackend, ArrayDetailsMidBackend } from 'utils/types/arrayDetails';
import { ValueUnitPair } from 'utils/types/valueUnitPair';
import TargetObservation from 'utils/types/targetObservation';
import { ResultsSection, SensCalcResultsBackend } from 'utils/types/sensCalcResults';

const getSubType = (proposalType: number, proposalSubType: number[]): any => {
  const project = PROJECTS.find(({ id }) => id === proposalType);
  const subTypes: string[] = [];
  for (let subtype of proposalSubType) {
    if (subtype) {
      subTypes.push(project.subProjects.find(item => item.id === subtype)?.mapping);
    }
  }
  return subTypes;
};

const getTargets = (targets: Target[]): TargetBackend[] => {
  const outTargets = [];
  for (let i = 0; i < targets.length; i++) {
    const tar = targets[i];
    const outTarget: TargetBackend = {
      target_id: tar.name,
      reference_coordinate: {
        kind: REF_COORDINATES_UNITS[0]?.label, // hardcoded as galactic not handled in backend and not fully implemented in UI (not added to proposal)
        ra: tar.ra,
        dec: tar.dec,
        unit: [REF_COORDINATES_UNITS[0].units[0], REF_COORDINATES_UNITS[0].units[1]], // hardcoded as not fully implemented in UI (not added to proposal)
        reference_frame: tar.rcReferenceFrame ? tar.rcReferenceFrame : 'icrs' // hardcoded for now as not implemented in UI
      },
      radial_velocity: {
        quantity: {
          value: tar.velType === VELOCITY_TYPE.VELOCITY ? Number(tar.vel) : 0, // if reference frame is velocity use velocity value, otherwise set to 0
          unit: VEL_UNITS.find(u => u.value === Number(tar.velUnit))?.label
        },
        definition: 'RADIO', // hardcoded for now as not implemented in UI
        reference_frame: tar.raReferenceFrame ? tar.raReferenceFrame : 'LSRK',
        // hardcoded for now as backend uses TOPOCENTRIC, LSRK & BARYCENTRIC
        // but UI uses LSRK (Kinematic Local Standard of Rest) & Heliocentric for referenceFrame
        // -> using raReferenceFrame for now as data format is different
        redshift: tar.velType === VELOCITY_TYPE.REDSHIFT ? Number(tar.redshift) : 0 // if reference frame is redshift use redshift, otherwise set to 0
      }
    };
    /********************* pointing pattern *********************/
    const mockPointingPattern = {
      pointing_pattern: {
        active: 'SinglePointParameters',
        parameters: [
          {
            kind: 'SinglePointParameters',
            offsetXArcsec: 0.5,
            offsetYArcsec: 0.5
          }
        ]
      }
    };
    // As pointingPattern is not currently used in the UI, mock it if it doesn't exist
    const usedSingleParam = tar.pointingPattern
      ? tar.pointingPattern
      : mockPointingPattern.pointing_pattern;
    const singlePointParam = usedSingleParam?.parameters?.find(
      param => param.kind === 'SinglePointParameters'
    );
    outTarget['pointing_pattern'] = {
      active: tar.pointingPattern
        ? tar.pointingPattern?.active
        : mockPointingPattern.pointing_pattern?.active,
      parameters: [
        {
          kind: singlePointParam?.kind,
          offset_x_arcsec: singlePointParam?.offsetXArcsec,
          offset_y_arcsec: singlePointParam?.offsetYArcsec
        }
      ]
    };
    /***********************************************************/
    outTargets.push(outTarget);
  }
  return outTargets;
};

const getDocuments = (sciencePDF: DocumentPDF, technicalPDF: DocumentPDF): DocumentBackend[] => {
  const documents = [];
  if (sciencePDF?.link) {
    documents.push({
      document_id: sciencePDF.documentId,
      link: sciencePDF?.link,
      type: 'proposal_science'
    });
  }
  if (technicalPDF?.link) {
    documents.push({
      document_id: technicalPDF?.documentId,
      link: technicalPDF?.link,
      type: 'proposal_technical'
    });
  }
  return documents;
};

const SDPOptions = (inArray: Boolean[]) => {
  return inArray.map(element => (element ? 'Y' : 'N'));
};

const getDataProductSDP = (dataproducts: DataProductSDP[]): DataProductSDPsBackend[] => {
  return dataproducts?.map(dp => ({
    data_products_sdp_id: dp.dataProductsSDPId,
    options: SDPOptions(dp.observatoryDataProduct),
    observation_set_refs: dp.observationId,
    image_size: dp.imageSizeValue + ' ' + dp.imageSizeUnits,
    pixel_size: dp.pixelSizeValue + ' ' + dp.pixelSizeUnits,
    weighting: dp.weighting?.toString()
  }));
};

const getDataProductSRC = (dataproducts: DataProductSRC[]): DataProductSRCNetBackend[] => {
  return dataproducts?.map(dp => ({ data_products_src_id: dp?.id }));
};

const getGroupObservation = (obsId: string, observationGroups: GroupObservation[]) => {
  const groupId = observationGroups.find(group => group.observationId === obsId)?.observationId;
  return groupId ? groupId : '';
};

const getObservingBand = (observingBand: number) => {
  const obsBand = BANDWIDTH_TELESCOPE.find(band => band.value === observingBand)?.mapping;
  return obsBand;
};

const getSubArray = (incSubArray: number, incTelescope: number): string => {
  const array = OBSERVATION.array.find(a => a.value === incTelescope);
  const subArray = array?.subarray
    ?.find(sub => sub.value === incSubArray)
    ?.label?.toLocaleLowerCase();
  return subArray ? subArray : 'aa4'; // fallback
};

const getArrayDetails = (incObs: Observation): ArrayDetailsLowBackend | ArrayDetailsMidBackend => {
  if (incObs.telescope === TELESCOPE_LOW_NUM) {
    const lowArrayDetails: ArrayDetailsLowBackend = {
      array: TELESCOPE_LOW_BACKEND_MAPPING,
      subarray: getSubArray(incObs.subarray, incObs.telescope),
      number_of_stations: incObs.numStations,
      spectral_averaging: incObs.spectralAveraging?.toString()
    };
    return lowArrayDetails;
  } else {
    const midArrayDetails: ArrayDetailsMidBackend = {
      array: TELESCOPE_MID_BACKEND_MAPPING,
      subarray: getSubArray(incObs.subarray, incObs.telescope),
      weather: incObs.weather,
      number_15_antennas: incObs.num15mAntennas,
      number_13_antennas: incObs.num13mAntennas,
      number_sub_bands: incObs.numSubBands,
      tapering: incObs.tapering?.toString()
    };
    return midArrayDetails;
  }
};

const getFrequencyAndBandwidthUnits = (incTelescope: number, incUnitValue: number): string => {
  const obsTelescopeArray = OBSERVATION.array.find(o => o.value === incTelescope);
  const unit = obsTelescopeArray.centralFrequencyAndBandWidthUnits.find(
    u => u.value === incUnitValue
  )?.mapping;
  return unit;
};

const getBandwidth = (incObs: Observation): ValueUnitPair => {
  if (incObs.type === TYPE_CONTINUUM) {
    // continuum
    return {
      value: incObs.continuumBandwidth,
      unit: getFrequencyAndBandwidthUnits(incObs.telescope, incObs.continuumBandwidthUnits)
    };
  } else {
    // zoom
    const obsTelescopeArray = OBSERVATION.array.find(o => o.value === incObs.telescope);
    const bandwidth = obsTelescopeArray?.bandWidth?.find(b => b.value === incObs.bandwidth);
    const valueUnit = bandwidth?.label.split(' ');
    const value = Number(valueUnit[0]);
    return {
      value: value,
      unit: bandwidth.mapping ? bandwidth.mapping : '' // fallback
    };
  }
};

const getCentralFrequency = (incObs: Observation): ValueUnitPair => {
  return {
    value: incObs.centralFrequency,
    unit: getFrequencyAndBandwidthUnits(incObs.telescope, incObs.centralFrequencyUnits)
  };
};

const getSupplied = (inObs: Observation) => {
  const supplied = OBSERVATION.Supplied.find(s => s.value === inObs?.supplied?.type);
  return {
    type: supplied?.mappingLabel,
    quantity: {
      value: inObs.supplied?.value,
      unit: 'm/s' // supplied?.units?.find(u => u.value === inObs?.supplied?.units)?.label
      // hardcoded for now as backend rejects supplied units such as 'jy/beam'
      // TODO put back commented mapping to units once PDM updated
    }
  };
};

const getObservationsSets = (
  incObservationsSets: Observation[],
  incObservationGroups: GroupObservation[]
): ObservationSetBackend[] => {
  const outObservationsSets = [];
  for (let obs of incObservationsSets) {
    const observation: ObservationSetBackend = {
      observation_set_id: obs.id,
      group_id: getGroupObservation(obs.id, incObservationGroups),
      elevation: 23,
      observing_band: getObservingBand(obs.observingBand),
      array_details: getArrayDetails(obs),
      observation_type_details: {
        observation_type: OBSERVATION_TYPE_BACKEND[obs.type]?.toLowerCase(),
        bandwidth: getBandwidth(obs),
        central_frequency: getCentralFrequency(obs),
        supplied: getSupplied(obs),
        spectral_resolution: obs.spectralResolution,
        effective_resolution: obs.effectiveResolution,
        // image_weighting: obs.imageWeighting?.toString()
        image_weighting: IMAGE_WEIGHTING.find(item => item.value === obs.imageWeighting)?.lookup
      }
    };
    outObservationsSets.push(observation);
  }
  return outObservationsSets;
};

/*********************************************************** sensitivity calculator results mapping *********************************************************/
/**************************** supplied fields *****************************/

interface SuppliedRelatedFields {
  supplied_type: string;
  // sensitivity fields
  weighted_continuum_sensitivity?: ValueUnitPair;
  weighted_spectral_sensitivity?: ValueUnitPair;
  total_continuum_sensitivity?: ValueUnitPair;
  total_spectral_sensitivity?: ValueUnitPair;
  surface_brightness_sensitivity?: { continuum: number; spectral: number; unit: string };
  // integration_time fields
  continuum?: ValueUnitPair;
  spectral?: ValueUnitPair;
}

const getSuppliedFieldsSensitivity = (
  suppliedType: string,
  obsType: number,
  tarObs: TargetObservation,
  spectralSection: string
) => {
  const params: SuppliedRelatedFields = {
    supplied_type: suppliedType
  };
  if (obsType === TYPE_CONTINUUM) {
    params.weighted_continuum_sensitivity = {
      value: Number(
        tarObs.sensCalc.section1.find(o => o.field === 'continuumSensitivityWeighted')?.value
      ),
      unit: tarObs.sensCalc.section1.find(o => o.field === 'continuumSensitivityWeighted')?.units
    };
    params.total_continuum_sensitivity = {
      value: Number(
        tarObs.sensCalc.section1?.find(o => o.field === 'continuumTotalSensitivity')?.value
      ),
      unit: tarObs.sensCalc.section1?.find(o => o.field === 'continuumTotalSensitivity')?.units
    };
  } else {
    // TODO remove once PDM is updated to have continuum as optional
    // (continuum params are shown as optional in PDM, however results are rejected if not added)
    params.weighted_continuum_sensitivity = {
      value: 0,
      unit: 'uJy/beam'
    };
    params.total_continuum_sensitivity = {
      value: 0,
      unit: 'uJy/beam'
    };
  }
  params.weighted_spectral_sensitivity = {
    value: Number(
      tarObs.sensCalc[spectralSection]?.find(o => o.field === 'spectralSensitivityWeighted')?.value
    ),
    unit: tarObs.sensCalc[spectralSection]?.find(o => o.field === 'spectralSensitivityWeighted')
      ?.units
  };
  params.total_spectral_sensitivity = {
    value: Number(
      tarObs.sensCalc[spectralSection]?.find(o => o.field === 'spectralTotalSensitivity')?.value
    ),
    unit: tarObs.sensCalc[spectralSection]?.find(o => o.field === 'spectralTotalSensitivity')?.units
  };
  params.surface_brightness_sensitivity = {
    continuum:
      obsType === TYPE_CONTINUUM
        ? Number(
            tarObs.sensCalc.section1?.find(o => o.field === 'continuumSurfaceBrightnessSensitivity')
              ?.value
          )
        : 0, // null, // TODO remove dummy value and put back to null once PDM is updated to have continuum as optional
    spectral: Number(
      tarObs.sensCalc[spectralSection]?.find(
        o => o.field === 'spectralSurfaceBrightnessSensitivity'
      )?.value
    ),
    unit: tarObs.sensCalc[spectralSection]?.find(
      o => o.field === 'spectralSurfaceBrightnessSensitivity'
    )?.units
  };
  return params;
};

const getSuppliedFieldsIntegrationTime = (
  suppliedType: string,
  obsType: number,
  tarObs: TargetObservation
) => {
  const params: SuppliedRelatedFields = {
    supplied_type: suppliedType
  };
  if (obsType === TYPE_CONTINUUM) {
    params.continuum = {
      value: Number(tarObs.sensCalc.section3[0]?.value),
      unit: tarObs.sensCalc.section3[0]?.units
    };
  } else {
    // TODO remove once PDM is updated to have continuum as optional
    // (continuum param is shown as optional in PDM, however results are rejected if not added)
    params.continuum = {
      value: 0,
      unit: 'uJy/beam'
    };
  }
  params.spectral = {
    value: Number(tarObs.sensCalc.section3[0]?.value),
    unit: tarObs.sensCalc.section3[0]?.units
  };
  // TODO check if it's ok to send the same value for continuum and zoom? Is this not implmented in the UI?
  return params;
};
/***********************************************************/

const getObsType = (incTarObs: TargetObservation, incObs: Observation[]): number => {
  let obs = incObs.find(item => item.id === incTarObs.observationId);
  return obs.type;
};

const getSpectralSection = (obsType: number) => {
  // - for continuum observations, section1 contains continuum results & section2 spectral results
  // - for zoom (spectral) observations, section1 contains spectral results & section2 is empty
  return obsType === TYPE_CONTINUUM ? 'section2' : 'section1';
};

const getBeamSizeFirstSection = (incSensCalcResultsSpectralSection: ResultsSection[]) => {
  const beamSize = incSensCalcResultsSpectralSection?.find(o => o.field === 'spectralSynthBeamSize')
    ?.value;
  const beamSizeFirstSection = Number(beamSize.split('x')[0]?.trim());
  return beamSizeFirstSection ? beamSizeFirstSection * 100 : 170.1; // fallback
  // As PDM only accepts a number, we only save the 1st part of the beam size for now
  // TODO send the whole beam size as a string once PDM updated to accept a string
};

const getResults = (incTargetObservations: TargetObservation[], incObs: Observation[]) => {
  const resultsArr = [];
  for (let tarObs of incTargetObservations) {
    // if there is a sens calc error, we don't save the results
    if (tarObs.sensCalc?.error) {
      break;
    }
    const obsType = getObsType(tarObs, incObs); // spectral or continuum
    const spectralSection = getSpectralSection(obsType);
    const suppliedType =
      tarObs.sensCalc.section3[0]?.field === 'sensitivity' ? 'integration_time' : 'sensitivity';
    // tarObs.sensCalc.section3[0]?.field === 'sensitivity' ? 'sensitivity' : 'integration_time';
    // TODO un-swap sensitivity and integration time as above once PDM updated
    // => we want supplied integration time fields for supplied sensitivity
    // and supplied sensitivity fields for supplied integration time for RESULTS
    const suppliedRelatedFields =
      suppliedType === 'sensitivity'
        ? getSuppliedFieldsSensitivity(suppliedType, obsType, tarObs, spectralSection)
        : getSuppliedFieldsIntegrationTime(suppliedType, obsType, tarObs);
    let result: SensCalcResultsBackend = {
      observation_set_ref: tarObs.observationId,
      target_ref: tarObs.sensCalc?.title,
      result_details: {
        supplied_type: suppliedType,
        ...suppliedRelatedFields
      },
      continuum_confusion_noise:
        obsType === TYPE_CONTINUUM
          ? {
              value: Number(
                tarObs.sensCalc.section1?.find(o => o.field === 'continuumConfusionNoise')?.value
              ),
              unit: tarObs.sensCalc.section1?.find(o => o.field === 'continuumConfusionNoise')
                ?.units
            }
          : // null,
            // // TODO remove once PDM is updated to have continuum as optional
            {
              value: 0,
              unit: 'uJy/beam'
            },
      synthesized_beam_size: {
        value: getBeamSizeFirstSection(tarObs.sensCalc[spectralSection]), // Number(tarObs.sensCalc[spectralSection]?.find(o => o.field === 'spectralSynthBeamSize').value) // this should be a string such as "190.0 x 171.3" -> currently rejected by backend
        unit: tarObs.sensCalc[spectralSection]?.find(o => o.field === 'spectralSynthBeamSize')
          ?.units
        // TODO use commented synthBeamSize value once backends accepts the format
        // TODO check: UI save spectralSynthBeamSize & continuumSynthBeamSize while Services only uses synthBeamSize => are they always the same?
      },
      spectral_confusion_noise: {
        value: Number(
          tarObs.sensCalc[spectralSection]?.find(o => o.field === 'spectralConfusionNoise')?.value
        ),
        unit: tarObs.sensCalc[spectralSection]?.find(o => o.field === 'spectralConfusionNoise')
          ?.units
      }
    };
    resultsArr.push(result);
  }
  return resultsArr;
};
/*************************************************************************************************************************/

export default function MappingPutProposal(proposal: Proposal, status: string) {
  const transformedProposal: ProposalBackend = {
    prsl_id: proposal?.id,
    status: status,
    submitted_on: status === PROPOSAL_STATUS.SUBMITTED ? new Date().toDateString() : '',
    submitted_by: status === PROPOSAL_STATUS.SUBMITTED ? `LOGGED IN USER` : '', // TODO : Need to replaced with the logged in user.
    investigator_refs: proposal.team?.map(investigator => {
      return investigator?.id?.toString();
    }),
    cycle: GENERAL.Cycle,
    info: {
      title: proposal.title,
      proposal_type: {
        main_type: PROJECTS.find(item => item.id === proposal.proposalType)?.mapping,
        sub_type: proposal.proposalSubType
          ? getSubType(proposal.proposalType, proposal.proposalSubType)
          : []
      },
      abstract: proposal.abstract,
      science_category: GENERAL.ScienceCategory?.find(
        category => category.value === proposal?.scienceCategory
      )?.label,
      targets: getTargets(proposal.targets),
      documents: getDocuments(proposal.sciencePDF, proposal.technicalPDF),
      investigators: proposal.team.map(teamMember => {
        return {
          investigator_id: teamMember.id?.toString(),
          given_name: teamMember.firstName,
          family_name: teamMember.lastName,
          email: teamMember.email,
          organization: teamMember.affiliation,
          for_phd: teamMember.phdThesis,
          principal_investigator: teamMember.pi
        };
      }),
      observation_sets: getObservationsSets(proposal.observations, proposal.groupObservations),
      data_product_sdps:
        proposal.dataProductSDP?.length > 0 ? getDataProductSDP(proposal.dataProductSDP) : [],
      data_product_src_nets:
        proposal.dataProductSRC?.length > 0 ? getDataProductSRC(proposal.dataProductSRC) : [],
      results: getResults(proposal.targetObservation, proposal.observations)
    }
  };
  // trim undefined properties
  helpers.transform.trimObject(transformedProposal);
  return transformedProposal;
}
