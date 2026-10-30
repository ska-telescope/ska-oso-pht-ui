import { z } from 'zod';
import { STATUS_ERROR, STATUS_INITIAL, STATUS_OK, STATUS_PARTIAL } from '@/utils/constants';

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
