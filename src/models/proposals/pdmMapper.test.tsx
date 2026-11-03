import { describe, expect, test } from 'vitest';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import { MockProposalBackend } from '@services/axios/get/getProposal/mockProposalBackend.tsx';
import { mapping } from '@services/axios/get/getProposal/getProposal';
import { MockUserFrontendList } from '@services/axios/get/getUserByEmail/mockUserFrontend';
import { mapFormToPdm, mapPdmToForm } from './pdmMapper';
import { PROPOSAL_TYPE } from '@/utils/constants';

const pdm = MockProposalBackend as ProposalBackend;
const investigator = MockUserFrontendList[0];

describe('mapPdmToForm', () => {
  test('maps the PDM into form values', () => {
    expect(mapPdmToForm(pdm)).toEqual({
      title: pdm.proposal_info.title,
      proposalType: pdm.proposal_info.proposal_type.main_type,
      observingMode: null,
      abstract: pdm.proposal_info.abstract,
      scienceCategory: 1,
      investigators: []
    });
  });

  test('includes the observing mode from the mapped proposal', () => {
    expect(mapPdmToForm(pdm, mapping(pdm)).observingMode).toBe('continuum');
  });

  test('maps investigators from PDM into the form', () => {
    const withInvestigator = {
      ...pdm,
      proposal_info: {
        ...pdm.proposal_info,
        investigators: [
          {
            user_id: investigator.id,
            status: investigator.status,
            given_name: investigator.firstName,
            family_name: investigator.lastName,
            email: investigator.email,
            organization: investigator.affiliation,
            for_phd: investigator.phdThesis,
            principal_investigator: investigator.pi
          }
        ]
      }
    };

    expect(mapPdmToForm(withInvestigator).investigators).toEqual([
      expect.objectContaining({
        id: investigator.id,
        firstName: investigator.firstName,
        lastName: investigator.lastName,
        email: investigator.email,
        affiliation: investigator.affiliation,
        phdThesis: investigator.phdThesis,
        status: investigator.status,
        pi: investigator.pi
      })
    ]);
  });

  test('returns empty form values when there is no PDM', () => {
    expect(mapPdmToForm(undefined)).toEqual({
      title: '',
      proposalType: null,
      observingMode: null,
      abstract: '',
      scienceCategory: null,
      investigators: []
    });
  });
});

describe('mapFormToPdm', () => {
  test('lays the form values over the rest of the PDM', () => {
    const result = mapFormToPdm(
      {
        title: 'Edited title',
        proposalType: PROPOSAL_TYPE.KEY_SCIENCE,
        observingMode: null,
        abstract: 'Edited abstract',
        scienceCategory: 7,
        investigators: []
      },
      pdm
    );

    expect(result.proposal_info.title).toBe('Edited title');
    expect(result.proposal_info.abstract).toBe('Edited abstract');
    expect(result.proposal_info.science_category).toBe('High Energy Cosmic Particles');
    expect(result.proposal_info.proposal_type).toEqual({
      ...pdm.proposal_info.proposal_type,
      main_type: PROPOSAL_TYPE.KEY_SCIENCE
    });
    expect(result.prsl_id).toBe(pdm.prsl_id);
  });

  test('does not modify the base PDM', () => {
    const originalTitle = pdm.proposal_info.title;
    mapFormToPdm(
      {
        title: 'Edited title',
        proposalType: PROPOSAL_TYPE.STANDARD,
        observingMode: null,
        abstract: '',
        scienceCategory: null,
        investigators: []
      },
      pdm
    );
    expect(pdm.proposal_info.title).toBe(originalTitle);
  });

  test('maps investigator form values into PDM fields and references', () => {
    const result = mapFormToPdm(
      {
        title: 'Edited title',
        proposalType: PROPOSAL_TYPE.STANDARD,
        observingMode: null,
        abstract: '',
        scienceCategory: null,
        investigators: [investigator]
      },
      pdm
    );

    expect(result.investigator_refs).toEqual([investigator.id]);
    expect(result.proposal_info.investigators).toEqual([
      expect.objectContaining({
        user_id: investigator.id,
        given_name: investigator.firstName,
        family_name: investigator.lastName,
        organization: investigator.affiliation
      })
    ]);
  });

  test('round-trips through the form unchanged', () => {
    expect(mapFormToPdm(mapPdmToForm(pdm), pdm)).toEqual(pdm);
  });

  test('rejects an unsupported proposal type from the PDM', () => {
    expect(() =>
      mapPdmToForm({
        ...pdm,
        proposal_info: {
          ...pdm.proposal_info,
          proposal_type: { main_type: 'unsupported' }
        }
      })
    ).toThrow();
  });
});
