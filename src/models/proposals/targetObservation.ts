import { z } from 'zod';
import {
  STATUS_ERROR,
  STATUS_INITIAL,
  STATUS_OK,
  STATUS_PARTIAL,
  TYPE_CONTINUUM,
  TYPE_CONTINUUM_SPECTRAL_LONG,
  TYPE_PST
} from '@/utils/constants';
import type { ResultsSection, SensCalcResults } from '@/utils/types/sensCalcResults';
import type TargetObservation from '@/utils/types/targetObservation';
import type { ValueUnitPair } from '@/utils/types/valueUnitPair';
import type { Integration, ObservationSets, Result, Sensitivity } from '@/generated/models';

// Schema for the links between targets, observations and data products, with their sensitivity
// results. Structure only: see getProposalSchema.

const resultsSectionSchema = z.object({
  field: z.string(),
  value: z.string().optional(),
  units: z.string().optional()
});

export function getSensCalcResultsSchema() {
  return z.object({
    statusGUI: z.literal([STATUS_OK, STATUS_ERROR, STATUS_PARTIAL, STATUS_INITIAL]),
    error: z.string().optional(),
    section1: z.array(resultsSectionSchema).optional(),
    section2: z.array(resultsSectionSchema).optional(),
    section3: z.array(resultsSectionSchema).optional()
  });
}

export function getTargetObservationLinkSchema() {
  return z.object({
    targetId: z.string(),
    observationId: z.string(),
    dataProductsSDPId: z.string(),
    sensCalc: getSensCalcResultsSchema().optional()
  });
}

export function getTargetObservationSchema() {
  return z.array(getTargetObservationLinkSchema());
}

export type TargetObservationType = z.input<ReturnType<typeof getTargetObservationSchema>>;

/*********************************************************** PDM mapping *********************************************************/

// The PDM result is a union on supplied_type, but the mapping reads the fields of both variants.
type ResultsDetailsAnySupplied = Omit<Result, 'result'> & {
  result?: Partial<Omit<Integration, 'supplied_type'> & Omit<Sensitivity, 'supplied_type'>> | null;
};

/**************************** PDM → form *****************************/

const getResultsSection1 = (
  inResult: ResultsDetailsAnySupplied,
  isContinuum: boolean,
  isPST: boolean,
  isSensitivity: boolean,
  inObservationSets: ObservationSets[],
  inResultObservationRef: string | null
): SensCalcResults['section1'] => {
  let section1 = [];
  const obs = inObservationSets?.find((o) => o.observation_set_id === inResultObservationRef);

  // for continuum or PST observation
  if (isContinuum || isPST) {
    if (!isSensitivity) {
      section1.push({
        // This is only saved for supplied sensitivity obs in backend
        // However, we do display continuumSensitivityWeighted, etc. for supplied integration in UI
        // TODO SC -> sens calcs results in UI need to be updated to have different fields for integration time results and sensitivity results
        // => see sensitivity calculator
        // TODO SC once sens calcs results updated, mapping of results will need updating to reflect different fields for different results
        field: 'continuumSensitivityWeighted',
        value: inResult.result?.weighted_continuum_sensitivity?.value.toString(),
        units: inResult?.result?.weighted_continuum_sensitivity?.unit?.split(' ')?.join('') // trim white spaces
      } as ResultsSection);
    }
    section1.push({
      field: 'continuumConfusionNoise',
      value: inResult.continuum_confusion_noise?.value.toString(),
      units: inResult?.continuum_confusion_noise?.unit?.split(' ')?.join('')
    } as ResultsSection);
    if (!isSensitivity) {
      section1.push({
        field: 'continuumTotalSensitivity',
        value: inResult.result?.total_continuum_sensitivity?.value.toString(),
        units: inResult?.result?.total_continuum_sensitivity?.unit?.split(' ')?.join('')
      } as ResultsSection);
    }
    section1.push({
      field: 'continuumSynthBeamSize',
      value: inResult.synthesized_beam_size?.continuum,
      units: inResult?.synthesized_beam_size?.unit
    } as ResultsSection);
    if (isSensitivity) {
      section1.push({
        field: 'continuumIntegrationTime',
        value: obs?.observation_type_details?.supplied?.quantity?.value.toString(),
        units: obs?.observation_type_details?.supplied?.quantity?.unit
      } as ResultsSection);
    } else {
      section1.push({
        field: 'continuumSurfaceBrightnessSensitivity',
        value: inResult.result?.surface_brightness_sensitivity?.continuum?.toString(),
        units: inResult?.result?.surface_brightness_sensitivity?.unit?.split(' ')?.join('')
      } as ResultsSection);
    }
    // for zoom observation
  } else {
    section1 = getResultsSection2(
      inResult,
      isSensitivity,
      inObservationSets,
      inResultObservationRef
    ) as any[];
  }
  return section1;
};

const getResultsSection2 = (
  inResult: ResultsDetailsAnySupplied,
  isSensitivity: boolean,
  inObservationSets: ObservationSets[],
  inResultObservationRef: string | null
): SensCalcResults['section2'] => {
  const section2 = [];
  const obs = inObservationSets?.find((o) => o.observation_set_id === inResultObservationRef);

  if (!isSensitivity) {
    section2.push({
      field: 'spectralSensitivityWeighted',
      value: inResult.result?.weighted_spectral_sensitivity?.value.toString(),
      units: inResult?.result?.weighted_spectral_sensitivity?.unit?.split(' ')?.join('')
    } as ResultsSection);
  }
  section2.push({
    field: 'spectralConfusionNoise',
    value: inResult.spectral_confusion_noise?.value.toString(),
    units: inResult?.spectral_confusion_noise?.unit?.split(' ')?.join('')
  } as ResultsSection);
  if (!isSensitivity) {
    section2.push({
      field: 'spectralTotalSensitivity',
      value: inResult.result?.total_spectral_sensitivity?.value.toString(),
      units: inResult?.result?.total_spectral_sensitivity?.unit?.split(' ')?.join('')
    } as ResultsSection);
  }
  section2.push({
    field: 'spectralSynthBeamSize',
    value: inResult.synthesized_beam_size?.spectral,
    units: inResult?.synthesized_beam_size?.unit // unit is the same for spectral or continuum
  } as ResultsSection);
  if (isSensitivity) {
    section2.push({
      field: 'spectralIntegrationTime',
      value: obs?.observation_type_details?.supplied?.quantity?.value.toString(),
      units: obs?.observation_type_details?.supplied?.quantity?.unit
    } as ResultsSection);
  } else {
    section2.push({
      field: 'spectralSurfaceBrightnessSensitivity',
      value: inResult.result?.surface_brightness_sensitivity?.spectral?.toString(),
      units: inResult?.result?.surface_brightness_sensitivity?.unit?.split(' ')?.join('')
    } as ResultsSection);
  }
  return section2;
};

const getResultsSection3 = (
  inResultObservationRef: string | null,
  inObservationSets: ObservationSets[],
  _inResult: Result,
  isSensitivity: boolean
): SensCalcResults['section3'] => {
  const obs = inObservationSets?.find((o) => o.observation_set_id === inResultObservationRef);
  const field = isSensitivity ? 'sensitivity' : 'integrationTime';
  return [
    {
      field: field,
      value: obs?.observation_type_details?.supplied?.quantity?.value?.toString() as string,
      units: obs?.observation_type_details?.supplied?.quantity?.unit?.split(' ')?.join('')
    }
  ];
};

const getResultObsType = (result: Result, inObservationSets: ObservationSets[]) => {
  const obsSetRef = result.observation_set_ref;
  const obs = inObservationSets.find((item) => item.observation_set_id === obsSetRef);
  return obs?.observation_type_details?.observation_type;
};

// Each result is a link; the observation sets give each linked observation's type, which decides
// how its sensitivity results are laid out.
export const targetObservationFromPdm = (
  inResults: Result[] | null | undefined,
  inObservationSets: ObservationSets[] | null | undefined
): TargetObservation[] => {
  const targetObsArray: TargetObservation[] = [];
  if (
    !inResults ||
    inResults.length === 0 ||
    !inObservationSets ||
    inObservationSets.length === 0
  ) {
    return targetObsArray;
  }
  for (const result of inResults) {
    const resultObsType = getResultObsType(result, inObservationSets);
    const isContinuum =
      resultObsType === TYPE_CONTINUUM || resultObsType === TYPE_CONTINUUM_SPECTRAL_LONG;
    const isPST = resultObsType === TYPE_PST;
    const isSensitivity = result.result?.supplied_type === 'sensitivity';

    const targetObs: TargetObservation = {
      targetId: result.target_ref,
      observationId: result.observation_set_ref,
      dataProductsSDPId: result?.data_product_ref
    };

    if (result.result != undefined) {
      targetObs.sensCalc = {
        statusGUI: 0, // only for UI
        error: '', // only for UI
        section1: getResultsSection1(
          result,
          isContinuum,
          isPST,
          isSensitivity,
          inObservationSets,
          result.observation_set_ref
        ),
        section2:
          isContinuum || isPST
            ? getResultsSection2(
                result,
                isSensitivity,
                inObservationSets,
                result.observation_set_ref
              )
            : [], // only used for continuum & PST observation
        section3: getResultsSection3(
          result.observation_set_ref,
          inObservationSets,
          result,
          isSensitivity
        )
      };
    }

    targetObsArray.push(targetObs);
  }
  return targetObsArray;
};

/**************************** form → PDM *****************************/

type Link = TargetObservationType[number];
type SpectralSection = 'section1' | 'section2';

// Observation types as they appear in the PDM observation sets
const isContinuum = (type: string) =>
  type === TYPE_CONTINUUM || type === TYPE_CONTINUUM_SPECTRAL_LONG;
const isPST = (type: string) => type === TYPE_PST;

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
  obsType: string,
  tarObs: Link,
  spectralSection: SpectralSection
) => {
  if (!tarObs?.sensCalc) {
    return null;
  }

  const params: SuppliedRelatedFields = {
    supplied_type: suppliedType
  };
  params.weighted_continuum_sensitivity = {
    value:
      isContinuum(obsType) || isPST(obsType)
        ? Number(
            tarObs?.sensCalc?.section1?.find((o) => o.field === 'continuumSensitivityWeighted')
              ?.value
          )
        : 0,
    unit:
      isContinuum(obsType) || isPST(obsType)
        ? (tarObs?.sensCalc?.section1?.find((o) => o.field === 'continuumSensitivityWeighted')
            ?.units as string)
        : ''
  };
  params.total_continuum_sensitivity = {
    value:
      isContinuum(obsType) || isPST(obsType)
        ? Number(
            tarObs?.sensCalc?.section1?.find((o) => o.field === 'continuumTotalSensitivity')?.value
          )
        : 0,
    unit:
      isContinuum(obsType) || isPST(obsType)
        ? (tarObs?.sensCalc?.section1?.find((o) => o.field === 'continuumTotalSensitivity')
            ?.units as string)
        : ''
  };

  params.weighted_spectral_sensitivity = {
    value: Number(
      tarObs.sensCalc[spectralSection]?.find((o) => o.field === 'spectralSensitivityWeighted')
        ?.value
    ),
    unit: tarObs.sensCalc[spectralSection]?.find((o) => o.field === 'spectralSensitivityWeighted')
      ?.units as string
  };
  params.total_spectral_sensitivity = {
    value: Number(
      tarObs.sensCalc[spectralSection]?.find((o) => o.field === 'spectralTotalSensitivity')?.value
    ),
    unit: tarObs.sensCalc[spectralSection]?.find((o) => o.field === 'spectralTotalSensitivity')
      ?.units as string
  };
  params.surface_brightness_sensitivity = {
    continuum:
      isContinuum(obsType) || isPST(obsType)
        ? Number(
            tarObs.sensCalc.section1?.find(
              (o) => o.field === 'continuumSurfaceBrightnessSensitivity'
            )?.value
          )
        : 0,
    spectral: Number(
      tarObs.sensCalc[spectralSection]?.find(
        (o) => o.field === 'spectralSurfaceBrightnessSensitivity'
      )?.value
    ),
    unit: tarObs.sensCalc[spectralSection]?.find(
      (o) => o.field === 'spectralSurfaceBrightnessSensitivity'
    )?.units as string
  };
  return params;
};

export const getSuppliedFieldsIntegrationTime = (
  suppliedType: string,
  obsType: string,
  tarObs: Link
) => {
  if (!tarObs?.sensCalc) {
    return null;
  }

  const params: SuppliedRelatedFields = {
    supplied_type: suppliedType
  };
  params.continuum = {
    value:
      isContinuum(obsType) || isPST(obsType) ? Number(tarObs.sensCalc.section3?.[0]?.value) : 0,
    unit: isContinuum(obsType) || isPST(obsType) ? (tarObs.sensCalc.section3?.[0]?.units ?? '') : ''
  };

  params.spectral = {
    value: Number(tarObs.sensCalc.section3?.[0]?.value),
    unit: tarObs.sensCalc.section3?.[0]?.units ?? ''
  };
  return params;
};

const getObsType = (incTarObs: Link, observationSets: ObservationSets[]): string => {
  const obs = observationSets.find((item) => item?.observation_set_id === incTarObs.observationId);
  return obs?.observation_type_details?.observation_type ?? TYPE_CONTINUUM;
};

const getSpectralSection = (obsType: string): SpectralSection =>
  isContinuum(obsType) || isPST(obsType) ? 'section2' : 'section1';

// Takes the PDM observation sets, as the result layout depends on each linked observation's type
export const targetObservationToPdm = (
  incTargetObservations: TargetObservationType,
  observationSets: ObservationSets[] = []
): Result[] => {
  const resultsArr = [];
  for (const tarObs of incTargetObservations) {
    // refs always populate; result/noise blocks are null when there's no sensCalc (SSO, PST)
    const result: Result = {
      observation_set_ref: tarObs.observationId,
      data_product_ref: tarObs.dataProductsSDPId,
      target_ref: tarObs.targetId,
      result: null,
      continuum_confusion_noise: null,
      spectral_confusion_noise: null,
      synthesized_beam_size: null
    };

    const sensCalc = tarObs.sensCalc;

    if (sensCalc != undefined && sensCalc.statusGUI == STATUS_OK) {
      const obsType = getObsType(tarObs, observationSets);
      const spectralSection = getSpectralSection(obsType);
      const suppliedType =
        sensCalc.section3?.[0]?.field === 'sensitivity' ? 'sensitivity' : 'integration_time';

      const suppliedRelatedFields =
        suppliedType === 'sensitivity'
          ? getSuppliedFieldsIntegrationTime(suppliedType, obsType, tarObs)
          : getSuppliedFieldsSensitivity(suppliedType, obsType, tarObs, spectralSection);

      result.result = {
        supplied_type: suppliedType,
        ...suppliedRelatedFields
      } as unknown as Result['result'];

      result.continuum_confusion_noise = {
        value:
          isContinuum(obsType) || isPST(obsType)
            ? Number(sensCalc.section1?.find((o) => o.field === 'continuumConfusionNoise')?.value)
            : 0,
        unit:
          isContinuum(obsType) || isPST(obsType)
            ? sensCalc.section1?.find((o) => o.field === 'continuumConfusionNoise')?.units
            : ''
      };

      result.synthesized_beam_size = {
        spectral: sensCalc[spectralSection]?.find((o) => o.field === 'spectralSynthBeamSize')
          ?.value,
        continuum:
          isContinuum(obsType) || isPST(obsType)
            ? sensCalc.section1?.find((o) => o.field === 'continuumSynthBeamSize')?.value
            : '',
        unit: sensCalc[spectralSection]?.find((o) => o.field === 'spectralSynthBeamSize')?.units
      } as Result['synthesized_beam_size'];

      result.spectral_confusion_noise = {
        value: Number(
          sensCalc[spectralSection]?.find((o) => o.field === 'spectralConfusionNoise')?.value
        ),
        unit: sensCalc[spectralSection]?.find((o) => o.field === 'spectralConfusionNoise')?.units
      };
    }
    resultsArr.push(result);
  }
  return resultsArr;
};
