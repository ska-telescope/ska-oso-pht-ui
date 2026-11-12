import { describe, expect, test } from 'vitest';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import { MockProposalBackend } from '@services/axios/get/getProposal/mockProposalBackend.tsx';
import { mapping } from '@services/axios/get/getProposal/getProposal';
import MappingPutProposal from '@services/axios/put/putProposal/putProposalMapping';
import { mapFormToPdm, mapPdmToForm } from './pdmMapper';
import { getProposalSchema } from './proposal';
import { DataProductInput } from './dataProducts';
import { PROPOSAL_STATUS, PROPOSAL_TYPE } from '@/utils/constants';

const pdm = MockProposalBackend as ProposalBackend;
// A base from the legacy mapper, as on a real save, so the form's slices map back to it exactly
const base = MappingPutProposal(mapping(pdm), PROPOSAL_STATUS.DRAFT);
const emptySlices = {
  targets: [],
  targetObservation: [],
  calibrationStrategy: [],
  sciencePDF: null,
  technicalPDF: null,
  dataProducts: []
};

describe('mapPdmToForm', () => {
  test('maps the PDM into form values', () => {
    const legacy = mapping(pdm);
    expect(mapPdmToForm(pdm)).toEqual({
      title: pdm.proposal_info.title,
      proposalType: pdm.proposal_info.proposal_type.main_type,
      targets: legacy.targets,
      targetObservation: legacy.targetObservation,
      calibrationStrategy: legacy.calibrationStrategy,
      sciencePDF: null,
      technicalPDF: null,
      dataProducts: legacy.dataProducts
    });
  });

  test('returns empty form values when there is no PDM', () => {
    expect(mapPdmToForm(undefined)).toEqual({
      title: '',
      proposalType: null,
      targets: [],
      targetObservation: [],
      calibrationStrategy: [],
      sciencePDF: null,
      technicalPDF: null,
      dataProducts: []
    });
  });

  test('maps form values the schema accepts', () => {
    expect(getProposalSchema().safeParse(mapPdmToForm(pdm)).error).toBeUndefined();
  });
});

describe('mapFormToPdm', () => {
  test('lays the form values over the rest of the PDM', () => {
    const result = mapFormToPdm(
      { title: 'Edited title', proposalType: PROPOSAL_TYPE.KEY_SCIENCE, ...emptySlices },
      pdm
    );

    expect(result.proposal_info.title).toBe('Edited title');
    expect(result.proposal_info.proposal_type).toEqual({
      ...pdm.proposal_info.proposal_type,
      main_type: PROPOSAL_TYPE.KEY_SCIENCE
    });
    expect(result.proposal_info.abstract).toBe(pdm.proposal_info.abstract);
    expect(result.prsl_id).toBe(pdm.prsl_id);
  });

  test('does not modify the base PDM', () => {
    const originalTitle = pdm.proposal_info.title;
    mapFormToPdm(
      { title: 'Edited title', proposalType: PROPOSAL_TYPE.STANDARD, ...emptySlices },
      pdm
    );
    expect(pdm.proposal_info.title).toBe(originalTitle);
  });

  test('round-trips through the form unchanged', () => {
    expect(mapFormToPdm(mapPdmToForm(base), base)).toEqual(base);
  });

  test('lays targets, links and calibration from the form over the base PDM', () => {
    const result = mapFormToPdm({ ...mapPdmToForm(pdm), ...emptySlices }, pdm);
    expect(result.observation_info.targets).toEqual([]);
    expect(result.observation_info.result_details).toEqual([]);
    expect(result.observation_info.calibration_strategy).toEqual([]);
    expect(result.observation_info.observation_sets).toEqual(pdm.observation_info.observation_sets);
  });

  test('saves the valid data products and their links', () => {
    const result = mapFormToPdm(mapPdmToForm(base), base);

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

    const result = mapFormToPdm(
      {
        ...form,
        dataProducts: [valid, invalid],
        targetObservation: [validLink, { ...validLink, dataProductsSDPId: invalid.id }]
      },
      base
    );

    expect(result.observation_info.data_product_sdps).toEqual(
      base.observation_info.data_product_sdps
    );
    expect(result.observation_info.result_details).toEqual(base.observation_info.result_details);
  });

  test('saves no data products or links when there are none', () => {
    const result = mapFormToPdm({ ...mapPdmToForm(base), dataProducts: [] }, base);

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
