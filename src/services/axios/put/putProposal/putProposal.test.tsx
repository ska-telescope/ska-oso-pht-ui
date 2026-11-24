import { describe, test, expect } from 'vitest';
import { getProposalFormValues } from '@/models/proposals/useProposalForm';
import { mapFormToPdm } from '@/models/proposals/pdmMapper';
import type { ProposalType } from '@/models/proposals/proposal';
import { getUserId } from '@utils/aaa/aaaUtils.tsx';
import '@testing-library/jest-dom';
import {
  PROPOSAL_STATUS,
  REFERENCE_COORDINATE_TYPE_GALACTIC,
  REFERENCE_COORDINATE_TYPE_ICRS,
  TYPE_CONTINUUM,
  TYPE_ZOOM,
  TYPE_PST,
  PST_MODES,
  TYPE_ZOOM_LONG,
  PROPOSAL_SUBTYPE,
  PROPOSAL_TYPE
} from '@utils/constants.ts';
import { MockProposalFrontend } from './mockProposalFrontend.tsx';
import { MockProposalBackend } from './mockProposalBackend.tsx';
import PutProposal from './putProposal.tsx';
import {
  getObservationTypeDetails,
  getReferenceCoordinate,
  mapCalibrationStrategyToBackend
} from './putProposalMapping.tsx';
import { CalibrationStrategy } from '@utils/types/calibrationStrategy.tsx';
import { AxiosError } from 'axios';

const { mockUpdateProposal } = vi.hoisted(() => ({ mockUpdateProposal: vi.fn() }));

vi.mock('@/generated', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/generated')>()),
  PPTAPIProposalPreparationApiFactory: () => ({
    updateProposalOsoApiV17PhtPrslsPrslIdPut: mockUpdateProposal
  })
}));

// The form's other slices match the proposal being saved, as they do when seeded from the store
const formSlices = getProposalFormValues(MockProposalFrontend);

describe('PutProposal Service', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('returns data from API', async () => {
    mockUpdateProposal.mockResolvedValue({ data: MockProposalBackend });
    const result = await PutProposal(formSlices, PROPOSAL_STATUS.DRAFT);
    expect(result).to.deep.equal({ data: MockProposalBackend });
  });

  test('saves a draft by default', async () => {
    mockUpdateProposal.mockResolvedValue({ data: MockProposalBackend });
    await PutProposal(formSlices);
    expect(mockUpdateProposal).toHaveBeenCalledWith(
      formSlices.prslId,
      expect.objectContaining({ status: PROPOSAL_STATUS.DRAFT })
    );
  });

  test.each([PROPOSAL_STATUS.DRAFT, PROPOSAL_STATUS.SUBMITTED])(
    'sends the form values with the save metadata for %s',
    async (status) => {
      vi.useFakeTimers({ toFake: ['Date'] });
      mockUpdateProposal.mockResolvedValue({ data: MockProposalBackend });
      const form: ProposalType = {
        ...formSlices,
        title: 'Title from RHF',
        proposalType: { type: PROPOSAL_TYPE.KEY_SCIENCE, subTypes: [PROPOSAL_SUBTYPE.JOINT] },
        abstract: 'Abstract from RHF',
        scienceCategory: 7
      };
      const submitted = status === PROPOSAL_STATUS.SUBMITTED;

      await PutProposal(form, status);

      expect(mockUpdateProposal).toHaveBeenCalledExactlyOnceWith(form.prslId, {
        ...mapFormToPdm(form),
        status,
        submitted_on: submitted ? new Date().toISOString() : null,
        submitted_by: submitted ? getUserId() : ''
      });
    }
  );

  test('sends an empty title from the form', async () => {
    mockUpdateProposal.mockResolvedValue({ data: MockProposalBackend });

    await PutProposal({ ...formSlices, title: '' }, PROPOSAL_STATUS.DRAFT);

    expect(mockUpdateProposal).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        proposal_info: expect.objectContaining({ title: '' })
      })
    );
  });

  test('returns error message on API failure', async () => {
    mockUpdateProposal.mockRejectedValue(new Error('Network Error'));
    const result = await PutProposal(formSlices, PROPOSAL_STATUS.DRAFT);
    expect(result).toStrictEqual({ error: 'Network Error' });
  });

  test('maps an axios error through mapAxiosError', async () => {
    const axiosError = new AxiosError('Request failed with status code 500');
    axiosError.response = { status: 500 } as AxiosError['response'];
    mockUpdateProposal.mockRejectedValue(axiosError);
    const result = await PutProposal(formSlices, PROPOSAL_STATUS.DRAFT);
    expect(result).toStrictEqual({ error: 'Server responded with an error: 500' });
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    mockUpdateProposal.mockRejectedValue({ unexpected: 'object' });
    const result = await PutProposal(formSlices, PROPOSAL_STATUS.DRAFT);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result undefined', async () => {
    mockUpdateProposal.mockResolvedValue(undefined);
    const result = await PutProposal(formSlices, PROPOSAL_STATUS.DRAFT);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result null', async () => {
    mockUpdateProposal.mockResolvedValue(null);
    const result = await PutProposal(formSlices, PROPOSAL_STATUS.DRAFT);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });
});

describe('mapCalibrationStrategyToBackend', () => {
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

    const result = mapCalibrationStrategyToBackend(input);

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

    const result = mapCalibrationStrategyToBackend(input);

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

describe('getReferenceCoordinate', () => {
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
    const result = getReferenceCoordinate(galactic);
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
    const result = getReferenceCoordinate(icrs);
    expect(result).toEqual({
      kind: REFERENCE_COORDINATE_TYPE_ICRS.label,
      ra_str: '12:34:56.7',
      dec_str: '-12:34:56.7'
    });
  });
});

describe('getObservationTypeDetails', () => {
  const mockObsBase = {
    getBandwidth: () => ({ value: 100, unit: 'MHz' }),
    spectralResolution: '14.13 Hz (21.2 m/s)',
    zoomChannels: 1000
  };

  test('should return correct details for TYPE_CONTINUUM', () => {
    const obs = {
      ...mockObsBase,
      type: TYPE_CONTINUUM
    } as any;
    const result = getObservationTypeDetails(obs);
    expect(result.observation_type).toBe(TYPE_CONTINUUM);
    expect(result.bandwidth).toBeDefined();
    expect(result.central_frequency).toBeDefined();
    expect(result.supplied).toBeDefined();
  });

  test('should return correct details for TYPE_ZOOM', () => {
    const obs = {
      ...mockObsBase,
      type: TYPE_ZOOM,
      spectralResolution: '1.2 kHz (2.5 km/s)',
      zoomChannels: 2000
    } as any;
    const result = getObservationTypeDetails(obs);
    expect(result.observation_type).toBe(TYPE_ZOOM_LONG);
    expect(result.spectral_resolution).toBe('1.2 kHz (2.5 km/s)');
    expect(result.number_of_channels).toBe(2000);
  });

  test('should return correct details for TYPE_PST', () => {
    const obs = {
      ...mockObsBase,
      type: TYPE_PST,
      pstMode: 1
    } as any;
    const result = getObservationTypeDetails(obs);
    expect(result.observation_type).toBe(TYPE_PST);
    expect(result.pst_mode).toBe(PST_MODES[1].mapping);
  });

  test('should return correct details for unknown type (default)', () => {
    const obs = {
      ...mockObsBase,
      type: 999
    } as any;
    const result = getObservationTypeDetails(obs);
    expect(result.observation_type).toBe(TYPE_PST);
  });
});
