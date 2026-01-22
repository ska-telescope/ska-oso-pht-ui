import {
  SDPFilterbankPSTData,
  SDPFlowthroughPSTData,
  SDPImageContinuumData,
  SDPSpectralData,
  SDPVisibilitiesContinuumData
} from '../types/dataProduct';
import {
  DETECTED_FILTER_BANK_VALUE,
  FLOW_THROUGH_VALUE,
  PAGE_DATA_PRODUCTS,
  PAGE_OBSERVATION,
  PULSAR_TIMING_VALUE,
  STATUS_ERROR,
  STATUS_OK,
  STATUS_PARTIAL,
  TYPE_CONTINUUM,
  TYPE_PST,
  TYPE_ZOOM
} from './../constants';
import Proposal from './../types/proposal';

export const validateTitlePage = (proposal: Proposal) => {
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
    let count = hasTargetObservations() ? 2 : 0;
    return result[count];
  } else {
    let count = hasObservations() ? 2 : 0;
    return result[count];
  }
};

export const validateTechnicalPage = (proposal: Proposal) => {
  const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
  let count = proposal?.technicalPDF && typeof proposal?.technicalPDF === 'object' ? 1 : 0;
  count += count && proposal?.technicalPDF?.isUploadedPdf ? 1 : 0;
  return result[count];
};

export const checkDP = (proposal: Proposal) => {
  const hasTargetObservations = () => (proposal?.targetObservation?.length ?? 0) > 0;

  if (hasTargetObservations()) {
    //based on observing type verify data products fields
    switch (
      proposal.scienceCategory // TODO: update validation to handle observation types instead?
    ) {
      case TYPE_ZOOM: //Spectral
        return validateSpectralDataProduct(proposal) ? 1 : 0;
      case TYPE_CONTINUUM: //Continuum
        return validateContinuumDataProduct(proposal) ? 1 : 0;
      case TYPE_PST: //PST
        return validatePSTDataProduct(proposal) ? 1 : 0;
    }
  } else {
    return 0;
  }
};

export const validateSDPPage = (proposal: Proposal, autoLink: boolean) => {
  const result = [STATUS_ERROR, STATUS_OK];

  if (autoLink) {
    let count = checkDP(proposal) ? 1 : 0;
    return result[count];
  } else {
    let count =
      Array.isArray(proposal?.dataProductSDP) && proposal.dataProductSDP.length > 0 ? 1 : 0;
    return result[count];
  }
};

export const validateSRCPage = () => STATUS_OK;

export const validateCalibrationPage = (proposal: Proposal) => {
  const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
  let count = proposal?.calibrationStrategy?.length > 0 ? 2 : 0;
  return result[count];
};

export const validateLinkingPage = (proposal: Proposal) => {
  const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
  const hasTargetObservations = () => (proposal?.targetObservation?.length ?? 0) > 0;
  let count = hasTargetObservations() ? 2 : 0;
  return result[count];
};

export const validateProposal = (proposal: Proposal, autoLink: boolean) => {
  return [
    validateTitlePage(proposal),
    validateTeamPage(proposal),
    validateDetailsPage(proposal),
    validateSciencePage(proposal),
    validateTargetPage(proposal),
    validateObservationPage(proposal, autoLink),
    validateTechnicalPage(proposal),
    validateSDPPage(proposal, autoLink),
    validateLinkingPage(proposal),
    validateCalibrationPage(proposal)
    // See SRCNet INACTIVE - validateSRCPage()
  ];
};

export const validateProposalNavigation = (proposal: Proposal, page: number, checkLink = false) => {
  if (checkLink && (page === PAGE_OBSERVATION || page === PAGE_DATA_PRODUCTS)) {
    return (
      proposal.scienceCategory === TYPE_CONTINUUM ||
      proposal.scienceCategory === TYPE_PST ||
      proposal.scienceCategory === TYPE_ZOOM
    );
  }
  return true;
};

export function validateSkyDirection1Text(value: string): boolean {
  const formatValid = /^[-+]?\d{1,2}:\d{2}:\d{2}((\.?)|(\.\d+))$/.test(value);
  if (!formatValid) {
    return false;
  }
  const arr = value.split(':');
  if (arr?.length !== 3) {
    return false;
  }
  if (Math.abs(Number(arr[0])) > 24) {
    return false;
  }
  if (Number(arr[1]) > 59) {
    return false;
  }
  if (Number(arr[2]) >= 60) {
    return false;
  }
  return !(Number(arr[0]) === 24 && (Number(arr[1]) > 0 || Number(arr[2]) > 0));
}

export function validateSkyDirection1Number(value: string): boolean {
  // Validate its a valid number
  if (!/^[0-9]*\.?[0-9]+$/.test(value)) {
    return false;
  }
  const number = parseFloat(value);
  // Validate decimal right ascension range.
  return number >= 0 && number < 360;
}

export function validateSkyDirection2Text(value: string): string | null {
  const formatValid = /^[-+]?\d{1,2}:\d{2}:\d{2}(\.\d+)?$/.test(value);
  if (!formatValid) {
    return '0';
  }

  const arr = value.split(':');
  if (arr.length !== 3) {
    return '0';
  }

  const hours = Number(arr[0]);
  const minutes = Number(arr[1]);
  const seconds = Number(arr[2].split('.')[0]); // Ignore fractional part for range check

  if (Math.abs(hours) > 90 || (Math.abs(hours) === 90 && (minutes > 0 || seconds > 0))) {
    return '1';
  }
  if (minutes > 59) {
    return '1';
  }
  if (seconds >= 59) {
    return '1';
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

export const validateSpectralDataProduct = (proposal: Proposal) => {
  //TODO: STAR-1854 - extend validation to account for multiple data products
  const dataProduct = proposal.dataProductSDP?.[0];
  if (dataProduct) {
    const data = dataProduct?.data as SDPSpectralData;
    return (
      data?.imageSizeValue != null &&
      data?.imageSizeUnits != null &&
      data?.pixelSizeValue != null &&
      data?.pixelSizeUnits != null &&
      data?.weighting != null &&
      data?.taperValue != null &&
      data?.channelsOut != null &&
      data?.continuumSubtraction !== undefined &&
      data?.polarisations?.length > 0
    );
  } else {
    return false;
  }
};

export const validateContinuumDataProduct = (proposal: Proposal) => {
  //TODO: STAR-1854 - extend validation to account for multiple data products
  const dataProduct = proposal.dataProductSDP?.[0];
  if (dataProduct) {
    if (
      (dataProduct?.data as SDPImageContinuumData | SDPVisibilitiesContinuumData)
        ?.dataProductType === 1
    ) {
      const data = dataProduct?.data as SDPImageContinuumData;
      return (
        data?.imageSizeValue != null &&
        data?.imageSizeUnits != null &&
        data?.pixelSizeValue != null &&
        data?.pixelSizeUnits != null &&
        data?.weighting != null &&
        data?.taperValue != null &&
        data?.channelsOut != null &&
        data?.polarisations?.length > 0
      );
    } else {
      const data = dataProduct?.data as SDPVisibilitiesContinuumData;
      return data?.timeAveraging != null && data?.frequencyAveraging != null;
    }
  } else {
    return false;
  }
};

export const validatePSTDataProduct = (proposal: Proposal) => {
  //TODO: STAR-1854 - extend validation to account for multiple data products
  const dataProduct = proposal.dataProductSDP?.[0];
  if (dataProduct) {
    switch (proposal.observations?.[0].pstMode) {
      case FLOW_THROUGH_VALUE:
        const dataFT = dataProduct?.data as SDPFlowthroughPSTData;
        return dataFT?.bitDepth != null && dataFT?.polarisations?.length > 0;
      case DETECTED_FILTER_BANK_VALUE:
        const dataFB = dataProduct?.data as SDPFilterbankPSTData;
        return (
          // dataFB?.timeAveraging != null &&
          // dataFB?.frequencyAveraging != null &&
          // TODO use new fields instead when SDP fields are updated on SDP page (outputFrequencyResolution, outputSamplingInterval, dispersionMeasure, rotationMeasure)
          dataFB?.bitDepth != null && dataFB?.polarisations?.length > 0
        );
      case PULSAR_TIMING_VALUE:
        return true; // no visible fields to verify
    }
  } else {
    return false;
  }
};
