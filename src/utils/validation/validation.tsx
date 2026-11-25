import { getSubmitPageStatuses } from '@/models/proposals/submit';
import { getProposalFormValues } from '@/models/proposals/useProposalForm';
import { z } from 'zod';
import Observation from '../types/observation';
import {
  FREQUENCY_GHZ,
  FREQUENCY_HZ,
  FREQUENCY_MHZ,
  INTEGRATION_TIME_UNITS,
  PROPOSAL_TYPE,
  SENSITIVITY_UNITS,
  STATUS_ERROR,
  STATUS_OK,
  STATUS_PARTIAL,
  SUPPLIED_INTEGRATION_TIME_MAX_HOURS,
  SUPPLIED_TYPE_INTEGRATION,
  SUPPLIED_TYPE_SENSITIVITY,
  TELESCOPE_LOW_NUM,
  TIME_HOURS,
  TYPE_ZOOM,
  ZOOM_BANDWIDTH_DEFAULT_LOW,
  ZOOM_CHANNELS_DEFAULT_LOW
} from './../constants';
import Proposal from './../types/proposal';
import { frequencyConversion, isFrequencyRangeOutOfBand, timeConversion } from '../helpers';
import { useOSDAccessors } from '../osd/useOSDAccessors/useOSDAccessors';
import { getTitleSchema } from '../../models/proposals/title';
import {
  channelsToBandwidthHz,
  getZoomResolutionHz,
  isCentralFrequencyDivisible,
  isCentralFrequencyOnChannelGrid
} from '../zoomWindow';
import { getDetailsSchema } from '@/models/proposals/details';

type SuppliedValueInput = {
  type?: number;
  value?: number;
  units?: number;
};

const numberLiteralEnum = <T extends number>(values: readonly T[]) => {
  if (values.length === 0) {
    throw new Error('Unit enum must define at least one allowed value.');
  }
  return z.union(
    values.map((value) => z.literal(value)) as [z.ZodLiteral<T>, ...z.ZodLiteral<T>[]]
  );
};

const integrationUnitSchema = numberLiteralEnum(INTEGRATION_TIME_UNITS.map((unit) => unit.id));
const sensitivityUnitSchema = numberLiteralEnum(SENSITIVITY_UNITS.map((unit) => unit.id));

const suppliedValueBaseSchema = z.object({
  value: z.number().gt(0)
});
const suppliedIntegrationSchema = suppliedValueBaseSchema
  .extend({
    type: z.literal(SUPPLIED_TYPE_INTEGRATION),
    units: integrationUnitSchema
  })
  .superRefine((supplied, ctx) => {
    const maxValue = timeConversion(
      SUPPLIED_INTEGRATION_TIME_MAX_HOURS,
      TIME_HOURS,
      supplied.units
    );
    if (supplied.value > maxValue) {
      ctx.addIssue({
        code: 'custom',
        message: `Supplied value must be <= ${maxValue} for selected unit.`
      });
    }
  });
const suppliedSensitivitySchema = suppliedValueBaseSchema.extend({
  type: z.literal(SUPPLIED_TYPE_SENSITIVITY),
  units: sensitivityUnitSchema
});

export const suppliedValueSchema = z.union([suppliedIntegrationSchema, suppliedSensitivitySchema]);

export const isSuppliedValueValid = (supplied: SuppliedValueInput): boolean =>
  suppliedValueSchema.safeParse(supplied).success;

export const validateTitlePage = (proposal: Pick<Proposal, 'title' | 'proposalType'>) => {
  if (!getTitleSchema().safeParse(proposal?.title ?? '').success) {
    return STATUS_ERROR;
  }
  const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
  let count = 0;
  if (proposal?.title?.length > 0) {
    count++;
  }
  if (proposal?.proposalType) {
    count++;
  }
  return result[count];
};

export const validateTeamPage = (proposal: Pick<Proposal, 'investigators'>) => {
  const result = [STATUS_ERROR, STATUS_OK];
  const count = Array.isArray(proposal.investigators) && proposal.investigators.length > 0 ? 1 : 0;
  return result[count];
};

export const validateDetailsPage = (proposal: Proposal) => {
  const abstract = proposal?.abstract ?? '';
  if (abstract.length > 0 && !getDetailsSchema().shape.abstract.safeParse(abstract).success) {
    return STATUS_ERROR;
  }
  const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
  let count = 0;

  if ((proposal?.abstract ?? '').length > 0) {
    count++;
  }
  const hasCategoryOrMode =
    proposal?.proposalType === PROPOSAL_TYPE.SCIENCE_VERIFICATION
      ? (proposal?.observations?.length ?? 0) > 0
      : proposal?.scienceCategory !== null;
  if (hasCategoryOrMode) {
    count++;
  }
  return result[count];
};

export const validateSciencePage = (proposal: Proposal) => {
  const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
  let count = proposal?.sciencePDF && typeof proposal?.sciencePDF === 'object' ? 1 : 0;
  count += count && proposal?.sciencePDF?.isUploadedPdf ? 1 : 0;
  return result[count];
};

const hasValidSuppliedValue = (observation: Observation): boolean => {
  const supplied = observation?.supplied;
  return isSuppliedValueValid({
    type: supplied?.type,
    value: supplied?.value,
    units: supplied?.units
  });
};

export const validateObservationPage = (proposal: Proposal) => {
  const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
  const hasObservations = () =>
    Array.isArray(proposal?.observations) && proposal.observations.length > 0;
  const hasSuppliedErrors = () =>
    (proposal?.observations ?? []).some((obs) => !hasValidSuppliedValue(obs));

  const count = hasObservations() && !hasSuppliedErrors() ? 2 : 0;
  return result[count];
};

// Only the "centre frequency ± bandwidth spills past the band edge" check - deliberately does
// not also check the channel-grid/divisibility constraint (isCentralFrequencyOnChannelGrid /
// isCentralFrequencyDivisible), which is a different failure kind. Callers that need that too
// (e.g. useIsObservationFrequencyOutOfRange below) check it explicitly and separately, rather
// than this hook folding both into one boolean and forcing every caller to show the same
// "out of range" wording for either failure.
export const useIsFrequencyOutOfRange = () => {
  const { osdLOW, osdMID } = useOSDAccessors();

  return (
    centralFrequency: number,
    bandwidth: number,
    isLow: boolean,
    observingBand: string
  ): boolean => {
    let minHz: number;
    let maxHz: number;

    if (isLow) {
      minHz = osdLOW?.basicCapabilities?.minFrequencyHz ?? 0;
      maxHz = osdLOW?.basicCapabilities?.maxFrequencyHz ?? 0;
    } else {
      const receiver = osdMID?.basicCapabilities?.receiverInformation?.find(
        (e: any) => e.rxId === observingBand
      );
      minHz = receiver?.minFrequencyHz ?? 0;
      maxHz = receiver?.maxFrequencyHz ?? 0;
    }

    const targetUnits = isLow ? FREQUENCY_MHZ : FREQUENCY_GHZ;
    // Compare in Hz, rounded to the nearest Hz, rather than converting minHz/maxHz into
    // MHz/GHz first - minFrequencyHz/maxFrequencyHz are no longer pre-rounded to a clean MHz
    // boundary (see getOSDCycles.tsx), and a GHz round-trip only keeps ~1000 Hz of precision at
    // 6 d.p., which that prior rounding used to mask.
    const centralFrequencyHz = Math.round(
      frequencyConversion(centralFrequency, targetUnits, FREQUENCY_HZ)
    );
    const bandwidthHz = Math.round(frequencyConversion(bandwidth, targetUnits, FREQUENCY_HZ));
    return isFrequencyRangeOutOfBand(centralFrequencyHz, bandwidthHz, minHz, maxHz);
  };
};

export const useIsObservationFrequencyOutOfRange = () => {
  const isFrequencyOutOfRange = useIsFrequencyOutOfRange();
  const { osdLOW } = useOSDAccessors();

  return (obs: Observation): boolean => {
    const isLow = obs.telescope === TELESCOPE_LOW_NUM;
    const isZoom = obs.type === TYPE_ZOOM;
    // Matches ObservationEntry.tsx's own load-time fallback - a resolution-mode index of 0
    // matches no real entry, so getZoomResolutionHz would silently return a 0 Hz channel width
    // that the grid checks below then treat as "always on-grid" instead of actually unavailable.
    const channelWidthHz =
      isLow && isZoom ? getZoomResolutionHz(obs.bandwidth ?? ZOOM_BANDWIDTH_DEFAULT_LOW) : 0;
    // Matches ObservationEntry.tsx's own load-time fallback - a saved observation predating
    // zoomChannels must resolve to the same legacy default the editor would show, not a
    // zero-width window that produces a different validity grid.
    const windowBandwidthHz =
      isLow && isZoom
        ? channelsToBandwidthHz(obs.zoomChannels ?? ZOOM_CHANNELS_DEFAULT_LOW, channelWidthHz)
        : 0;
    // For LOW zoom, obs.bandwidth is a resolution-mode index, not a real bandwidth - use the
    // actual channel-count-derived window bandwidth for the range check too (MID zoom unaffected,
    // out of scope, matching ObservationEntry.tsx's own showWarning()).
    const bandwidth = isZoom
      ? isLow
        ? frequencyConversion(windowBandwidthHz, FREQUENCY_HZ, FREQUENCY_MHZ)
        : (obs.bandwidth ?? 0)
      : (obs.continuumBandwidth ?? 0);

    if (
      isFrequencyOutOfRange(obs.centralFrequency, bandwidth, isLow, String(obs.observingBand ?? ''))
    ) {
      return true;
    }

    // The channel-grid/divisibility constraint is LOW-only, matching centralFrequency.tsx's own
    // validation (see isCentralFrequencyOnChannelGrid/isCentralFrequencyDivisible there).
    if (!isLow) return false;

    const minHz = osdLOW?.basicCapabilities?.minFrequencyHz ?? 0;
    const centralFrequencyHz = Math.round(
      frequencyConversion(obs.centralFrequency, FREQUENCY_MHZ, FREQUENCY_HZ)
    );

    if (isZoom) {
      return !isCentralFrequencyOnChannelGrid(
        centralFrequencyHz,
        channelWidthHz,
        windowBandwidthHz,
        minHz
      );
    }

    const coarseChannelWidthHz = osdLOW?.basicCapabilities?.coarseChannelWidthHz ?? 0;
    return !isCentralFrequencyDivisible(centralFrequencyHz, coarseChannelWidthHz);
  };
};

export const validateTechnicalPage = (proposal: Proposal) => {
  const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
  let count = proposal?.technicalPDF && typeof proposal?.technicalPDF === 'object' ? 1 : 0;
  count += count && proposal?.technicalPDF?.isUploadedPdf ? 1 : 0;
  return result[count];
};

export const useValidateProposal = () => {
  const isObservationFrequencyOutOfRange = useIsObservationFrequencyOutOfRange();

  return (proposal: Proposal) => {
    const obsStatus = validateObservationPage(proposal);
    const freqOutOfRange = (proposal.observations ?? []).some((obs) =>
      isObservationFrequencyOutOfRange(obs)
    );
    // The Target, Linking, Calibration and Data Products pages are checked by the
    // submit schema, over the given proposal's values for them (which may not be
    // the proposal open in the form)
    const submitStatuses = getSubmitPageStatuses(getProposalFormValues(proposal));
    return [
      validateTitlePage(proposal),
      validateTeamPage(proposal),
      validateDetailsPage(proposal),
      validateSciencePage(proposal),
      submitStatuses.target,
      obsStatus === STATUS_OK && freqOutOfRange ? STATUS_ERROR : obsStatus,
      validateTechnicalPage(proposal),
      submitStatuses.dataProducts,
      submitStatuses.linking,
      submitStatuses.calibration
    ];
  };
};

/** The codes the sky direction and radial motion checks return when a value is wrong. */
export const VALUE_ERROR = { FORMAT: '0', RANGE: '1' } as const;
export type ValueError = (typeof VALUE_ERROR)[keyof typeof VALUE_ERROR];

export function validateRightAscension(value: string): ValueError | null {
  const formatValid = /^\+?\d{1,2}:\d{2}:\d{2}((\.?)|(\.\d+\s+|\.\d+))$/.test(value);
  if (!formatValid) {
    return VALUE_ERROR.FORMAT;
  }
  const arr = value.split(':');
  if (arr?.length !== 3) {
    return VALUE_ERROR.FORMAT;
  }
  if (Number(arr[0]) > 24) {
    return VALUE_ERROR.RANGE;
  }
  if (Number(arr[1]) > 59) {
    return VALUE_ERROR.FORMAT;
  }
  if (Number(arr[2]) >= 60) {
    return VALUE_ERROR.FORMAT;
  }
  if (Number(arr[0]) === 24 && (Number(arr[1]) > 0 || Number(arr[2]) > 0)) {
    return VALUE_ERROR.RANGE;
  }
  return null;
}

export function validateDeclination(value: string): ValueError | null {
  const formatValid = /^[-+]?\d{1,2}:\d{2}:\d{2}((\.?)|(\.\d+\s+|\.\d+))$/.test(value);
  if (!formatValid) {
    return VALUE_ERROR.FORMAT;
  }

  const arr = value.split(':');
  if (arr.length !== 3) {
    return VALUE_ERROR.FORMAT;
  }

  const hours = Number(arr[0]);
  const minutes = Number(arr[1]);
  const seconds = Number(arr[2].split('.')[0]);

  if (Math.abs(hours) > 90 || (Math.abs(hours) === 90 && (minutes > 0 || seconds > 0))) {
    return VALUE_ERROR.RANGE;
  }

  // explicitly treat these as a format rather than a range error
  // because they are not valid in the context of sky direction
  if (minutes > 59) {
    return VALUE_ERROR.FORMAT;
  }
  if (seconds > 59) {
    return VALUE_ERROR.FORMAT;
  }
  return null;
}

export function validateRadialMotion(value: string): ValueError | null {
  if (!/^[-+]?[0-9]*\.?[0-9]+$/.test(value)) {
    return VALUE_ERROR.FORMAT;
  }

  return null;
}
