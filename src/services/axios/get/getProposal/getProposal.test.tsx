import { describe, test, expect, vi, beforeEach } from 'vitest';
import * as CONSTANTS from '@utils/constants.ts';
import Proposal from '@utils/types/proposal.tsx';
import { BeamBackend } from '@utils/types/target.tsx';
import {
  RA_TYPE_GALACTIC,
  RA_TYPE_ICRS,
  OBSERVATION_TYPE_BACKEND,
  TYPE_ZOOM,
  TYPE_PST,
  TYPE_CONTINUUM,
  FREQUENCY_UNITS,
  BAND_LOW_STR
} from '@utils/constants.ts';
import GetProposal, {
  GetMockProposal,
  mapping,
  getBeam,
  getInvestigators,
  getScienceCategory,
  getObservingMode,
  getReferenceCoordinate,
  getBandwidth,
  getObservationType,
  getFrequencyAndBandwidthUnits
} from './getProposal.tsx';
import { MockProposalBackend, MockProposalBackendZoom } from './mockProposalBackend.tsx';
import {
  MockNullProposalFrontend,
  MockProposalFrontend,
  MockProposalFrontendZoom
} from './mockProposalFrontend.tsx';
describe('Helper Functions', () => {
  test('GetMockProposal returns mock proposal', () => {
    const result = GetMockProposal();
    expect(result).to.deep.equal(MockProposalFrontend);
  });

  test('mapping returns mapped continuum proposal from backend to frontend format', () => {
    const proposalFrontEnd: Proposal = mapping(MockProposalBackend);
    expect(proposalFrontEnd).to.deep.equal(MockProposalFrontend);
  });

  test.skip('mapping returns mapped zoom proposal from backend to frontend format', () => {
    const proposalFrontEnd: Proposal = mapping(MockProposalBackendZoom);
    expect(proposalFrontEnd).to.deep.equal(MockProposalFrontendZoom);
  });
});

describe('GetProposal Service', () => {
  let mockedAuthClient: any;
  beforeEach(() => {
    vi.resetAllMocks();
    mockedAuthClient = {
      put: vi.fn(),
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { clear: vi.fn, eject: vi.fn(), use: vi.fn() },
        response: { clear: vi.fn, eject: vi.fn(), use: vi.fn() }
      }
    };
  });

  test('should return mock data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await GetProposal(mockedAuthClient, MockProposalBackend.prsl_id);
    expect(result).toEqual(MockProposalFrontend);
  });

  test('returns mapped data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: MockProposalBackend });
    const result = (await GetProposal(mockedAuthClient, MockProposalBackend.prsl_id)) as Proposal;
    expect(result).to.deep.equal(MockProposalFrontend);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockRejectedValue(new Error('Network Error'));
    const result = await GetProposal(mockedAuthClient, MockProposalBackend.prsl_id);
    expect(result).toBe('Network Error');
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockRejectedValue({ unexpected: 'object' });
    const result = await GetProposal(mockedAuthClient, MockProposalBackend.prsl_id);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  test("mapping doesn't crash when receiving unexpected data", async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: { not: 'expected' } });
    const result = await GetProposal(mockedAuthClient, MockProposalBackend.prsl_id);
    expect(result).toEqual(MockNullProposalFrontend);
  });

  test('returns error.API_UNKNOWN_ERROR when API returns no data', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue(undefined);
    const result = await GetProposal(mockedAuthClient, MockProposalBackend.prsl_id);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});

describe('getBeam', () => {
  test('should correctly map BeamBackend to Beam', () => {
    const input: BeamBackend = {
      beam_id: 1,
      beam_name: 'Test Beam',
      beam_coordinate: {
        kind: 'ICRS',
        ra_str: '12:34:56.78',
        dec_str: '-12:34:56.78',
        pm_ra: 1.23,
        pm_dec: -1.23,
        epoch: 2000,
        parallax: 0.1
      },
      stn_weights: [0.5, 0.8]
    };

    const expectedOutput = {
      id: 1,
      beamName: 'Test Beam',
      beamCoordinate: {
        kind: 'icrs',
        raStr: '12:34:56.78',
        decStr: '-12:34:56.78',
        pmRa: 1.23,
        pmDec: -1.23,
        epoch: 2000,
        parallax: 0.1
      },
      stnWeights: [0.5, 0.8]
    };

    const result = getBeam(input);
    expect(result).toEqual(expectedOutput);
  });

  test('should handle missing stn_weights by defaulting to an empty array', () => {
    const input: BeamBackend = {
      beam_id: 2,
      beam_name: 'Beam Without Weights',
      beam_coordinate: {
        kind: 'ICRS',
        ra_str: '01:23:45.67',
        dec_str: '+01:23:45.67',
        pm_ra: 0.0,
        pm_dec: 0.0,
        epoch: 2020,
        parallax: 0.0
      },
      stn_weights: []
    };

    const expectedOutput = {
      id: 2,
      beamName: 'Beam Without Weights',
      beamCoordinate: {
        kind: 'icrs',
        raStr: '01:23:45.67',
        decStr: '+01:23:45.67',
        pmRa: 0.0,
        pmDec: 0.0,
        epoch: 2020,
        parallax: 0.0
      },
      stnWeights: []
    };

    const result = getBeam(input);
    expect(result).toEqual(expectedOutput);
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
        principal_investigator: false,
        officeLocation: 'Building A',
        jobTitle: 'Researcher'
      },
      {
        user_id: 2,
        status: 'inactive',
        given_name: 'Jane',
        family_name: 'Smith',
        email: 'jane.smith@example.com',
        organization: 'Another Org',
        for_phd: false,
        principal_investigator: true,
        officeLocation: 'Building B',
        jobTitle: 'Scientist'
      }
    ];

    const expected = [
      {
        id: 1,
        status: 'active',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        affiliation: 'Example Org',
        phdThesis: true,
        pi: false,
        officeLocation: 'Building A',
        jobTitle: 'Researcher'
      },
      {
        id: 2,
        status: 'inactive',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        affiliation: 'Another Org',
        phdThesis: false,
        pi: true,
        officeLocation: 'Building B',
        jobTitle: 'Scientist'
      }
    ];

    const result = getInvestigators(input);
    expect(result).toEqual(expected);
  });
});

describe('getObservingMode', () => {
  test('returns the correct value for a valid observing mode', () => {
    expect(getObservingMode('Continuum')).toBe(1);
    expect(getObservingMode('PST')).toBe(2);
  });

  test('returns null for an invalid observing mode', () => {
    expect(getObservingMode('Zoom')).toBeNull();
    expect(getObservingMode('')).toBeNull();
    expect(getObservingMode((null as unknown) as string)).toBeNull();
    expect(getObservingMode('undefined')).toBeNull();
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
    expect(getScienceCategory((null as unknown) as string)).toBeNull();
    expect(getScienceCategory('undefined')).toBeNull();
  });
});

describe('getReferenceCoordinate', () => {
  test('should return a galactic reference coordinate when kind is galactic', () => {
    const input = {
      kind: RA_TYPE_GALACTIC.label,
      l: 123.45,
      b: -67.89,
      pm_l: 0.12,
      pm_b: -0.34,
      epoch: 2000,
      parallax: 0.5
    };

    const expectedOutput = {
      kind: RA_TYPE_GALACTIC.label,
      l: 123.45,
      b: -67.89,
      pmL: 0.12,
      pmB: -0.34,
      epoch: 2000,
      parallax: 0.5
    };

    const result = getReferenceCoordinate(input);
    expect(result).toEqual(expectedOutput);
  });

  test('should return an ICRS reference coordinate when kind is ICRS', () => {
    const input = {
      kind: RA_TYPE_ICRS.label,
      ra_str: '12:34:56.78',
      dec_str: '-12:34:56.78',
      pm_ra: 1.23,
      pm_dec: -1.23,
      epoch: 2020,
      parallax: 0.1
    };

    const expectedOutput = {
      kind: RA_TYPE_ICRS.label,
      raStr: '12:34:56.78',
      decStr: '-12:34:56.78',
      pmRa: 1.23,
      pmDec: -1.23,
      epoch: 2020,
      parallax: 0.1
    };

    const result = getReferenceCoordinate(input);
    expect(result).toEqual(expectedOutput);
  });

  test('should handle missing properties gracefully', () => {
    const input = {
      kind: RA_TYPE_ICRS.label,
      ra_str: '12:34:56.78',
      dec_str: '-12:34:56.78'
    };

    const expectedOutput = {
      kind: RA_TYPE_ICRS.label,
      raStr: '12:34:56.78',
      decStr: '-12:34:56.78',
      pmRa: undefined,
      pmDec: undefined,
      epoch: undefined,
      parallax: undefined
    };

    const result = getReferenceCoordinate(input);
    expect(result).toEqual(expectedOutput);
  });
});

describe('getBandwidth', () => {
  test('returns the correct bandwidth value when a match is found', () => {
    const result = getBandwidth(100, 1);
    expect(result).toBe(6);
  });

  test('returns the fallback value of 1 when no match is found', () => {
    const result = getBandwidth(300, 1);
    expect(result).toBe(1);
  });

  test('returns the fallback value of 1 when telescope is not found', () => {
    const result = getBandwidth(100, 2);
    expect(result).toBe(1);
  });

  test('handles edge cases with undefined or null inputs', () => {
    expect(getBandwidth((undefined as unknown) as number, 1)).toBe(1);
    expect(getBandwidth(100, (undefined as unknown) as number)).toBe(1);
    expect(getBandwidth((null as unknown) as number, 1)).toBe(1);
    expect(getBandwidth(100, (null as unknown) as number)).toBe(1);
  });
});

describe('getObservationType', () => {
  test('returns TYPE_ZOOM for observation type "zoom"', () => {
    const input = {
      observation_type_details: {
        observation_type: OBSERVATION_TYPE_BACKEND[TYPE_ZOOM]
      }
    };
    const result = getObservationType(input);
    expect(result).toBe(TYPE_ZOOM);
  });

  test('returns TYPE_PST for observation type "pst"', () => {
    const input = {
      observation_type_details: {
        observation_type: OBSERVATION_TYPE_BACKEND[TYPE_PST]
      }
    };
    const result = getObservationType(input);
    expect(result).toBe(TYPE_PST);
  });

  test('returns TYPE_CONTINUUM for observation type "continuum"', () => {
    const input = {
      observation_type_details: {
        observation_type: OBSERVATION_TYPE_BACKEND[TYPE_CONTINUUM]
      }
    };
    const result = getObservationType(input);
    expect(result).toBe(TYPE_CONTINUUM);
  });

  test('returns TYPE_CONTINUUM for unknown observation type', () => {
    const input = {
      observation_type_details: {
        observation_type: 'unknown'
      }
    };
    const result = getObservationType(input);
    expect(result).toBe(TYPE_CONTINUUM);
  });

  test('returns TYPE_CONTINUUM when observation_type_details is undefined', () => {
    const input = {};
    const result = getObservationType(input);
    expect(result).toBe(TYPE_CONTINUUM);
  });

  test('returns TYPE_CONTINUUM when observation_type is null', () => {
    const input = {
      observation_type_details: {
        observation_type: null
      }
    };
    const result = getObservationType(input);
    expect(result).toBe(TYPE_CONTINUUM);
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
