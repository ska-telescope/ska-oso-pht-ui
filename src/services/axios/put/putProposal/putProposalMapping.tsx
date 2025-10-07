import Target, {
  ReferenceCoordinateGalacticBackend,
  ReferenceCoordinateICRSBackend,
  TargetBackend
} from '@utils/types/target.tsx';
import Observation from '@utils/types/observation.tsx';
import { ObservationSetBackend } from '@utils/types/observationSet.tsx';
import GroupObservation from '@utils/types/groupObservation.tsx';
import { ArrayDetailsLowBackend, ArrayDetailsMidBackend } from '@utils/types/arrayDetails.tsx';
import { ValueUnitPair } from '@utils/types/valueUnitPair.tsx';
import TargetObservation from '@utils/types/targetObservation.tsx';
import { SensCalcResultsBackend } from '@utils/types/sensCalcResults.tsx';
import {
  BANDWIDTH_TELESCOPE,
  FREQUENCY_UNITS,
  GENERAL,
  IMAGE_WEIGHTING,
  OBSERVATION_TYPE_BACKEND,
  PROJECTS,
  PROPOSAL_STATUS,
  TELESCOPE_LOW_BACKEND_MAPPING,
  TELESCOPE_LOW_NUM,
  TELESCOPE_MID_BACKEND_MAPPING,
  TYPE_CONTINUUM,
  VEL_UNITS,
  VELOCITY_TYPE,
  ROBUST,
  IW_BRIGGS,
  RA_TYPE_GALACTIC,
  RA_TYPE_ICRS
} from '@utils/constants.ts';
import {
  DataProductSDP,
  DataProductSDPsBackend,
  DataProductSRC,
  DataProductSRCNetBackend
} from '@utils/types/dataProduct.tsx';
import { DocumentBackend, DocumentPDF } from '@utils/types/document.tsx';
import { helpers } from '@utils/helpers.ts';
import Proposal, { ProposalBackend } from '@utils/types/proposal.tsx';
import { getUserId } from '@utils/aaa/aaaUtils.tsx';
import { OSD_CONSTANTS } from '@utils/OSDConstants.ts';

const isContinuum = (type: number) => type === TYPE_CONTINUUM;
const isVelocity = (type: number) => type === VELOCITY_TYPE.VELOCITY;
const isRedshift = (type: number) => type === VELOCITY_TYPE.REDSHIFT;
const userId = getUserId();

const getSubType = (proposalType: number, proposalSubType: number[]): any => {
  const project = PROJECTS.find(({ id }) => id === proposalType);
  const subTypes: string[] = [];
  for (let subtype of proposalSubType) {
    if (subtype && project) {
      subTypes.push(project.subProjects.find(item => item.id === subtype)?.mapping as string);
    }
  }
  return subTypes;
};

const getReferenceCoordinate = (
  tar: Target
): ReferenceCoordinateICRSBackend | ReferenceCoordinateGalacticBackend => {
  if (tar.kind === RA_TYPE_GALACTIC.value) {
    return {
      kind: RA_TYPE_GALACTIC.label,
      l: tar.l,
      b: tar.b,
      pm_l: tar.pmL,
      pm_b: tar.pmB,
      epoch: tar.epoch,
      parallax: tar.parallax
    } as ReferenceCoordinateGalacticBackend;
  }
  return {
    kind: RA_TYPE_ICRS.label,
    reference_frame: tar.referenceFrame ? tar.referenceFrame : RA_TYPE_ICRS.label, // TODO : hardcoded for now as not implemented in UI
    ra_str: tar.raStr,
    dec_str: tar.decStr,
    pm_ra: tar.pmRa,
    pm_dec: tar.pmDec,
    epoch: tar.epoch,
    parallax: tar.parallax
  } as ReferenceCoordinateICRSBackend;
};

const getTargets = (targets: Target[]): TargetBackend[] => {
  console.log('inside getTargets ', targets);

  const outTargets = [];
  for (let i = 0; i < targets.length; i++) {
    const tar = targets[i];
    console.log('targets ', tar);
    const outTarget: TargetBackend = {
      name: tar.name,
      target_id: tar.name,
      reference_coordinate: getReferenceCoordinate(tar),
      radial_velocity: {
        quantity: {
          value: isVelocity(tar.velType) ? Number(tar.vel) : 0,
          unit: VEL_UNITS.find(u => u.value === Number(tar.velUnit))?.label as string
        },
        definition: 'RADIO', // TODO : hardcoded for now as not implemented in UI
        reference_frame: tar.raReferenceFrame ? tar.raReferenceFrame : 'LSRK',
        // TODO : hardcoded for now as backend uses TOPOCENTRIC, LSRK & BARYCENTRIC
        // but UI uses LSRK (Kinematic Local Standard of Rest) & Heliocentric for referenceFrame
        // -> using raReferenceFrame for now as data format is different
        redshift: isRedshift(tar.velType) ? Number(tar.redshift) : 0
      },
      tiedArrayBeams: {
        pstBeams: tar.tiedArrayBeams?.pstBeams.map(beam => ({
          beamId: beam.beamId,
          beamName: beam.beamName,
          beamCoordinate: beam.beamCoordinate,
          stnWeights: beam.stnWeights
        })),
        pssBeams: tar.tiedArrayBeams?.pssBeams.map(beam => ({
          beamId: beam.beamId,
          beamName: beam.beamName,
          beamCoordinate: beam.beamCoordinate,
          stnWeights: beam.stnWeights
        })),
        vlbiBeams: tar.tiedArrayBeams?.vlbiBeams.map(beam => ({
          beamId: beam.beamId,
          beamName: beam.beamName,
          beamCoordinate: beam.beamCoordinate,
          stnWeights: beam.stnWeights
        }))
      }
    };
    /********************* pointing pattern *********************/
    const mockPointingPattern = {
      pointing_pattern: {
        active: 'SinglePointParameters',
        parameters: [
          {
            kind: 'SinglePointParameters',
            epoch: tar.epoch,
            offsetXArcsec: 0.5,
            offsetYArcsec: 0.5
          }
        ]
      }
    };
    // TODO : As pointingPattern is not currently used in the UI, mock it if it doesn't exist
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
          kind: singlePointParam?.kind as string,
          offset_x_arcsec: singlePointParam?.offsetXArcsec as number,
          offset_y_arcsec: singlePointParam?.offsetYArcsec as number
        }
      ]
    };
    outTargets.push(outTarget);
  }
  return outTargets;
};

const getDocuments = (
  sciencePDF: DocumentPDF | null,
  technicalPDF: DocumentPDF | null
): DocumentBackend[] => {
  const documents = [];
  if (sciencePDF) {
    documents.push({
      document_id: sciencePDF.documentId,
      uploaded_pdf: sciencePDF.isUploadedPdf
    });
  }
  if (technicalPDF) {
    documents.push({
      document_id: technicalPDF.documentId,
      uploaded_pdf: technicalPDF.isUploadedPdf
    });
  }
  return documents;
};

const SDPOptions = (inArray: Boolean[]) => {
  return inArray.map(element => (element ? 'Y' : 'N'));
};

const getDataProductSDP = (dataproducts: DataProductSDP[]): DataProductSDPsBackend[] => {
  const IMAGE_SIZE_UNITS = ['deg', 'arcmin', 'arcsec'];

  const getPixelSizeUnits = (inValue: string) => (inValue === 'arcsecs' ? 'arcsec' : inValue);

  return dataproducts?.map(dp => ({
    data_products_sdp_id: dp.dataProductsSDPId,
    options: SDPOptions(dp.observatoryDataProduct),
    observation_set_refs: dp.observationId,
    image_size: { value: dp.imageSizeValue, unit: IMAGE_SIZE_UNITS[dp.imageSizeUnits] },
    pixel_size: { value: dp.pixelSizeValue, unit: getPixelSizeUnits(dp.pixelSizeUnits) },
    weighting: dp.weighting?.toString()
  }));
};

const getDataProductSRC = (dataproducts: DataProductSRC[]): DataProductSRCNetBackend[] => {
  return dataproducts?.map(dp => ({ data_products_src_id: dp?.id }));
};

const getGroupObservation = (obsId: string, observationGroups: GroupObservation[] | undefined) => {
  const groupId = observationGroups
    ? observationGroups.find(group => group.observationId === obsId)?.observationId
    : '';
  return groupId ? groupId : '';
};

const getObservingBand = (observingBand: number) => {
  const obsBand = BANDWIDTH_TELESCOPE.find(band => band.value === observingBand)?.mapping;
  return obsBand;
};

const getSubArray = (incSubArray: number, incTelescope: number): string => {
  const array = OSD_CONSTANTS.array.find(a => a.value === incTelescope);
  const subArray = array?.subarray
    ?.find(sub => sub.value === incSubArray)
    ?.label?.toLocaleLowerCase();
  return subArray ? subArray : 'aa4'; // TODO : fallback needs to be moved to a constant
};

const getArrayDetails = (incObs: Observation): ArrayDetailsLowBackend | ArrayDetailsMidBackend => {
  if (incObs.telescope === TELESCOPE_LOW_NUM) {
    const lowArrayDetails: ArrayDetailsLowBackend = {
      array: TELESCOPE_LOW_BACKEND_MAPPING,
      subarray: getSubArray(incObs.subarray, incObs.telescope),
      number_of_stations: incObs.numStations
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

const getFrequencyAndBandwidthUnits = (incUnitValue: number): string => {
  return FREQUENCY_UNITS.find(u => u.value === incUnitValue)?.mapping as string;
};

const getBandwidthContinuum = (incObs: Observation): ValueUnitPair => {
  return {
    value: incObs.continuumBandwidth as number,
    unit: getFrequencyAndBandwidthUnits(incObs.continuumBandwidthUnits as number)
  };
};
const getBandwidthZoom = (incObs: Observation): ValueUnitPair => {
  const obsTelescopeArray = OSD_CONSTANTS.array.find(o => o.value === incObs.telescope);
  const bandwidth = obsTelescopeArray?.bandWidth?.find(b => b.value === incObs.bandwidth);
  const valueUnit = bandwidth?.label.split(' ');
  const value = Number(valueUnit[0]);
  return {
    value: value,
    unit: bandwidth.mapping ? bandwidth.mapping : ''
  };
};
const getBandwidth = (ob: Observation): ValueUnitPair =>
  isContinuum(ob.type) ? getBandwidthContinuum(ob) : getBandwidthZoom(ob);

const getCentralFrequency = (incObs: Observation): ValueUnitPair => {
  return {
    value: incObs.centralFrequency,
    unit: getFrequencyAndBandwidthUnits(incObs.centralFrequencyUnits)
  };
};

const getSupplied = (inObs: Observation) => {
  const supplied = OSD_CONSTANTS.Supplied.find(s => s.value === inObs?.supplied?.type);
  return {
    supplied_type: supplied?.mappingLabel,
    quantity: {
      value: inObs.supplied?.value,
      unit: supplied?.units?.find(u => u.value === inObs?.supplied?.units)?.label
    }
  };
};

const getObservationsSets = (
  incObservationsSets: Observation[] | undefined,
  incObservationGroups: GroupObservation[] | undefined
): ObservationSetBackend[] => {
  const outObservationsSets = [];
  if (incObservationsSets) {
    for (let obs of incObservationsSets) {
      const observation: ObservationSetBackend = {
        observation_set_id: obs.id,
        group_id: getGroupObservation(obs.id, incObservationGroups),
        elevation: obs.elevation,
        observing_band: getObservingBand(obs.observingBand),
        array_details: getArrayDetails(obs),
        observation_type_details: {
          observation_type: OBSERVATION_TYPE_BACKEND[obs.type]?.toLowerCase(),
          bandwidth: getBandwidth(obs),
          central_frequency: getCentralFrequency(obs),
          supplied: getSupplied(obs),
          spectral_resolution: obs.spectralResolution,
          effective_resolution: obs.effectiveResolution,
          image_weighting: IMAGE_WEIGHTING.find(item => item.value === obs.imageWeighting)?.label,
          spectral_averaging: obs.spectralAveraging.toString(),
          robust:
            obs.imageWeighting === IW_BRIGGS
              ? ROBUST.find(item => item.value === obs.robust)?.label
              : '0'
        }
      };
      outObservationsSets.push(observation);
    }
  }
  return outObservationsSets;
};

/*********************************************************** sensitivity calculator results mapping *********************************************************/
/**************************** supplied fields *****************************/

interface SuppliedRelatedFields {
  supplied_type: string;
  /* sensitivity fields */
  weighted_continuum_sensitivity?: ValueUnitPair;
  weighted_spectral_sensitivity?: ValueUnitPair;
  total_continuum_sensitivity?: ValueUnitPair;
  total_spectral_sensitivity?: ValueUnitPair;
  surface_brightness_sensitivity?: { continuum: number; spectral: number; unit: string };
  /* integration_time fields */
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
  params.weighted_continuum_sensitivity = {
    value: isContinuum(obsType)
      ? Number(
        tarObs?.sensCalc?.section1?.find(o => o.field === 'continuumSensitivityWeighted')?.value
      )
      : 0,
    unit: isContinuum(obsType)
      ? (tarObs?.sensCalc?.section1?.find(o => o.field === 'continuumSensitivityWeighted')
        ?.units as string)
      : ''
  };
  params.total_continuum_sensitivity = {
    value: isContinuum(obsType)
      ? Number(
        tarObs?.sensCalc?.section1?.find(o => o.field === 'continuumTotalSensitivity')?.value
      )
      : 0,
    unit: isContinuum(obsType)
      ? (tarObs?.sensCalc?.section1?.find(o => o.field === 'continuumTotalSensitivity')
        ?.units as string)
      : ''
  };

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
    continuum: isContinuum(obsType)
      ? Number(
        tarObs.sensCalc.section1?.find(o => o.field === 'continuumSurfaceBrightnessSensitivity')
          ?.value
      )
      : 0,
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
  params.continuum = {
    value: isContinuum(obsType) ? Number(tarObs.sensCalc.section3[0]?.value) : 0,
    unit: isContinuum(obsType) ? tarObs.sensCalc.section3[0]?.units : ''
  };

  params.spectral = {
    value: Number(tarObs.sensCalc.section3[0]?.value),
    unit: tarObs.sensCalc.section3[0]?.units
  };
  // TODO : check if it's ok to send the same value for continuum and zoom? Is this not implemented in the UI?
  return params;
};
/***********************************************************/

const getObsType = (incTarObs: TargetObservation, incObs: Observation[]): number => {
  let obs = incObs.find(item => item.id === incTarObs.observationId);
  return obs.type;
};

const getSpectralSection = (obsType: number) => (isContinuum(obsType) ? 'section2' : 'section1');

const getResults = (incTargetObservations: TargetObservation[], incObs: Observation[]) => {
  const resultsArr = [];
  if (incTargetObservations) {
    for (let tarObs of incTargetObservations) {
      if (tarObs.sensCalc?.error) {
        continue;
      }
      const obsType = getObsType(tarObs, incObs); // spectral or continuum
      const spectralSection = getSpectralSection(obsType);
      const suppliedType =
        tarObs?.sensCalc?.section3[0]?.field === 'sensitivity' ? 'sensitivity' : 'integration_time';

      const suppliedRelatedFields =
        suppliedType === 'sensitivity'
          ? getSuppliedFieldsIntegrationTime(suppliedType, obsType, tarObs)
          : getSuppliedFieldsSensitivity(suppliedType, obsType, tarObs, spectralSection);
      let result: SensCalcResultsBackend = {
        observation_set_ref: tarObs.observationId,
        target_ref: tarObs.sensCalc?.title,
        result: {
          supplied_type: suppliedType,
          ...suppliedRelatedFields
        },
        continuum_confusion_noise: {
          value: isContinuum(obsType)
            ? Number(
              tarObs.sensCalc.section1?.find(o => o.field === 'continuumConfusionNoise')?.value
            )
            : 0,
          unit: isContinuum(obsType)
            ? tarObs.sensCalc.section1?.find(o => o.field === 'continuumConfusionNoise')?.units
            : ''
        },
        synthesized_beam_size: {
          spectral: tarObs.sensCalc[spectralSection]?.find(o => o.field === 'spectralSynthBeamSize')
            ?.value,
          continuum: isContinuum(obsType)
            ? tarObs.sensCalc.section1?.find(o => o.field === 'continuumSynthBeamSize')?.value
            : 'dummy', // TODO: investigate typescript not taking empty string
          unit: tarObs.sensCalc[spectralSection]?.find(o => o.field === 'spectralSynthBeamSize')
            ?.units
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
  }
  return resultsArr;
};
/*************************************************************************************************************************/

export default function MappingPutProposal(proposal: Proposal, status: string) {
  console.log('proposal inside putMapping ', proposal);
  const transformedProposal: ProposalBackend = {
    prsl_id: proposal?.id,
    status: status,
    submitted_on: status === PROPOSAL_STATUS.SUBMITTED ? new Date().toISOString() : null, // note: null since oso-services 1.1.0  does not support ''
    submitted_by: status === PROPOSAL_STATUS.SUBMITTED ? userId : '',
    investigator_refs: proposal.investigators?.map(investigator => {
      return investigator?.id?.toString();
    }),
    cycle: proposal.cycle,
    proposal_info: {
      title: proposal.title,
      proposal_type: {
        main_type: PROJECTS.find(item => item.id === proposal.proposalType)?.mapping as string,
        attributes: proposal.proposalSubType
          ? getSubType(proposal.proposalType, proposal.proposalSubType)
          : []
      },
      abstract: proposal.abstract as string,
      science_category: GENERAL.ScienceCategory?.find(
        category => category.value === proposal?.scienceCategory
      )?.label as string,
      investigators: proposal?.investigators
        ? proposal.investigators.map(investigator => {
          return {
            user_id: investigator.id?.toString(),
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
        : null
    },
    observation_info: {
      targets: getTargets(proposal?.targets ? proposal.targets : []),
      documents: getDocuments(proposal.sciencePDF, proposal.technicalPDF),
      observation_sets: getObservationsSets(proposal.observations, proposal.groupObservations),
      data_product_sdps:
        proposal?.dataProductSDP && proposal?.dataProductSDP?.length > 0
          ? getDataProductSDP(proposal.dataProductSDP as DataProductSDP[])
          : [],
      data_product_src_nets:
        proposal?.dataProductSRC && proposal?.dataProductSRC?.length > 0
          ? getDataProductSRC(proposal.dataProductSRC as DataProductSRC[])
          : [],
      result_details: getResults(
        proposal.targetObservation as TargetObservation[],
        proposal.observations as Observation[]
      )
    }
  };
  helpers.transform.trimObject(transformedProposal);
  return transformedProposal;
}
