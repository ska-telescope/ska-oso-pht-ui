import { describe, test, expect } from 'vitest';
import { getProposalFormValues } from '@/models/proposals/useProposalForm';
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
  PROPOSAL_TYPE
} from '@utils/constants.ts';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import { MockProposalFrontend, MockProposalFrontendZoom } from './mockProposalFrontend.tsx';
import { MockProposalBackend, MockProposalBackendZoom } from './mockProposalBackend.tsx';
import PutProposal, { mockPutProposal } from './putProposal.tsx';
import MappingPutProposal, {
  getObservationTypeDetails,
  getReferenceCoordinate,
  mapCalibrationStrategyToBackend
} from './putProposalMapping.tsx';
import { CalibrationStrategy } from '@utils/types/calibrationStrategy.tsx';

// The form's other slices match the proposal being saved, as they do when seeded from the store
const formSlices = getProposalFormValues(MockProposalFrontend);

describe('Helper Functions', () => {
  test('mockPutProposal returns mock proposal', () => {
    const result = mockPutProposal();
    expect(result).to.deep.equal(MockProposalBackend);
  });

  test('mappingPutProposal returns mapped proposal from frontend to backend format', () => {
    const proposalBackEnd: ProposalBackend = MappingPutProposal(
      MockProposalFrontend,
      PROPOSAL_STATUS.DRAFT
    );
    expect(proposalBackEnd).to.deep.equal(MockProposalBackend);
  });

  test('mappingPutProposal omits empty investigator fields and preserves populated fields', () => {
    const investigator = {
      id: 'user-1',
      status: 'accepted',
      firstName: '',
      lastName: 'Lovelace',
      email: '',
      phdThesis: false,
      pi: true
    };
    const result = MappingPutProposal(
      { ...MockProposalFrontend, investigators: [investigator] },
      PROPOSAL_STATUS.DRAFT
    );
    expect(result.proposal_info.investigators).toEqual([
      {
        user_id: 'user-1',
        status: 'accepted',
        family_name: 'Lovelace',
        for_phd: false,
        principal_investigator: true
      }
    ]);
  });

  test('mappingPutProposal returns mapped proposal with zoom observation from frontend to backend format', () => {
    const proposalBackEnd: ProposalBackend = MappingPutProposal(
      MockProposalFrontendZoom,
      PROPOSAL_STATUS.DRAFT
    );
    expect(proposalBackEnd).to.deep.equal(MockProposalBackendZoom);
  });

  test('mappingPutProposal returns mapped proposal and returns empty array of sub-type when not specified', () => {
    const proposal = { ...MockProposalFrontend, proposalSubType: undefined };
    const proposalBackEnd: ProposalBackend = MappingPutProposal(proposal, PROPOSAL_STATUS.DRAFT);
    expect(proposalBackEnd).to.deep.equal({
      ...MockProposalBackend,
      proposal_info: {
        ...MockProposalBackend.proposal_info,
        proposal_type: { ...MockProposalBackend.proposal_info.proposal_type, attributes: [] }
      }
    });
  });

  test('mappingPutProposal passes the science verification type through with no science category', () => {
    const proposal = {
      ...MockProposalFrontend,
      proposalType: PROPOSAL_TYPE.SCIENCE_VERIFICATION,
      proposalSubType: [],
      scienceCategory: null
    };
    const proposalBackEnd: ProposalBackend = MappingPutProposal(proposal, PROPOSAL_STATUS.DRAFT);
    expect(proposalBackEnd.proposal_info.proposal_type).to.deep.equal({
      main_type: PROPOSAL_TYPE.SCIENCE_VERIFICATION,
      attributes: []
    });
    expect(proposalBackEnd.proposal_info.science_category).to.equal(undefined);
  });
});

describe('PutProposal Service', () => {
  let mockedAuthClient: any;
  afterEach(() => {
    vi.useRealTimers();
  });

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

  test('returns data from API', async () => {
    mockedAuthClient.put.mockResolvedValue({ data: MockProposalBackend });
    const result = await PutProposal(mockedAuthClient, MockProposalFrontend, PROPOSAL_STATUS.DRAFT);
    expect(result).to.deep.equal(MockProposalBackend);
    expect(mockedAuthClient.put).toHaveBeenCalledWith(
      expect.any(String),
      MappingPutProposal(MockProposalFrontend, PROPOSAL_STATUS.DRAFT)
    );
  });

  test.each([PROPOSAL_STATUS.DRAFT, PROPOSAL_STATUS.SUBMITTED])(
    'sends RHF values over the legacy payload for %s without losing other fields',
    async (status) => {
      vi.useFakeTimers({ toFake: ['Date'] });
      mockedAuthClient.put.mockResolvedValue({ data: MockProposalBackend });
      const base = MappingPutProposal(MockProposalFrontend, status);

      await PutProposal(mockedAuthClient, MockProposalFrontend, status, {
        ...formSlices,
        title: 'Title from RHF',
        proposalType: PROPOSAL_TYPE.KEY_SCIENCE,
        abstract: 'Abstract from RHF',
        scienceCategory: 7
      });

      expect(mockedAuthClient.put).toHaveBeenCalledExactlyOnceWith(expect.any(String), {
        ...base,
        proposal_info: {
          ...base.proposal_info,
          title: 'Title from RHF',
          abstract: 'Abstract from RHF',
          science_category: 'High Energy Cosmic Particles',
          proposal_type: {
            ...base.proposal_info.proposal_type,
            main_type: PROPOSAL_TYPE.KEY_SCIENCE
          }
        }
      });
      expect(MockProposalFrontend.title).not.toBe('Title from RHF');
    }
  );

  test('does not replace an empty RHF title with the legacy title', async () => {
    mockedAuthClient.put.mockResolvedValue({ data: MockProposalBackend });

    await PutProposal(mockedAuthClient, MockProposalFrontend, PROPOSAL_STATUS.DRAFT, {
      ...formSlices,
      title: '',
      proposalType: PROPOSAL_TYPE.STANDARD,
      abstract: '',
      scienceCategory: null
    });

    expect(mockedAuthClient.put).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        proposal_info: expect.objectContaining({ title: '' })
      })
    );
  });

  test('returns error message on API failure', async () => {
    mockedAuthClient.put.mockRejectedValue(new Error('Network Error'));
    const result = await PutProposal(mockedAuthClient, MockProposalFrontend, PROPOSAL_STATUS.DRAFT);
    expect(result).toStrictEqual({ error: 'Network Error' });
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    mockedAuthClient.put.mockRejectedValue({ unexpected: 'object' });
    const result = await PutProposal(mockedAuthClient, MockProposalFrontend, PROPOSAL_STATUS.DRAFT);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result undefined', async () => {
    mockedAuthClient.put.mockResolvedValue(undefined);
    const result = await PutProposal(mockedAuthClient, MockProposalFrontend, PROPOSAL_STATUS.DRAFT);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result null', async () => {
    mockedAuthClient.put.mockResolvedValue(null);
    const result = await PutProposal(mockedAuthClient, MockProposalFrontend, PROPOSAL_STATUS.DRAFT);
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
      effectiveResolution: '2.3 kHz (4.9 km/s)',
      zoomChannels: 2000
    } as any;
    const result = getObservationTypeDetails(obs);
    expect(result.observation_type).toBe(TYPE_ZOOM_LONG);
    expect(result.spectral_resolution).toBe('1.2 kHz (2.5 km/s)');
    expect(result.effective_resolution).toBe('2.3 kHz (4.9 km/s)');
    expect(result.number_of_channels).toBe('2000');
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
