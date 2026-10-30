import { describe, expect, test } from 'vitest';
import { mapping } from '@services/axios/get/getProposal/getProposal';
import {
  MockProposalBackend,
  MockProposalBackendZoom
} from '@services/axios/get/getProposal/mockProposalBackend.tsx';
import { STATUS_ERROR, STATUS_OK, PROPOSAL_TYPE } from '@/utils/constants';
import { ProposalBackend } from '@/utils/types/proposal';
import { MockSlicesPdm } from './mockSlicesPdm';
import { getProposalSchema, ProposalType } from './proposal';
import { getProposalSubmitSchema, getSubmitPageStatuses } from './submit';
import { getProposalFormValues } from './useProposalForm';

const target = { id: 't1', name: 'M2', kind: 0 };
const link = { targetId: 't1', observationId: 'o1', dataProductsSDPId: 'sdp1' };
const strategy = {
  observatoryDefined: true,
  id: 'cal1',
  observationIdRef: 'o1',
  calibrators: null,
  notes: null
};

const values = (slices: Partial<ProposalType> = {}): ProposalType => ({
  title: 'A valid title',
  proposalType: PROPOSAL_TYPE.STANDARD,
  targets: [target],
  targetObservation: [link],
  calibrationStrategy: [strategy],
  ...slices
});

describe('getSubmitPageStatuses', () => {
  // The rules the page checks in validation.tsx used: each page needs at least one entry
  test.each([
    [true, true, true],
    [false, true, true],
    [true, false, true],
    [true, true, false],
    [false, false, false]
  ])(
    'matches the previous page checks with targets %s, links %s, calibration %s',
    (hasTargets, hasLinks, hasCalibration) => {
      const statuses = getSubmitPageStatuses(
        values({
          targets: hasTargets ? [target] : [],
          targetObservation: hasLinks ? [link] : [],
          calibrationStrategy: hasCalibration ? [strategy] : []
        })
      );
      expect(statuses).toEqual({
        target: hasTargets ? STATUS_OK : STATUS_ERROR,
        linking: hasLinks ? STATUS_OK : STATUS_ERROR,
        calibration: hasCalibration ? STATUS_OK : STATUS_ERROR
      });
    }
  );

  test('still reports a page when another slice is invalid', () => {
    expect(getSubmitPageStatuses(values({ title: '', targets: [] })).target).toBe(STATUS_ERROR);
  });

  test('does not report a page for issues in other slices', () => {
    expect(getSubmitPageStatuses(values({ title: '' }))).toEqual({
      target: STATUS_OK,
      linking: STATUS_OK,
      calibration: STATUS_OK
    });
  });

  test.each([
    ['MockProposalBackend', MockProposalBackend],
    ['MockProposalBackendZoom', MockProposalBackendZoom],
    ['MockSlicesPdm', MockSlicesPdm]
  ])('passes every page for the proposal loaded from %s', (_, pdm) => {
    const proposal = mapping(pdm as unknown as ProposalBackend);
    expect(getSubmitPageStatuses(getProposalFormValues(proposal))).toEqual({
      target: STATUS_OK,
      linking: STATUS_OK,
      calibration: STATUS_OK
    });
  });
});

test.each([
  ['target', { targets: [{ ...target, kind: 'not a number' }] }],
  ['linking', { targetObservation: [{ ...link, sensCalc: { statusGUI: 99 } }] }],
  ['calibration', { calibrationStrategy: [{ ...strategy, calibrators: 'not a list' }] }]
] as const)(
  'does not check anything the page checks did not, such as a malformed %s entry',
  (page, slices) => {
    expect(getSubmitPageStatuses(values(slices as unknown as Partial<ProposalType>))[page]).toBe(
      STATUS_OK
    );
  }
);

test('passes the Calibration page for a strategy saved without notes', () => {
  const strategySavedWithoutNotes = { ...strategy, notes: undefined };
  expect(
    getSubmitPageStatuses(values({ calibrationStrategy: [strategySavedWithoutNotes] })).calibration
  ).toBe(STATUS_OK);
});

describe('getProposalSubmitSchema', () => {
  test('reports a missing target, link or calibration at its slice', () => {
    const issues =
      getProposalSubmitSchema().safeParse(
        values({ targets: [], targetObservation: [], calibrationStrategy: [] })
      ).error?.issues ?? [];
    expect(issues.map((issue) => issue.path)).toEqual([
      ['targets'],
      ['targetObservation'],
      ['calibrationStrategy']
    ]);
  });

  test('leaves the form schema accepting a proposal that is not finished yet', () => {
    const unfinished = values({ targets: [], targetObservation: [], calibrationStrategy: [] });
    expect(getProposalSchema().safeParse(unfinished).success).toBe(true);
  });
});
