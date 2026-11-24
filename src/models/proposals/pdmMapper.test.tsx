import { describe, expect, test } from 'vitest';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import { MockProposalBackend } from '@services/axios/get/getProposal/mockProposalBackend.tsx';
import { mapping } from '@services/axios/get/getProposal/getProposal';
import { MockUserFrontendList } from '@services/axios/get/getUserByEmail/mockUserFrontend';
const investigator = MockUserFrontendList[0];
import MappingPutProposal from '@services/axios/put/putProposal/putProposalMapping';
import { mapFormToPdm, mapPdmToForm } from './pdmMapper';
import { getProposalSchema } from './proposal';
import { DataProductInput } from './dataProducts';
import { formObservationsFromLegacy } from './legacyObservations';
import { PROPOSAL_STATUS, PROPOSAL_SUBTYPE, PROPOSAL_TYPE } from '@/utils/constants';

const pdm = MockProposalBackend as ProposalBackend;
// A base from the legacy mapper, as on a real save, so the form's slices map back to it exactly
const base = MappingPutProposal(mapping(pdm), PROPOSAL_STATUS.DRAFT);
// The base without the save metadata, which PutProposal adds and the form does not hold
const {
  status: _status,
  submitted_on: _submittedOn,
  submitted_by: _submittedBy,
  investigator_refs: _investigatorRefs,
  ...baseFromForm
} = base;
const emptySlices = {
  prslId: pdm.prsl_id as string,
  cycle: pdm.cycle,
  targets: [],
  targetObservation: [],
  calibrationStrategy: [],
  sciencePDF: null,
  technicalPDF: null,
  dataProducts: [],
  observations: []
};

describe('mapPdmToForm', () => {
  test('maps the PDM into form values', () => {
    const legacy = mapping(pdm);
    expect(mapPdmToForm(pdm)).toEqual({
      prslId: pdm.prsl_id,
      cycle: pdm.cycle,
      title: pdm.proposal_info.title,
      proposalType: {
        type: pdm.proposal_info.proposal_type.main_type,
        subTypes: pdm.proposal_info.proposal_type.attributes
      },
      abstract: pdm.proposal_info.abstract,
      scienceCategory: 1,
      investigators: [],
      targets: legacy.targets,
      targetObservation: legacy.targetObservation,
      calibrationStrategy: legacy.calibrationStrategy,
      sciencePDF: null,
      technicalPDF: null,
      dataProducts: legacy.dataProducts,
      // The same as seeding the form from the legacy store
      observations: formObservationsFromLegacy(legacy.observations, legacy.groupObservations)
    });
  });

  test('leaves observing mode on the observation, outside form values', () => {
    const proposal = mapping(pdm);
    expect(proposal.observations?.[0]?.type).toBe('continuum');
    expect(mapPdmToForm(pdm)).not.toHaveProperty('observingMode');
    const saved = mapFormToPdm(mapPdmToForm(pdm)).observation_info.observation_sets ?? [];
    expect(saved.map((set) => set.observation_type_details.observation_type)).toEqual(
      (pdm.observation_info.observation_sets ?? []).map(
        (set) => set.observation_type_details.observation_type
      )
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

  // The PDM requires a proposal type, so a proposal without one fails to load
  // A stored proposal always has its ID; the PDM makes it optional only for creating
  test('rejects a PDM without an ID', () => {
    expect(() => mapPdmToForm({ ...pdm, prsl_id: undefined })).toThrow();
  });

  test('rejects a PDM without a proposal type', () => {
    expect(() =>
      mapPdmToForm({
        ...pdm,
        proposal_info: { ...pdm.proposal_info, proposal_type: {} as never }
      })
    ).toThrow();
  });

  test('defaults missing PDM sub-types to an empty list', () => {
    expect(
      mapPdmToForm({
        ...pdm,
        proposal_info: {
          ...pdm.proposal_info,
          proposal_type: { main_type: PROPOSAL_TYPE.STANDARD }
        }
      }).proposalType
    ).toEqual({ type: PROPOSAL_TYPE.STANDARD, subTypes: [] });
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
    'leaves optional investigator fields unset when loading from PDM: %s',
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
          phdThesis: false,
          pi: false
        }
      ]);
    }
  );
});

describe('mapFormToPdm', () => {
  test('maps the form values to the PDM', () => {
    const result = mapFormToPdm({
      title: 'Edited title',
      proposalType: { type: PROPOSAL_TYPE.KEY_SCIENCE, subTypes: [PROPOSAL_SUBTYPE.JOINT] },
      abstract: 'Edited abstract',
      scienceCategory: 7,
      investigators: [],
      ...emptySlices,
      prslId: 'prsl-t0001-20261120-00002',
      cycle: 'SKAO_2027_2'
    });

    expect(result.proposal_info.title).toBe('Edited title');
    expect(result.proposal_info.abstract).toBe('Edited abstract');
    expect(result.proposal_info.science_category).toBe('High Energy Cosmic Particles');
    expect(result.proposal_info.proposal_type).toEqual({
      main_type: PROPOSAL_TYPE.KEY_SCIENCE,
      attributes: [PROPOSAL_SUBTYPE.JOINT]
    });
    expect(result.prsl_id).toBe('prsl-t0001-20261120-00002');
    expect(result.cycle).toBe('SKAO_2027_2');
  });

  test('maps investigator form values into PDM fields', () => {
    const result = mapFormToPdm({
      title: 'Edited title',
      proposalType: { type: PROPOSAL_TYPE.STANDARD, subTypes: [] },
      abstract: '',
      scienceCategory: null,
      investigators: [investigator],
      ...emptySlices
    });

    expect(result.proposal_info.investigators).toEqual([
      expect.objectContaining({
        user_id: investigator.id,
        given_name: investigator.firstName,
        family_name: investigator.lastName
      })
    ]);
    expect(result.proposal_info.investigators?.[0]).not.toHaveProperty('organization');
  });

  test('round-trips through the form unchanged, but for the save metadata', () => {
    expect(mapFormToPdm(mapPdmToForm(base))).toEqual(baseFromForm);
  });

  test('maps targets, observations, links and calibration from the form', () => {
    const result = mapFormToPdm({ ...mapPdmToForm(pdm), ...emptySlices });
    expect(result.observation_info.targets).toEqual([]);
    expect(result.observation_info.observation_sets).toEqual([]);
    expect(result.observation_info.result_details).toEqual([]);
    expect(result.observation_info.calibration_strategy).toEqual([]);
  });

  test('saves the valid data products and their links', () => {
    const result = mapFormToPdm(mapPdmToForm(base));

    expect(result.observation_info.data_product_sdps).toEqual(
      base.observation_info.data_product_sdps
    );
    expect(result.observation_info.result_details).toEqual(base.observation_info.result_details);
  });

  test('leaves out an invalid data product and the links to it, but keeps the others', () => {
    const form = mapPdmToForm(base);
    const [valid] = form.dataProducts;
    const [validLink] = form.targetObservation;
    // Being edited: the image size has no unit yet
    const invalid = {
      ...valid,
      id: 'SDP-invalid',
      imageSize: { value: 1, unit: null }
    } as DataProductInput;

    const result = mapFormToPdm({
      ...form,
      dataProducts: [valid, invalid],
      targetObservation: [validLink, { ...validLink, dataProductsSDPId: invalid.id }]
    });

    expect(result.observation_info.data_product_sdps).toEqual(
      base.observation_info.data_product_sdps
    );
    expect(result.observation_info.result_details).toEqual(base.observation_info.result_details);
  });

  test('saves no data products or links when there are none', () => {
    const result = mapFormToPdm({ ...mapPdmToForm(base), dataProducts: [] });

    expect(result.observation_info.data_product_sdps).toEqual([]);
    expect(result.observation_info.result_details).toEqual([]);
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
