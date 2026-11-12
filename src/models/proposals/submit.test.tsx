import { describe, expect, test } from 'vitest';
import { mapping } from '@services/axios/get/getProposal/getProposal';
import {
  MockProposalBackend,
  MockProposalBackendZoom
} from '@services/axios/get/getProposal/mockProposalBackend.tsx';
import {
  PROPOSAL_TYPE,
  SENSITIVITY_STATE,
  STATUS_ERROR,
  STATUS_OK,
  VELOCITY_DEFINITION
} from '@/utils/constants';
import { ProposalBackend } from '@/utils/types/proposal';
import { MockSlicesPdm } from './testing/mockSlicesPdm';
import { getProposalSchema, ProposalType } from './proposal';
import type { TargetObservationLink } from './targetObservation';
import { getProposalSubmitSchema, getSubmitPageStatuses } from './submit';
import { getProposalFormValues } from './useProposalForm';
import { DATA_PRODUCT_KIND, DataProductInput, newDataProduct } from './dataProducts';

const target = { id: 't1', name: 'M2', kind: 0, velocityDefinition: VELOCITY_DEFINITION.RADIO };
const link = { targetId: 't1', observationId: 'o1', dataProductsSDPId: 'sdp1' };
const strategy = {
  observatoryDefined: true,
  id: 'cal1',
  observationIdRef: 'o1',
  calibrators: null,
  notes: null
};

const dataProduct = { ...newDataProduct(DATA_PRODUCT_KIND.CONTINUUM_IMAGE, 'o1'), id: 'sdp1' };

const values = (slices: Partial<ProposalType> = {}): ProposalType => ({
  title: 'A valid title',
  proposalType: PROPOSAL_TYPE.STANDARD,
  targets: [target],
  targetObservation: [link],
  calibrationStrategy: [strategy],
  sciencePDF: null,
  technicalPDF: null,
  dataProducts: [dataProduct],
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
        calibration: hasCalibration ? STATUS_OK : STATUS_ERROR,
        dataProducts: STATUS_OK
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
      calibration: STATUS_OK,
      dataProducts: STATUS_OK
    });
  });

  // The zoom mock's spectral data product has channelsOut 1, below the spectral minimum, and
  // MockSlicesPdm has no data products, so their Data Products pages are not complete
  test.each([
    ['MockProposalBackend', MockProposalBackend, STATUS_OK],
    ['MockProposalBackendZoom', MockProposalBackendZoom, STATUS_ERROR],
    ['MockSlicesPdm', MockSlicesPdm, STATUS_ERROR]
  ])('passes the pages for the proposal loaded from %s', (_, pdm, dataProductsStatus) => {
    const proposal = mapping(pdm as unknown as ProposalBackend);
    expect(getSubmitPageStatuses(getProposalFormValues(proposal))).toEqual({
      target: STATUS_OK,
      linking: STATUS_OK,
      calibration: STATUS_OK,
      dataProducts: dataProductsStatus
    });
  });
});

describe('getSubmitPageStatuses, Data Products page', () => {
  // Being edited: the image size has no unit yet
  const invalid = { ...dataProduct, imageSize: { value: 1, unit: null } } as DataProductInput;
  const svLink = (sensitivity?: TargetObservationLink['sensitivity']) => ({ ...link, sensitivity });

  test.each([
    ['one valid data product', [dataProduct], STATUS_OK],
    ['no data products', [], STATUS_ERROR],
    ['an invalid data product', [dataProduct, invalid], STATUS_ERROR]
  ])('gives %s its status', (_, dataProducts, status) => {
    expect(getSubmitPageStatuses(values({ dataProducts })).dataProducts).toBe(status);
  });

  test.each([
    ['a link with results', [svLink({ state: SENSITIVITY_STATE.CALCULATING })], STATUS_OK],
    ['a link without results, as for SSO targets and PST', [svLink()], STATUS_OK],
    ['no link', [], STATUS_ERROR],
    ['a link to another data product', [{ ...link, dataProductsSDPId: 'other' }], STATUS_ERROR],
    [
      'a link whose results failed',
      [svLink({ state: SENSITIVITY_STATE.FAILED, error: 'Calculator error' })],
      STATUS_ERROR
    ]
  ])('gives an SV proposal with %s its status', (_, targetObservation, status) => {
    expect(
      getSubmitPageStatuses(
        values({
          proposalType: PROPOSAL_TYPE.SCIENCE_VERIFICATION,
          targetObservation: targetObservation as TargetObservationLink[]
        })
      ).dataProducts
    ).toBe(status);
  });

  test('does not need a link for the data products of other proposal types', () => {
    expect(getSubmitPageStatuses(values({ targetObservation: [] })).dataProducts).toBe(STATUS_OK);
  });

  // The SV link rule is checked even when the values are malformed
  test.each([null, {}, { proposalType: PROPOSAL_TYPE.SCIENCE_VERIFICATION, dataProducts: 'x' }])(
    'reports malformed values without throwing: %j',
    (malformed) => {
      expect(getProposalSubmitSchema().safeParse(malformed).success).toBe(false);
    }
  );

  // A wrong type stops Zod checking the rest of the proposal unless the rule says otherwise
  test('still reports an SV data product without a link when a target is malformed', () => {
    expect(
      getSubmitPageStatuses(
        values({
          proposalType: PROPOSAL_TYPE.SCIENCE_VERIFICATION,
          targets: [{ ...target, kind: 'not a number' } as never],
          targetObservation: []
        })
      ).dataProducts
    ).toBe(STATUS_ERROR);
  });

  test('still reports an invalid data product when other slices are invalid too', () => {
    expect(
      getSubmitPageStatuses(values({ title: '', targets: [], dataProducts: [invalid] }))
        .dataProducts
    ).toBe(STATUS_ERROR);
  });
});

test.each([
  ['target', { targets: [{ ...target, kind: 'not a number' }] }],
  ['linking', { targetObservation: [{ ...link, sensitivity: { state: 'unknown' } }] }],
  ['calibration', { calibrationStrategy: [{ ...strategy, calibrators: 'not a list' }] }]
] as const)('marks the %s page, and only that page, for a malformed entry', (page, slices) => {
  const statuses = getSubmitPageStatuses(values(slices as unknown as Partial<ProposalType>));
  expect(statuses).toEqual({
    target: STATUS_OK,
    linking: STATUS_OK,
    calibration: STATUS_OK,
    dataProducts: STATUS_OK,
    [page]: STATUS_ERROR
  });
});

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
