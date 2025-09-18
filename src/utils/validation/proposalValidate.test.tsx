import { expect } from 'vitest';
import { STATUS_ERROR, STATUS_PARTIAL, STATUS_OK } from '../constants';
import {
  validateTitlePage,
  validateTeamPage,
  validateGeneralPage,
  validateSciencePage,
  validateTargetPage,
  validateObservationPage,
  validateTechnicalPage,
  validateSDPPage,
  validateSRCPage,
  validateProposal
} from './proposalValidation';

describe('Proposal Validation Functions', () => {
  const baseProposal = {
    id: 'mock-id',
    status: 'draft',
    lastUpdated: new Date().toISOString(),
    lastUpdatedBy: 'mock-user',
    createdBy: 'mock-user',
    submittedDate: null,
    panelId: null,
    createdOn: new Date().toISOString(),
    version: 1,
    cycle: '2025A', // or whatever format your system expects
    title: '',
    proposalType: 0,
    investigators: [],
    abstract: '',
    scienceCategory: 0,
    sciencePDF: null,
    targets: [],
    observations: [],
    targetObservation: [],
    technicalPDF: null,
    dataProductSDP: []
  };

  it('validateTitlePage returns correct status', () => {
    expect(validateTitlePage(baseProposal)).toBe(STATUS_ERROR);

    expect(validateTitlePage({ ...baseProposal, title: 'A', proposalType: 0 })).toBe(
      STATUS_PARTIAL
    );
    expect(validateTitlePage({ ...baseProposal, title: 'A', proposalType: 1 })).toBe(STATUS_OK);
  });

  it('validateTeamPage returns correct status', () => {
    expect(validateTeamPage(baseProposal)).toBe(STATUS_ERROR);
    expect(validateTeamPage({ ...baseProposal, investigators: [] })).toBe(STATUS_ERROR);
  });

  it('validateGeneralPage returns correct status', () => {
    expect(validateGeneralPage(baseProposal)).toBe(STATUS_ERROR);
    expect(validateGeneralPage({ ...baseProposal, abstract: 'abc' })).toBe(STATUS_PARTIAL);
    expect(validateGeneralPage({ ...baseProposal, abstract: 'abc', scienceCategory: 1 })).toBe(
      STATUS_OK
    );
  });

  it('validateSciencePage returns correct status', () => {
    expect(validateSciencePage(baseProposal)).toBe(STATUS_ERROR);
    expect(validateSciencePage({ ...baseProposal, sciencePDF: {} })).toBe(STATUS_PARTIAL);
    expect(validateSciencePage({ ...baseProposal, sciencePDF: { isUploadedPdf: true } })).toBe(
      STATUS_OK
    );
  });

  it('validateTargetPage returns correct status', () => {
    expect(validateTargetPage(baseProposal)).toBe(STATUS_ERROR);
    expect(validateTargetPage({ ...baseProposal, targets: [] })).toBe(STATUS_ERROR);
  });

  it('validateObservationPage returns correct status', () => {
    expect(validateObservationPage(baseProposal)).toBe(STATUS_ERROR);
    expect(validateObservationPage({ ...baseProposal, observations: [] })).toBe(STATUS_ERROR);
    expect(
      validateObservationPage({ ...baseProposal, observations: [], targetObservation: [] })
    ).toBe(STATUS_ERROR);
  });

  it('validateTechnicalPage returns correct status', () => {
    expect(validateTechnicalPage(baseProposal)).toBe(STATUS_ERROR);
    expect(validateTechnicalPage({ ...baseProposal, technicalPDF: {} })).toBe(STATUS_PARTIAL);
    expect(validateTechnicalPage({ ...baseProposal, technicalPDF: { isUploadedPdf: true } })).toBe(
      STATUS_OK
    );
  });

  it('validateSDPPage returns correct status', () => {
    expect(validateSDPPage(baseProposal)).toBe(STATUS_ERROR);
    expect(validateSDPPage({ ...baseProposal, dataProductSDP: [] })).toBe(STATUS_ERROR);
  });

  it('validateSRCPage always returns STATUS_OK', () => {
    expect(validateSRCPage()).toBe(STATUS_OK);
  });

  it('validateProposal returns array of statuses', () => {
    const result = validateProposal(baseProposal);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(9);
    expect(result.every(status => [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK].includes(status))).toBe(
      true
    );
  });
});
