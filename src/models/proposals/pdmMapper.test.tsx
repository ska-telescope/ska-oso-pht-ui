import { describe, expect, test } from 'vitest';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import { MockProposalBackend } from '@services/axios/get/getProposal/mockProposalBackend.tsx';
import { mapFormToPdm, mapPdmToForm } from './pdmMapper';

const pdm = MockProposalBackend as ProposalBackend;

describe('mapPdmToForm', () => {
  test('maps the PDM into form values', () => {
    expect(mapPdmToForm(pdm)).toEqual({ title: pdm.proposal_info.title });
  });

  test('returns empty form values when there is no PDM', () => {
    expect(mapPdmToForm(undefined)).toEqual({ title: '' });
  });
});

describe('mapFormToPdm', () => {
  test('lays the form values over the rest of the PDM', () => {
    const result = mapFormToPdm({ title: 'Edited title' }, pdm);

    expect(result.proposal_info.title).toBe('Edited title');
    expect(result.proposal_info.abstract).toBe(pdm.proposal_info.abstract);
    expect(result.prsl_id).toBe(pdm.prsl_id);
  });

  test('does not modify the base PDM', () => {
    const originalTitle = pdm.proposal_info.title;
    mapFormToPdm({ title: 'Edited title' }, pdm);
    expect(pdm.proposal_info.title).toBe(originalTitle);
  });

  test('round-trips through the form unchanged', () => {
    expect(mapFormToPdm(mapPdmToForm(pdm), pdm)).toEqual(pdm);
  });
});
