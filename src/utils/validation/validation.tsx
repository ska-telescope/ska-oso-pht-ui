import {
  DataProductSDPNew,
  SDPFilterbankPSTData,
  SDPFlowthroughPSTData,
  SDPImageContinuumData,
  SDPSpectralData,
  SDPVisibilitiesContinuumData
} from '../types/dataProduct';
import Observation from '../types/observation';
import {
  DETECTED_FILTER_BANK_VALUE,
  DP_TYPE_IMAGES,
  FLOW_THROUGH_VALUE,
  FREQUENCY_GHZ,
  FREQUENCY_HZ,
  FREQUENCY_MHZ,
  PAGE_CALIBRATION,
  PAGE_DATA_PRODUCTS,
  PAGE_OBSERVATION,
  STATUS_ERROR,
  STATUS_OK,
  STATUS_PARTIAL,
  TELESCOPE_LOW_NUM,
  TYPE_CONTINUUM,
  TYPE_PST,
  TYPE_ZOOM,
  ZOOM_BANDWIDTH_DEFAULT_LOW,
  ZOOM_CHANNELS_DEFAULT_LOW
} from './../constants';
import Proposal from './../types/proposal';
import { countWords, frequencyConversion, isFrequencyRangeOutOfBand } from '../helpers';
import { useOSDAccessors } from '../osd/useOSDAccessors/useOSDAccessors';
import {
  channelsToBandwidthHz,
  getZoomResolutionHz,
  isCentralFrequencyDivisible,
  isCentralFrequencyOnChannelGrid
} from '../zoomWindow';
import phtTranslations from '../../../public/locales/en/pht.json';

export const validateTitlePage = (proposal: Proposal) => {
  const maxTitleWords = Number(phtTranslations.title.maxWord);
  if (countWords(proposal?.title ?? '') > maxTitleWords) {
    return STATUS_ERROR;
  }
  const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
  let count = 0;
  if (proposal?.title?.length > 0) {
    count++;
  }
  if (proposal?.proposalType !== 0) {
    count++;
  }
  return result[count];
};

export const validateTeamPage = (proposal: Proposal) => {
  const result = [STATUS_ERROR, STATUS_OK];
  const count = Array.isArray(proposal.investigators) && proposal.investigators.length > 0 ? 1 : 0;
  return result[count];
};

export const validateDetailsPage = (proposal: Proposal) => {
  const maxAbstractWords = Number(phtTranslations.abstract.maxWord);
  if (countWords(proposal?.abstract ?? '') > maxAbstractWords) {
    return STATUS_ERROR;
  }
  const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
  let count = 0;

  if ((proposal?.abstract ?? '').length > 0) {
    count++;
  }
  if (proposal?.scienceCategory !== null) {
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

export const validateTargetPage = (proposal: Proposal) =>
  proposal?.targets?.length ? STATUS_OK : STATUS_ERROR;

export const validateObservationPage = (proposal: Proposal, autoLink: boolean) => {
  const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
  const hasObservations = () =>
    Array.isArray(proposal?.observations) && proposal.observations.length > 0;

  const hasTargetObservations = () => (proposal?.targetObservation?.length ?? 0) > 0;

  if (autoLink) {
    const count = hasTargetObservations() ? 2 : 0;
    return result[count];
  } else {
    const count = hasObservations() ? 2 : 0;
    return result[count];
  }
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
    let minHz = 0;
    let maxHz = 0;

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

export const checkDP = (proposal: Proposal): number => {
  const validatePolarisations = (
    data: SDPSpectralData | SDPImageContinuumData | SDPFilterbankPSTData | SDPFlowthroughPSTData
  ): number => (data?.polarisations?.length > 0 ? 1 : 0);

  const hasTargetObservations = () => (proposal?.targetObservation?.length ?? 0) > 0;

  if (
    hasTargetObservations() &&
    proposal.observations?.[0] &&
    proposal.dataProductSDP &&
    proposal.dataProductSDP?.length > 0
  ) {
    const dataProduct = proposal.dataProductSDP?.[0] as DataProductSDPNew;
    switch (proposal.scienceCategory) {
      case TYPE_ZOOM:
        return validatePolarisations(dataProduct.data as SDPSpectralData);
      case TYPE_CONTINUUM:
        return (dataProduct?.data as SDPImageContinuumData | SDPVisibilitiesContinuumData)
          ?.dataProductType === DP_TYPE_IMAGES
          ? validatePolarisations(dataProduct.data as SDPImageContinuumData)
          : 1;
      case TYPE_PST:
        const observation = proposal.observations?.[0] as Observation;
        return observation.pstMode === FLOW_THROUGH_VALUE ||
          observation.pstMode === DETECTED_FILTER_BANK_VALUE
          ? validatePolarisations(dataProduct.data as SDPFlowthroughPSTData | SDPFilterbankPSTData)
          : 1;
    }
  }
  return 0;
};

export const validateSDPPage = (proposal: Proposal) => {
  const result = [STATUS_ERROR, STATUS_OK];
  const count =
    Array.isArray(proposal?.dataProductSDP) && proposal.dataProductSDP.length > 0 ? 1 : 0;
  return result[count];
};

export const validateSRCPage = () => STATUS_OK;

export const validateCalibrationPage = (proposal: Proposal) => {
  const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
  const count = proposal?.calibrationStrategy?.length > 0 ? 2 : 0;
  return result[count];
};

export const validateLinkingPage = (proposal: Proposal) => {
  const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
  const hasTargetObservations = () => (proposal?.targetObservation?.length ?? 0) > 0;
  const count = hasTargetObservations() ? 2 : 0;
  return result[count];
};

export const useValidateProposal = () => {
  const { autoLink } = useOSDAccessors();
  const isObservationFrequencyOutOfRange = useIsObservationFrequencyOutOfRange();

  return (proposal: Proposal) => {
    const obsStatus = validateObservationPage(proposal, autoLink);
    const freqOutOfRange = (proposal.observations ?? []).some((obs) =>
      isObservationFrequencyOutOfRange(obs)
    );
    return [
      validateTitlePage(proposal),
      validateTeamPage(proposal),
      validateDetailsPage(proposal),
      validateSciencePage(proposal),
      validateTargetPage(proposal),
      obsStatus === STATUS_OK && freqOutOfRange ? STATUS_ERROR : obsStatus,
      validateTechnicalPage(proposal),
      validateSDPPage(proposal),
      validateLinkingPage(proposal),
      validateCalibrationPage(proposal)
      /* See SRCNet INACTIVE - validateSRCPage() */
    ];
  };
};

export const validateProposalNavigation = (proposal: Proposal, page: number, checkLink = false) => {
  if (
    checkLink &&
    (page === PAGE_OBSERVATION || page === PAGE_DATA_PRODUCTS || page === PAGE_CALIBRATION)
  ) {
    return (
      (proposal.scienceCategory === TYPE_CONTINUUM ||
        proposal.scienceCategory === TYPE_PST ||
        proposal.scienceCategory === TYPE_ZOOM) &&
      Array.isArray(proposal?.targets) &&
      proposal.targets.length > 0
    );
  }
  return true;
};

export function validateSkyDirection1Text(value: string): string | null {
  const formatValid = /^\+?\d{1,2}:\d{2}:\d{2}((\.?)|(\.\d+\s+|\.\d+))$/.test(value);
  if (!formatValid) {
    return '0';
  }
  const arr = value.split(':');
  if (arr?.length !== 3) {
    return '0';
  }
  if (Number(arr[0]) > 24) {
    return '1';
  }
  if (Number(arr[1]) > 59) {
    return '0';
  }
  if (Number(arr[2]) >= 60) {
    return '0';
  }
  if (Number(arr[0]) === 24 && (Number(arr[1]) > 0 || Number(arr[2]) > 0)) {
    return '1';
  }
  return null;
}

export function validateSkyDirection1Number(value: string): boolean {
  if (!/^[0-9]*\.?[0-9]+$/.test(value)) {
    return false;
  }
  const number = parseFloat(value);
  return number >= 0 && number < 360;
}

export function validateSkyDirection2Text(value: string): string | null {
  const formatValid = /^[-+]?\d{1,2}:\d{2}:\d{2}((\.?)|(\.\d+\s+|\.\d+))$/.test(value);
  if (!formatValid) {
    return '0';
  }

  const arr = value.split(':');
  if (arr.length !== 3) {
    return '0';
  }

  const hours = Number(arr[0]);
  const minutes = Number(arr[1]);
  const seconds = Number(arr[2].split('.')[0]);

  if (Math.abs(hours) > 90 || (Math.abs(hours) === 90 && (minutes > 0 || seconds > 0))) {
    return '1';
  }

  // explicitly treat these as a format rather than a range error
  // because they are not valid in the context of sky direction
  if (minutes > 59) {
    return '0';
  }
  if (seconds > 59) {
    return '0';
  }
  return null;
}

export function validateSkyDirection2Number(value: string): string | null {
  if (!/^[-+]?[0-9]*\.?[0-9]+$/.test(value)) {
    return '0';
  }

  if (parseFloat(value) < -90 || parseFloat(value) > 90) {
    return '1';
  }
  return null;
}

export function validateRadialMotion(value: string): string | null {
  if (!/^[-+]?[0-9]*\.?[0-9]+$/.test(value)) {
    return '0';
  }

  return null;
}
