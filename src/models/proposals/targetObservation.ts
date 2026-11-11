import { z } from 'zod';
import {
  SENSITIVITY_STATE,
  TYPE_CONTINUUM,
  TYPE_CONTINUUM_SPECTRAL,
  TYPE_CONTINUUM_SPECTRAL_LONG,
  TYPE_PST
} from '@/utils/constants';
import type { Integration, ObservationSets, Quantity4, Result } from '@/generated/models';

// Schema for the links between targets, observations and data products, with their sensitivity
// results. Structure only: see getProposalSchema.

const quantitySchema = z.object({ value: z.number(), unit: z.string() });

/** The results for the continuum or the spectral part of an observation, as the PDM keeps them. */
export function getSensitivityValuesSchema() {
  return z.object({
    weightedSensitivity: quantitySchema,
    totalSensitivity: quantitySchema.optional(),
    confusionNoise: quantitySchema.optional(),
    surfaceBrightnessSensitivity: quantitySchema.optional(),
    // The PDM keeps the beam size as text, e.g. '1.23 x 4.56'
    synthesizedBeamSize: z.object({ value: z.string(), unit: z.string() }).optional()
  });
}

/**
 * The sensitivity results of a link. A link without them has none: the calculator doesn't apply
 * (SSO targets and PST), or they haven't been calculated.
 */
export function getSensitivitySchema() {
  return z.discriminatedUnion('state', [
    z.object({ state: z.literal(SENSITIVITY_STATE.CALCULATING) }),
    z.object({ state: z.literal(SENSITIVITY_STATE.FAILED), error: z.string() }),
    z.object({
      state: z.literal(SENSITIVITY_STATE.DONE),
      // Only continuum observations have continuum results
      continuum: getSensitivityValuesSchema().optional(),
      spectral: getSensitivityValuesSchema()
    })
  ]);
}

export function getTargetObservationLinkSchema() {
  return z.object({
    targetId: z.string(),
    observationId: z.string(),
    dataProductsSDPId: z.string(),
    sensitivity: getSensitivitySchema().optional()
  });
}

export function getTargetObservationSchema() {
  return z.array(getTargetObservationLinkSchema());
}

export type TargetObservationType = z.input<ReturnType<typeof getTargetObservationSchema>>;
export type TargetObservationLink = z.output<ReturnType<typeof getTargetObservationLinkSchema>>;
export type Sensitivity = z.output<ReturnType<typeof getSensitivitySchema>>;
export type SensitivityValues = z.output<ReturnType<typeof getSensitivityValuesSchema>>;

/*********************************************************** PDM mapping *********************************************************/

type ResultsPart = 'continuum' | 'spectral';

// Accepts the legacy store's spelling (continuumSpectral) and the PDM's (continuum and spectral line).
// PST results are laid out as continuum ones.
const hasContinuumResults = (type: string | undefined) =>
  type === TYPE_CONTINUUM ||
  type === TYPE_CONTINUUM_SPECTRAL ||
  type === TYPE_CONTINUUM_SPECTRAL_LONG ||
  type === TYPE_PST;

/**************************** PDM → form *****************************/

// The form keeps units without spaces, as they are shown
const unitFromPdm = (unit: string | null | undefined) => unit?.split(' ').join('') ?? '';

const quantityFromPdm = (quantity: Quantity4 | null | undefined) => ({
  value: quantity?.value ?? 0,
  unit: unitFromPdm(quantity?.unit)
});

// A value the calculator didn't give is null in the PDM, and missing in the form
const optionalQuantityFromPdm = (quantity: Quantity4 | null | undefined) =>
  quantity ? quantityFromPdm(quantity) : undefined;

const valuesFromPdm = (
  result: Result,
  integration: Integration,
  part: ResultsPart
): SensitivityValues => {
  const surfaceBrightness = integration.surface_brightness_sensitivity?.[part];
  const beamSize = result.synthesized_beam_size?.[part];
  return {
    weightedSensitivity: quantityFromPdm(integration[`weighted_${part}_sensitivity`]),
    totalSensitivity: optionalQuantityFromPdm(integration[`total_${part}_sensitivity`]),
    confusionNoise: optionalQuantityFromPdm(result[`${part}_confusion_noise`]),
    surfaceBrightnessSensitivity:
      surfaceBrightness == null
        ? undefined
        : {
            value: surfaceBrightness,
            unit: unitFromPdm(integration.surface_brightness_sensitivity?.unit)
          },
    synthesizedBeamSize: beamSize
      ? { value: beamSize, unit: result.synthesized_beam_size?.unit ?? '' }
      : undefined
  };
};

// Results calculated for a supplied sensitivity were never possible in the GUI, so they are read
// as no results, and calculated again
const sensitivityFromPdm = (
  result: Result,
  observationType: string | undefined
): Sensitivity | undefined => {
  if (!result.result || result.result.supplied_type === 'sensitivity') {
    return undefined;
  }
  const integration = result.result as Integration;
  return {
    state: SENSITIVITY_STATE.DONE,
    ...(hasContinuumResults(observationType) && {
      continuum: valuesFromPdm(result, integration, 'continuum')
    }),
    spectral: valuesFromPdm(result, integration, 'spectral')
  };
};

// Each result is a link; the observation sets give each linked observation's type, which decides
// whether it has continuum results.
export const targetObservationFromPdm = (
  inResults: Result[] | null | undefined,
  inObservationSets: ObservationSets[] | null | undefined
): TargetObservationLink[] => {
  if (!inResults?.length || !inObservationSets?.length) {
    return [];
  }
  return inResults.map((result) => {
    const observationType = inObservationSets.find(
      (obs) => obs.observation_set_id === result.observation_set_ref
    )?.observation_type_details?.observation_type;
    const link: TargetObservationLink = {
      targetId: result.target_ref,
      observationId: result.observation_set_ref,
      dataProductsSDPId: result?.data_product_ref
    };
    const sensitivity = sensitivityFromPdm(result, observationType);
    if (sensitivity) {
      link.sensitivity = sensitivity;
    }
    return link;
  });
};

/**************************** form → PDM *****************************/

// A spectral line observation has no continuum results, which the PDM keeps as empty values
const NO_QUANTITY = { value: 0, unit: '' };

export const targetObservationToPdm = (links: TargetObservationType): Result[] =>
  links.map((link) => {
    // The references are always saved; the results are null when there are none (SSO, PST)
    const result: Result = {
      observation_set_ref: link.observationId,
      data_product_ref: link.dataProductsSDPId,
      target_ref: link.targetId,
      result: null,
      continuum_confusion_noise: null,
      spectral_confusion_noise: null,
      synthesized_beam_size: null
    };
    if (link.sensitivity?.state !== SENSITIVITY_STATE.DONE) {
      return result;
    }

    const { continuum, spectral } = link.sensitivity;
    result.result = {
      supplied_type: 'integration_time',
      weighted_continuum_sensitivity: continuum?.weightedSensitivity ?? NO_QUANTITY,
      total_continuum_sensitivity: continuum ? (continuum.totalSensitivity ?? null) : NO_QUANTITY,
      weighted_spectral_sensitivity: spectral.weightedSensitivity,
      total_spectral_sensitivity: spectral.totalSensitivity ?? null,
      surface_brightness_sensitivity: {
        continuum: continuum ? (continuum.surfaceBrightnessSensitivity?.value ?? null) : 0,
        spectral: spectral.surfaceBrightnessSensitivity?.value ?? null,
        unit:
          spectral.surfaceBrightnessSensitivity?.unit ??
          continuum?.surfaceBrightnessSensitivity?.unit ??
          null
      }
    };
    result.continuum_confusion_noise = continuum
      ? (continuum.confusionNoise ?? null)
      : NO_QUANTITY;
    result.spectral_confusion_noise = spectral.confusionNoise ?? null;
    result.synthesized_beam_size = {
      continuum: continuum ? (continuum.synthesizedBeamSize?.value ?? null) : '',
      spectral: spectral.synthesizedBeamSize?.value ?? null,
      unit:
        spectral.synthesizedBeamSize?.unit ?? continuum?.synthesizedBeamSize?.unit ?? null
    };
    return result;
  });
