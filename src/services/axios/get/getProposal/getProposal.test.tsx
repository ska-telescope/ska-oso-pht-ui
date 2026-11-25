import { describe, test, expect, vi, beforeEach } from 'vitest';
import {
  REFERENCE_COORDINATE_TYPE_GALACTIC,
  REFERENCE_COORDINATE_TYPE_ICRS,
  FREQUENCY_UNITS,
  BAND_LOW_STR
} from '@utils/constants.ts';
import { AxiosError, type AxiosResponse } from 'axios';
import { UNKNOWN_API_ERROR } from '../../apiResult/apiResult.ts';
import {
  GetProposalPdm,
  getInvestigators,
  getScienceCategory,
  getReferenceCoordinate,
  getBandwidth,
  getFrequencyAndBandwidthUnits
} from './getProposal.tsx';
import { MockProposalBackend } from './mockProposalBackend.tsx';

const { mockGetProposal } = vi.hoisted(() => ({ mockGetProposal: vi.fn() }));

vi.mock('@/generated', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/generated')>()),
  PPTAPIProposalPreparationApiFactory: () => ({
    getProposalOsoApiV17PhtPrslsPrslIdGet: mockGetProposal
  })
}));

type ReferenceCoordinateInput = Parameters<typeof getReferenceCoordinate>[0];

describe('GetProposalPdm', () => {
  beforeEach(() => {
    mockGetProposal.mockReset();
  });

  test('fetches the proposal by ID and returns the unmapped PDM', async () => {
    mockGetProposal.mockResolvedValue({ data: MockProposalBackend });
    const result = await GetProposalPdm(MockProposalBackend.prsl_id as string);
    expect(mockGetProposal).toHaveBeenCalledExactlyOnceWith(MockProposalBackend.prsl_id);
    expect(result).toEqual({ data: MockProposalBackend });
  });

  test('returns the standard error when the API returns no data', async () => {
    mockGetProposal.mockResolvedValue(undefined);
    await expect(GetProposalPdm('prsl-1')).resolves.toEqual({ error: UNKNOWN_API_ERROR });
  });

  test('returns the error message when the request fails', async () => {
    mockGetProposal.mockRejectedValue(new Error('Network Error'));
    await expect(GetProposalPdm('prsl-1')).resolves.toEqual({ error: 'Network Error' });
  });

  test('returns the standard error when something other than an Error is thrown', async () => {
    mockGetProposal.mockRejectedValue({ unexpected: 'object' });
    await expect(GetProposalPdm('prsl-1')).resolves.toEqual({ error: UNKNOWN_API_ERROR });
  });

  test('returns the server error from a failed request', async () => {
    mockGetProposal.mockRejectedValue(
      new AxiosError('Request failed', 'ERR_BAD_RESPONSE', undefined, undefined, {
        status: 500,
        data: { title: 'Internal Server Error', detail: 'ODA unavailable' }
      } as AxiosResponse)
    );
    await expect(GetProposalPdm('prsl-1')).resolves.toEqual({
      error: 'Internal Server Error: ODA unavailable'
    });
  });
});

describe('getInvestigators', () => {
  test('returns an empty array when input is null', () => {
    const result = getInvestigators(null);
    expect(result).toEqual([]);
  });

  test('returns an empty array when input is an empty array', () => {
    const result = getInvestigators([]);
    expect(result).toEqual([]);
  });

  test('maps InvestigatorBackend objects to Investigator objects correctly', () => {
    const input = [
      {
        user_id: 1,
        status: 'active',
        given_name: 'John',
        family_name: 'Doe',
        email: 'john.doe@example.com',
        organization: 'Example Org',
        for_phd: true,
        principal_investigator: false
      },
      {
        user_id: 2,
        status: 'inactive',
        given_name: 'Jane',
        family_name: 'Smith',
        email: 'jane.smith@example.com',
        organization: 'Another Org',
        for_phd: false,
        principal_investigator: true
      }
    ];

    const expected = [
      {
        id: 1,
        status: 'active',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phdThesis: true,
        pi: false
      },
      {
        id: 2,
        status: 'inactive',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phdThesis: false,
        pi: true
      }
    ];

    const result = getInvestigators(input);
    expect(result).toEqual(expected);
  });
});

describe('getScienceCategory', () => {
  test('returns the correct value for a valid science category', () => {
    expect(getScienceCategory('Cosmology')).toBe(1);
    expect(getScienceCategory('Magnetism')).toBe(9);
  });

  test('returns null for an invalid science category', () => {
    expect(getScienceCategory('Biology')).toBeNull();
    expect(getScienceCategory('')).toBeNull();
    expect(getScienceCategory(null as unknown as string)).toBeNull();
    expect(getScienceCategory('undefined')).toBeNull();
  });
});

describe('getReferenceCoordinate', () => {
  test('should return a galactic reference coordinate when kind is galactic', () => {
    const input = {
      kind: REFERENCE_COORDINATE_TYPE_GALACTIC.label,
      l: 123.45,
      b: -67.89,
      pm_l: 0.12,
      pm_b: -0.34,
      epoch: 2000,
      parallax: 0.5
    };

    const expectedOutput = {
      kind: REFERENCE_COORDINATE_TYPE_GALACTIC.label,
      l: 123.45,
      b: -67.89,
      pmL: 0.12,
      pmB: -0.34,
      epoch: 2000,
      parallax: 0.5
    };

    const result = getReferenceCoordinate(input as unknown as ReferenceCoordinateInput);
    expect(result).toEqual(expectedOutput);
  });

  test('should return an ICRS reference coordinate when kind is ICRS', () => {
    const input = {
      kind: REFERENCE_COORDINATE_TYPE_ICRS.label,
      ra_str: '12:34:56.78',
      dec_str: '-12:34:56.78',
      pm_ra: 1.23,
      pm_dec: -1.23,
      epoch: 2020,
      parallax: 0.1
    };

    const expectedOutput = {
      kind: REFERENCE_COORDINATE_TYPE_ICRS.label,
      raStr: '12:34:56.78',
      decStr: '-12:34:56.78',
      pmRa: 1.23,
      pmDec: -1.23,
      epoch: 2020,
      parallax: 0.1
    };

    const result = getReferenceCoordinate(input as unknown as ReferenceCoordinateInput);
    expect(result).toEqual(expectedOutput);
  });

  test('should handle missing properties gracefully', () => {
    const input = {
      kind: REFERENCE_COORDINATE_TYPE_ICRS.label,
      ra_str: '12:34:56.78',
      dec_str: '-12:34:56.78'
    };

    const expectedOutput = {
      kind: REFERENCE_COORDINATE_TYPE_ICRS.label,
      raStr: '12:34:56.78',
      decStr: '-12:34:56.78',
      pmRa: undefined,
      pmDec: undefined,
      epoch: undefined,
      parallax: undefined
    };

    const result = getReferenceCoordinate(input as unknown as ReferenceCoordinateInput);
    expect(result).toEqual(expectedOutput);
  });
});

describe('getBandwidth', () => {
  test('returns the correct bandwidth value when a match is found', () => {
    const result = getBandwidth(100, 1);
    expect(result).toBe(6);
  });

  test('returns the nearest bandwidth value when there is no exact match', () => {
    // MID options are 3.125/6.25/12.5/25/50/100/200 MHz - 300 is nearest to 200 (value 7).
    const result = getBandwidth(300, 1);
    expect(result).toBe(7);
  });

  test('returns the nearest bandwidth value for a different telescope', () => {
    // LOW options are 24.4140625/48.828125/97.65625/... kHz - 100 is nearest to 97.65625
    // (value 3).
    const result = getBandwidth(100, 2);
    expect(result).toBe(3);
  });

  test('returns the fallback value of 1 when the telescope has no bandwidth options', () => {
    const result = getBandwidth(100, 99);
    expect(result).toBe(1);
  });

  test('handles edge cases with undefined or null inputs', () => {
    expect(getBandwidth(undefined as unknown as number, 1)).toBe(1);
    expect(getBandwidth(100, undefined as unknown as number)).toBe(1);
    expect(getBandwidth(null as unknown as number, 1)).toBe(1);
    expect(getBandwidth(100, null as unknown as number)).toBe(1);
  });
});

describe('getFrequencyAndBandwidthUnits', () => {
  test('returns the correct unit value when a match is found in FREQUENCY_UNITS', () => {
    const inUnits = FREQUENCY_UNITS[0].mapping; // Use a valid mapping from FREQUENCY_UNITS
    const observingBand = BAND_LOW_STR;
    const result = getFrequencyAndBandwidthUnits(inUnits, observingBand);
    expect(result).toBe(FREQUENCY_UNITS[0].value);
  });
});
