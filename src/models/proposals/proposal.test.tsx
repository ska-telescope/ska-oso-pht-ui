import { describe, expect, test } from 'vitest';
import { getProposalSchema } from './proposal';
import { getProposalFormDefaults, getProposalFormValues } from './useProposalForm';
import { PROPOSAL_TYPE } from '@/utils/constants';

const emptySlices = {
  targets: [],
  targetObservation: [],
  calibrationStrategy: [],
  sciencePDF: null,
  technicalPDF: null,
  dataProducts: []
};

describe('proposal schema', () => {
  test.each(Object.values(PROPOSAL_TYPE))('accepts a valid title and type %s', (proposalType) => {
    expect(
      getProposalSchema().safeParse({ title: 'A valid title', proposalType, ...emptySlices })
        .success
    ).toBe(true);
  });

  // The form holds an unselected type as null; a missing one takes that default unchecked
  test.each([null, '', 'unsupported'])(
    'rejects an unselected or invalid type %s',
    (proposalType) => {
      const result = getProposalSchema().safeParse({
        title: 'A valid title',
        proposalType,
        ...emptySlices
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['proposalType']);
      }
    }
  );

  test.each(['targets', 'targetObservation', 'calibrationStrategy'])(
    'rejects %s that is not a list',
    (slice) => {
      const result = getProposalSchema().safeParse({
        title: 'A valid title',
        proposalType: PROPOSAL_TYPE.STANDARD,
        ...emptySlices,
        [slice]: null
      });
      expect(result.error?.issues[0].path).toEqual([slice]);
    }
  );

  test('reports a malformed link under targetObservation', () => {
    const result = getProposalSchema().safeParse({
      title: 'A valid title',
      proposalType: PROPOSAL_TYPE.STANDARD,
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

  test('each new proposal gets its own lists', () => {
    const first = getProposalFormDefaults();
    first.targets.push({ id: 't1', name: 'M2', kind: 0, velocityDefinition: 'RADIO' });
    expect(getProposalFormDefaults().targets).toEqual([]);
  });

  test("lays a proposal's slices over the defaults, without checking them", () => {
    const values = getProposalFormValues({
      title: 'A title that is far too long to pass the title check '.repeat(10),
      proposalType: PROPOSAL_TYPE.STANDARD
    });
    expect(values.title).toContain('far too long');
    expect(values.proposalType).toBe(PROPOSAL_TYPE.STANDARD);
    expect(values.targets).toEqual([]);
    expect(values.sciencePDF).toBeNull();
  });
});
