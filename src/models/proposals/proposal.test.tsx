import { describe, expect, test } from 'vitest';
import { getProposalSchema } from './proposal';
import { PROPOSAL_TYPE } from '@/utils/constants';
import phtTranslations from '../../../public/locales/en/pht.json';

describe('proposal schema', () => {
  test.each([0, 1])('validates the abstract word limit with %s extra words', (extraWords) => {
    const wordLimit = Number(phtTranslations.abstract.maxWord);
    const result = getProposalSchema().safeParse({
      title: 'A valid title',
      proposalType: PROPOSAL_TYPE.STANDARD,
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
        proposalType,
        abstract: 'A valid abstract',
        scienceCategory: null,
        investigators: []
      }).success
    ).toBe(true);
  });

  test.each([undefined, null, '', 'unsupported'])(
    'rejects an unselected or invalid type %s',
    (proposalType) => {
      const result = getProposalSchema().safeParse({
        title: 'A valid title',
        proposalType,
        abstract: 'A valid abstract',
        scienceCategory: null,
        investigators: []
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['proposalType']);
      }
    }
  );
});
