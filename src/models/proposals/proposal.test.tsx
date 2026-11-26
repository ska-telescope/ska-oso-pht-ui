import { describe, expect, test } from 'vitest';
import { getProposalSchema } from './proposal';
import { getProposalFormDefaults } from './useProposalForm';
import { PROPOSAL_TYPE } from '@/utils/constants';
import phtTranslations from '@/locales/en/pht.json';

const emptySlices = {
  prslId: 'prp-1',
  cycle: 'SKAO_2027_1',
  abstract: 'A valid abstract',
  scienceCategory: null,
  investigators: [],
  targets: [],
  targetObservation: [],
  calibrationStrategy: [],
  sciencePDF: null,
  technicalPDF: null,
  dataProducts: [],
  observations: []
};

describe('proposal schema', () => {
  test.each([0, 1])('validates the abstract word limit with %s extra words', (extraWords) => {
    const wordLimit = Number(phtTranslations.abstract.maxWord);
    const result = getProposalSchema().safeParse({
      ...emptySlices,
      title: 'A valid title',
      proposalType: { type: PROPOSAL_TYPE.STANDARD, subTypes: [] },
      abstract: Array(wordLimit + extraWords)
        .fill('a')
        .join(' '),
      scienceCategory: 1,
      investigators: []
    });

    expect(result.success).toBe(extraWords === 0);
    if (!result.success) {
      expect(result.error.issues).toEqual([
        expect.objectContaining({
          path: ['abstract'],
          message: `${phtTranslations.specialCharacters.numWord} ${wordLimit + extraWords} / ${wordLimit}`
        })
      ]);
    }
  });

  test.each(Object.values(PROPOSAL_TYPE))('accepts a valid title and type %s', (proposalType) => {
    expect(
      getProposalSchema().safeParse({
        title: 'A valid title',
        proposalType: { type: proposalType, subTypes: [] },
        ...emptySlices
      }).success
    ).toBe(true);
  });

  // The form holds an unselected type as null; a missing one takes that default unchecked
  test.each([null, '', 'unsupported'])(
    'rejects an unselected or invalid type %s',
    (proposalType) => {
      const result = getProposalSchema().safeParse({
        title: 'A valid title',
        proposalType: { type: proposalType, subTypes: [] },
        ...emptySlices
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['proposalType', 'type']);
      }
    }
  );

  test('rejects an unknown sub-type', () => {
    const result = getProposalSchema().safeParse({
      title: 'A valid title',
      proposalType: { type: PROPOSAL_TYPE.STANDARD, subTypes: ['unsupported'] },
      ...emptySlices
    });
    expect(result.error?.issues[0].path).toEqual(['proposalType', 'subTypes', 0]);
  });

  test.each(['targets', 'targetObservation', 'calibrationStrategy'])(
    'rejects %s that is not a list',
    (slice) => {
      const result = getProposalSchema().safeParse({
        title: 'A valid title',
        proposalType: { type: PROPOSAL_TYPE.STANDARD, subTypes: [] },
        ...emptySlices,
        [slice]: null
      });
      expect(result.error?.issues[0].path).toEqual([slice]);
    }
  );

  test('reports a malformed link under targetObservation', () => {
    const result = getProposalSchema().safeParse({
      title: 'A valid title',
      proposalType: { type: PROPOSAL_TYPE.STANDARD, subTypes: [] },
      ...emptySlices,
      targetObservation: [{ targetId: 't1' }]
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path.slice(0, 2)).toEqual(['targetObservation', 0]);
  });
});

describe('proposal form values', () => {
  test('a new proposal has empty defaults', () => {
    expect(getProposalFormDefaults()).toEqual({
      prslId: '',
      cycle: '',
      title: '',
      proposalType: { type: null, subTypes: [] },
      abstract: '',
      scienceCategory: null,
      investigators: [],
      targets: [],
      targetObservation: [],
      calibrationStrategy: [],
      sciencePDF: null,
      technicalPDF: null,
      dataProducts: [],
      observations: []
    });
  });

  test('each new proposal gets its own lists', () => {
    const first = getProposalFormDefaults();
    first.targets.push({ id: 't1', name: 'M2', kind: 0, velocityDefinition: 'RADIO' });
    expect(getProposalFormDefaults().targets).toEqual([]);
  });
});
