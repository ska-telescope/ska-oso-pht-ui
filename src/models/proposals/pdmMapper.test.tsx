import { describe, expect, test } from 'vitest';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import { MockProposalBackend } from '@services/axios/get/getProposal/mockProposalBackend.tsx';
import { mapping } from '@services/axios/get/getProposal/getProposal';
import { MockUserFrontendList } from '@services/axios/get/getUserByEmail/mockUserFrontend';
import { InvestigatorBackend } from '@/utils/types/investigator';
const investigator = MockUserFrontendList[0];
import MappingPutProposal from '@services/axios/put/putProposal/putProposalMapping';
import { mapFormToPdm, mapPdmToForm } from './pdmMapper';
import { getProposalSchema } from './proposal';
import { PROPOSAL_STATUS, PROPOSAL_TYPE } from '@/utils/constants';

const pdm = MockProposalBackend as ProposalBackend;
const emptySlices = {
  targets: [],
  targetObservation: [],
  calibrationStrategy: [],
  sciencePDF: null,
  technicalPDF: null
};

describe('mapPdmToForm', () => {
  test('maps the PDM into form values', () => {
    const legacy = mapping(pdm);
    expect(mapPdmToForm(pdm)).toEqual({
      title: pdm.proposal_info.title,
      proposalType: pdm.proposal_info.proposal_type.main_type,
      abstract: pdm.proposal_info.abstract,
      scienceCategory: 1,
      investigators: [],
      targets: legacy.targets,
      targetObservation: legacy.targetObservation,
      calibrationStrategy: legacy.calibrationStrategy,
      sciencePDF: null,
      technicalPDF: null
    });
  });

  test('leaves observing mode on the observation, outside form values', () => {
    const proposal = mapping(pdm);
    expect(proposal.observations?.[0]?.type).toBe('continuum');
    expect(mapPdmToForm(pdm)).not.toHaveProperty('observingMode');
    expect(mapFormToPdm(mapPdmToForm(pdm), pdm).observation_info.observation_sets).toEqual(
      pdm.observation_info.observation_sets
    );
  });

  test('maps form values the schema accepts', () => {
    expect(getProposalSchema().safeParse(mapPdmToForm(pdm)).error).toBeUndefined();
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
      abstract: '',
      scienceCategory: null,
      investigators: [],
      ...emptySlices
    });
  });

  test.each([undefined, []])(
    'defaults missing PDM investigators to an empty array: %s',
    (investigators) => {
      expect(
        mapPdmToForm({
          ...pdm,
          proposal_info: { ...pdm.proposal_info, investigators }
        }).investigators
      ).toEqual([]);
    }
  );

  test.each([undefined, null])(
    'normalizes optional investigator fields directly from PDM: %s',
    (optionalValue) => {
      const withInvestigator = {
        ...pdm,
        proposal_info: {
          ...pdm.proposal_info,
          investigators: [
            {
              user_id: investigator.id,
              status: investigator.status,
              given_name: optionalValue,
              family_name: optionalValue,
              email: optionalValue,
              organization: optionalValue
            }
          ]
        }
      };

      expect(mapPdmToForm(withInvestigator).investigators).toEqual([
        {
          id: investigator.id,
          status: investigator.status,
          firstName: '',
          lastName: '',
          email: '',
          phdThesis: false,
          pi: false
        }
      ]);
    }
  );
});

describe('mapFormToPdm', () => {
  test('lays the form values over the rest of the PDM', () => {
    const result = mapFormToPdm(
      {
        title: 'Edited title',
        proposalType: PROPOSAL_TYPE.KEY_SCIENCE,
        abstract: 'Edited abstract',
        scienceCategory: 7,
        investigators: [],
        ...emptySlices
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
        abstract: '',
        scienceCategory: null,
        investigators: [],
        ...emptySlices
      },
      pdm
    );
    expect(pdm.proposal_info.title).toBe(originalTitle);
  });

  test('maps investigator form values into PDM fields and references', () => {
    const existing: InvestigatorBackend = {
      user_id: investigator.id,
      status: investigator.status,
      organization: 'Unused institute'
    };
    const result = mapFormToPdm(
      {
        title: 'Edited title',
        proposalType: PROPOSAL_TYPE.STANDARD,
        abstract: '',
        scienceCategory: null,
        investigators: [investigator],
        ...emptySlices
      },
      {
        ...pdm,
        proposal_info: {
          ...pdm.proposal_info,
          investigators: [existing]
        }
      }
    );

    expect(result.investigator_refs).toEqual([investigator.id]);
    expect(result.proposal_info.investigators).toEqual([
      expect.objectContaining({
        user_id: investigator.id,
        given_name: investigator.firstName,
        family_name: investigator.lastName
      })
    ]);
    expect(result.proposal_info.investigators?.[0]).not.toHaveProperty('organization');
  });

  // A base from the legacy mapper, as on a real save, so the form's slices map back to it exactly
  test('round-trips through the form unchanged', () => {
    const base = MappingPutProposal(mapping(pdm), PROPOSAL_STATUS.DRAFT);
    expect(mapFormToPdm(mapPdmToForm(base), base)).toEqual(base);
  });

  test('lays targets, links and calibration from the form over the base PDM', () => {
    const result = mapFormToPdm({ ...mapPdmToForm(pdm), ...emptySlices }, pdm);
    expect(result.observation_info.targets).toEqual([]);
    expect(result.observation_info.result_details).toEqual([]);
    expect(result.observation_info.calibration_strategy).toEqual([]);
    expect(result.observation_info.observation_sets).toEqual(pdm.observation_info.observation_sets);
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
