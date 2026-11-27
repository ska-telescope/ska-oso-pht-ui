import { describe, it, expect, test, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { PAGE_OBSERVATION, PROPOSAL_TYPE, STATUS_ERROR, STATUS_OK } from '../constants';
import { useValidateProposal, validateDetailsPage, validateTitlePage } from './validation';
import { getProposalFormDefaults } from '@/models/proposals/useProposalForm';
import { newSvObservation, OBSERVING_MODE } from '@/models/proposals/observations';

vi.mock('../osd/useOSDAccessors/useOSDAccessors', async () => {
  const { MockObservatoryDataFrontend } =
    await import('@services/axios/get/getObservatoryData/mockObservatoryDataFrontend');
  return {
    useOSDAccessors: () => ({
      osdLOW: MockObservatoryDataFrontend.capabilities.low,
      osdMID: MockObservatoryDataFrontend.capabilities.mid
    })
  };
});

describe('useValidateProposal', () => {
  const observation = newSvObservation(OBSERVING_MODE.CONTINUUM, 15);
  const validate = () => renderHook(() => useValidateProposal()).result.current;

  // The form has every observation, including invalid ones the store has no copy of
  test.each([
    ['valid', observation, STATUS_OK],
    [
      'outside its band',
      { ...observation, centralFrequency: { value: 400, unit: 'MHz' } },
      STATUS_ERROR
    ]
  ] as const)(
    'gives the Observations page of form values with an observation %s its status',
    (_, formObservation, status) => {
      const values = { ...getProposalFormDefaults(), observations: [formObservation] };
      expect(validate()(values)[PAGE_OBSERVATION]).toBe(status);
    }
  );
});

describe('validateTitlePage', () => {
  it('returns STATUS_ERROR for titles with unsupported characters', () => {
    expect(
      validateTitlePage({
        title: 'A proposal with @',
        proposalType: { type: PROPOSAL_TYPE.STANDARD, subTypes: [] }
      })
    ).toBe(STATUS_ERROR);
  });

  it.each([
    ['a title and a proposal type', 'A proposal', PROPOSAL_TYPE.STANDARD, STATUS_OK],
    ['no proposal type', 'A proposal', null, STATUS_ERROR],
    ['no title', '', PROPOSAL_TYPE.STANDARD, STATUS_ERROR]
  ] as const)('is complete only with both: %s', (_, title, proposalType, status) => {
    expect(validateTitlePage({ title, proposalType: { type: proposalType, subTypes: [] } })).toBe(
      status
    );
  });
});

describe('validateDetailsPage', () => {
  const observation = newSvObservation(OBSERVING_MODE.CONTINUUM, 15);
  const standard: Parameters<typeof validateDetailsPage>[0] = {
    proposalType: { type: PROPOSAL_TYPE.STANDARD, subTypes: [] },
    abstract: 'An abstract',
    scienceCategory: 1,
    observations: []
  };

  it.each([2300, 2301])('checks the Zod character limit at %s characters', (length) => {
    expect(validateDetailsPage({ ...standard, abstract: 'a'.repeat(length) })).toBe(
      length === 2300 ? STATUS_OK : STATUS_ERROR
    );
  });

  it('requires an abstract and a science category for standard proposals', () => {
    expect(validateDetailsPage(standard)).toBe(STATUS_OK);
    expect(validateDetailsPage({ ...standard, scienceCategory: null })).toBe(STATUS_ERROR);
  });

  it('requires an abstract and an observation (the observing mode) for SV proposals', () => {
    const sv = {
      ...standard,
      proposalType: { type: PROPOSAL_TYPE.SCIENCE_VERIFICATION, subTypes: [] },
      scienceCategory: null
    };
    expect(validateDetailsPage({ ...sv, observations: [observation] })).toBe(STATUS_OK);
    expect(validateDetailsPage(sv)).toBe(STATUS_ERROR);
    expect(validateDetailsPage({ ...sv, abstract: '' })).toBe(STATUS_ERROR);
  });
});
