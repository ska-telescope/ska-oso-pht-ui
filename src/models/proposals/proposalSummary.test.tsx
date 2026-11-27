import { describe, expect, test } from 'vitest';
import MockProposalBackendList from '@/models/proposals/testing/mockProposalBackendList';
import { PROPOSAL_TYPE, TYPE_ZOOM, TYPE_ZOOM_LONG } from '@utils/constants.ts';
import type { Proposal as ProposalPDM } from '@/generated/models/proposal';
import { proposalSummariesFromPdm, proposalSummaryFromPdm } from './proposalSummary';
import MockProposalSummaries from './testing/mockProposalSummaries';

const pdms = MockProposalBackendList as ProposalPDM[];

describe('proposalSummaryFromPdm', () => {
  test('maps each proposal to the fields the lists show', () => {
    expect(pdms.map(proposalSummaryFromPdm)).toEqual(MockProposalSummaries);
  });

  test('passes the science verification type through with no science category', () => {
    const summary = proposalSummaryFromPdm(pdms[1]);
    expect(summary.proposalType).toBe(PROPOSAL_TYPE.SCIENCE_VERIFICATION);
    expect(summary.scienceCategory).toBe('');
  });

  test("takes the observing type from the first observation, in the app's short form", () => {
    const [first, ...rest] = pdms[0].observation_info.observation_sets ?? [];
    const zoomFirst: ProposalPDM = {
      ...pdms[0],
      observation_info: {
        ...pdms[0].observation_info,
        observation_sets: [
          {
            ...first,
            observation_type_details: {
              ...first.observation_type_details,
              observation_type: TYPE_ZOOM_LONG
            }
          } as typeof first,
          ...rest
        ]
      }
    };
    expect(proposalSummaryFromPdm(zoomFirst).observingType).toBe(TYPE_ZOOM);
  });

  test('has no observing type without observations', () => {
    const noObservations: ProposalPDM = {
      ...pdms[0],
      observation_info: { ...pdms[0].observation_info, observation_sets: [] }
    };
    expect(proposalSummaryFromPdm(noObservations).observingType).toBeNull();
  });

  test('shows the team without their invitation status', () => {
    const summary = proposalSummaryFromPdm(pdms[0]);
    expect(summary.investigators.every((investigator) => investigator.status === 'unknown')).toBe(
      true
    );
  });
});

describe('proposalSummariesFromPdm', () => {
  test('keeps only the most recent version of each proposal', () => {
    const older: ProposalPDM = {
      ...pdms[0],
      proposal_info: { ...pdms[0].proposal_info, title: 'Older title' },
      metadata: { ...pdms[0].metadata, last_modified_on: '2020-01-01T00:00:00Z' }
    } as ProposalPDM;

    const summaries = proposalSummariesFromPdm([older, ...pdms]);

    expect(summaries).toHaveLength(pdms.length);
    expect(summaries.find((s) => s.id === pdms[0].prsl_id)?.title).toBe(
      MockProposalSummaries[0].title
    );
  });

  test('maps a single proposal', () => {
    expect(proposalSummariesFromPdm([pdms[0]])).toEqual([MockProposalSummaries[0]]);
  });
});
