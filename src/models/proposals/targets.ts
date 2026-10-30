import { z } from 'zod';

// Schema for the proposal's targets. Structure only: see getProposalSchema.

const pointingPatternParamsSchema = z.object({
  kind: z.string(),
  offsetXArcsec: z.number(),
  offsetYArcsec: z.number()
});

export function getTargetSchema() {
  return z.object({
    id: z.string(),
    name: z.string(),
    redshift: z.string().optional(),
    raReferenceFrame: z.string().optional(),
    raDefinition: z.string().optional(),
    velType: z.number().optional(),
    vel: z.string().optional(),
    velUnit: z.number().optional(),
    kind: z.number(),
    l: z.number().optional(),
    b: z.number().optional(),
    pmL: z.number().optional(),
    pmB: z.number().optional(),
    raStr: z.string().optional(),
    decStr: z.string().optional(),
    pmRa: z.number().optional(),
    pmDec: z.number().optional(),
    parallax: z.number().optional(),
    epoch: z.number().optional(),
    pointingPattern: z
      .object({
        active: z.string(),
        parameters: z.array(pointingPatternParamsSchema)
      })
      .optional()
  });
}

export function getTargetsSchema() {
  return z.array(getTargetSchema());
}

export type TargetsType = z.input<ReturnType<typeof getTargetsSchema>>;
