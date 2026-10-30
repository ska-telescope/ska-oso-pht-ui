import { describe, expect, test } from 'vitest';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import { MockProposalBackend } from '@services/axios/get/getProposal/mockProposalBackend.tsx';
import { mapping } from '@services/axios/get/getProposal/getProposal';
import { mapFormToPdm, mapPdmToForm } from './pdmMapper';
import { getProposalSchema } from './proposal';
import { PROPOSAL_TYPE } from '@/utils/constants';

const pdm = MockProposalBackend as ProposalBackend;
// The form always holds these slices; they are not laid over the PDM yet
const emptySlices = { targets: [], targetObservation: [], calibrationStrategy: [] };

describe('mapPdmToForm', () => {
  test('maps the PDM into form values', () => {
    const legacy = mapping(pdm);
    expect(mapPdmToForm(pdm)).toEqual({
      title: pdm.proposal_info.title,
      proposalType: pdm.proposal_info.proposal_type.main_type,
      targets: legacy.targets,
      targetObservation: legacy.targetObservation,
      calibrationStrategy: legacy.calibrationStrategy
    });
  });

  test('returns empty form values when there is no PDM', () => {
    expect(mapPdmToForm(undefined)).toEqual({
      title: '',
      proposalType: null,
      targets: [],
      targetObservation: [],
      calibrationStrategy: []
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
    expect(mapFormToPdm(mapPdmToForm(pdm), pdm)).toEqual(pdm);
  });

  // Their writers still update the legacy store, so the base PDM must win until they move
  test('keeps targets, links and calibration from the base PDM', () => {
    const result = mapFormToPdm({ ...mapPdmToForm(pdm), ...emptySlices }, pdm);
    expect(result.observation_info).toEqual(pdm.observation_info);
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
