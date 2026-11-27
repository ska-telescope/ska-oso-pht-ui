import { describe, test, expect } from 'vitest';
import { FREQUENCY_UNITS, BAND_LOW_STR } from '@utils/constants.ts';
import {
  getInvestigators,
  getScienceCategory,
  getBandwidth,
  getFrequencyAndBandwidthUnits
} from './getProposal.tsx';

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
