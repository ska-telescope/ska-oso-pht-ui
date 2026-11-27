import { describe, test, expect } from 'vitest';
import { calibrationStrategyToPdm } from '@/models/proposals/calibrationStrategy';
import { referenceCoordinateToPdm } from '@/models/proposals/targets';
import type { Proposal as ProposalPDM } from '@/generated/models/proposal';
import { getUserId } from '@utils/aaa/aaaUtils.tsx';
import '@testing-library/jest-dom';
import {
  PROPOSAL_STATUS,
  REFERENCE_COORDINATE_TYPE_GALACTIC,
  REFERENCE_COORDINATE_TYPE_ICRS
} from '@utils/constants.ts';
import { MockProposalBackend } from './mockProposalBackend.tsx';
import PutProposal from './putProposal.tsx';
import { CalibrationStrategy } from '@utils/types/calibrationStrategy.tsx';
import { AxiosError } from 'axios';

const { mockUpdateProposal } = vi.hoisted(() => ({ mockUpdateProposal: vi.fn() }));

vi.mock('@/generated', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/generated')>()),
  PPTAPIProposalPreparationApiFactory: () => ({
    updateProposalOsoApiV17PhtPrslsPrslIdPut: mockUpdateProposal
  })
}));

const pdm = MockProposalBackend as ProposalPDM;

describe('PutProposal Service', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('returns data from API', async () => {
    mockUpdateProposal.mockResolvedValue({ data: MockProposalBackend });
    const result = await PutProposal(pdm, PROPOSAL_STATUS.DRAFT);
    expect(result).to.deep.equal({ data: MockProposalBackend });
  });

  test('saves a draft by default', async () => {
    mockUpdateProposal.mockResolvedValue({ data: MockProposalBackend });
    await PutProposal(pdm);
    expect(mockUpdateProposal).toHaveBeenCalledWith(
      pdm.prsl_id,
      expect.objectContaining({ status: PROPOSAL_STATUS.DRAFT })
    );
  });

  test.each([PROPOSAL_STATUS.DRAFT, PROPOSAL_STATUS.SUBMITTED])(
    'sends the PDM with the status for %s',
    async (status) => {
      vi.useFakeTimers({ toFake: ['Date'] });
      mockUpdateProposal.mockResolvedValue({ data: MockProposalBackend });
      const submitted = status === PROPOSAL_STATUS.SUBMITTED;

      await PutProposal(pdm, status);

      expect(mockUpdateProposal).toHaveBeenCalledExactlyOnceWith(pdm.prsl_id, {
        ...pdm,
        status,
        ...(submitted && { submitted_on: new Date().toISOString(), submitted_by: getUserId() })
      });
    }
  );

  test('sends an empty title', async () => {
    mockUpdateProposal.mockResolvedValue({ data: MockProposalBackend });

    await PutProposal(
      { ...pdm, proposal_info: { ...pdm.proposal_info, title: '' } },
      PROPOSAL_STATUS.DRAFT
    );

    expect(mockUpdateProposal).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        proposal_info: expect.objectContaining({ title: '' })
      })
    );
  });

  test('returns error message on API failure', async () => {
    mockUpdateProposal.mockRejectedValue(new Error('Network Error'));
    const result = await PutProposal(pdm, PROPOSAL_STATUS.DRAFT);
    expect(result).toStrictEqual({ error: 'Network Error' });
  });

  test('maps an axios error through mapAxiosError', async () => {
    const axiosError = new AxiosError('Request failed with status code 500');
    axiosError.response = { status: 500 } as AxiosError['response'];
    mockUpdateProposal.mockRejectedValue(axiosError);
    const result = await PutProposal(pdm, PROPOSAL_STATUS.DRAFT);
    expect(result).toStrictEqual({ error: 'Server responded with an error: 500' });
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    mockUpdateProposal.mockRejectedValue({ unexpected: 'object' });
    const result = await PutProposal(pdm, PROPOSAL_STATUS.DRAFT);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result undefined', async () => {
    mockUpdateProposal.mockResolvedValue(undefined);
    const result = await PutProposal(pdm, PROPOSAL_STATUS.DRAFT);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result null', async () => {
    mockUpdateProposal.mockResolvedValue(null);
    const result = await PutProposal(pdm, PROPOSAL_STATUS.DRAFT);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });
});

describe('calibrationStrategyToPdm', () => {
  test('should map calibration strategies with calibrators', () => {
    const input: CalibrationStrategy[] = [
      {
        observatoryDefined: true,
        id: '1',
        observationIdRef: 'obs-1',
        calibrators: [
          {
            calibrationIntent: 'flux',
            durationSeconds: 600,
            name: '3C 444',
            relativeToScan: 'before_each_scan',
            selectionStrategy: 'highest_elevation',
            targetId: 'calibrator-00001',
            notes: null
          },
          {
            calibrationIntent: 'flux',
            durationSeconds: 600,
            name: '3C 444',
            relativeToScan: 'after_each_scan',
            selectionStrategy: 'highest_elevation',
            targetId: 'calibrator-00001',
            notes: null
          }
        ],
        notes: 'strategy notes'
      }
    ];

    const result = calibrationStrategyToPdm(input);

    expect(result).toEqual([
      {
        observatory_defined: true,
        calibration_id: '1',
        observation_set_ref: 'obs-1',
        calibrators: [
          {
            kind: 'flux',
            name: '3C 444'
          },
          {
            kind: 'flux',
            name: '3C 444'
          }
        ],
        notes: 'strategy notes'
      }
    ]);
  });

  test('should return null calibrators when input strategy has none', () => {
    const input: CalibrationStrategy[] = [
      {
        observatoryDefined: false,
        id: '2',
        observationIdRef: 'obs-2',
        calibrators: null,
        notes: null
      }
    ];

    const result = calibrationStrategyToPdm(input);

    expect(result).toEqual([
      {
        observatory_defined: false,
        calibration_id: '2',
        observation_set_ref: 'obs-2',
        calibrators: null,
        notes: null
      }
    ]);
  });
});

describe('referenceCoordinateToPdm', () => {
  test('maps galactic coordinates, leaving the unused fields to the PDM', () => {
    const galactic = {
      kind: REFERENCE_COORDINATE_TYPE_GALACTIC.value,
      l: 123.4,
      b: 56.7,
      pmL: 1.1,
      pmB: 2.2,
      epoch: 'J2000',
      parallax: 0.5
    };
    const result = referenceCoordinateToPdm(galactic);
    expect(result).toEqual({
      kind: REFERENCE_COORDINATE_TYPE_GALACTIC.label,
      l: 123.4,
      b: 56.7
    });
  });

  test('maps ICRS coordinates, leaving the unused fields to the PDM', () => {
    const icrs = {
      kind: REFERENCE_COORDINATE_TYPE_ICRS.value,
      raStr: '12:34:56.7',
      decStr: '-12:34:56.7',
      pmRa: 0.1,
      pmDec: 0.2,
      epoch: 'J2000',
      parallax: 0.3
    };
    const result = referenceCoordinateToPdm(icrs);
    expect(result).toEqual({
      kind: REFERENCE_COORDINATE_TYPE_ICRS.label,
      ra_str: '12:34:56.7',
      dec_str: '-12:34:56.7'
    });
  });
});
