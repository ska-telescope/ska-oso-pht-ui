import { describe, it, expect, test, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { PAGE_OBSERVATION, PROPOSAL_TYPE, STATUS_ERROR, STATUS_OK } from '../constants';
import {
  useValidateProposal,
  validateDeclination,
  validateDetailsPage,
  validateRightAscension,
  validateTitlePage
} from './validation';
import { getProposalFormDefaults } from '@/models/proposals/useProposalForm';
import { newSvObservation, OBSERVING_MODE } from '@/models/proposals/observations';

vi.mock('../osd/useOSDAccessors/useOSDAccessors', async () => {
  const { MockObservatoryDataFrontend } =
    await import('@services/axios/get/getObservatoryData/mockObservatoryDataFrontend');
  return {
    useOSDAccessors: () => ({
      osdLOW: MockObservatoryDataFrontend.capabilities.low,
      osdMID: MockObservatoryDataFrontend.capabilities.mid
    })
  };
});

describe('useValidateProposal', () => {
  const observation = newSvObservation(OBSERVING_MODE.CONTINUUM, 15);
  const validate = () => renderHook(() => useValidateProposal()).result.current;

  // The form has every observation, including invalid ones the store has no copy of
  test.each([
    ['valid', observation, STATUS_OK],
    [
      'outside its band',
      { ...observation, centralFrequency: { value: 400, unit: 'MHz' } },
      STATUS_ERROR
    ]
  ] as const)(
    'gives the Observations page of form values with an observation %s its status',
    (_, formObservation, status) => {
      const values = { ...getProposalFormDefaults(), observations: [formObservation] };
      expect(validate()(values)[PAGE_OBSERVATION]).toBe(status);
    }
  );
});

describe('validateTitlePage', () => {
  it('returns STATUS_ERROR for titles with unsupported characters', () => {
    expect(
      validateTitlePage({
        title: 'A proposal with @',
        proposalType: { type: PROPOSAL_TYPE.STANDARD, subTypes: [] }
      })
    ).toBe(STATUS_ERROR);
  });

  it.each([
    ['a title and a proposal type', 'A proposal', PROPOSAL_TYPE.STANDARD, STATUS_OK],
    ['no proposal type', 'A proposal', null, STATUS_ERROR],
    ['no title', '', PROPOSAL_TYPE.STANDARD, STATUS_ERROR]
  ] as const)('is complete only with both: %s', (_, title, proposalType, status) => {
    expect(validateTitlePage({ title, proposalType: { type: proposalType, subTypes: [] } })).toBe(
      status
    );
  });
});

describe('validateDetailsPage', () => {
  const observation = newSvObservation(OBSERVING_MODE.CONTINUUM, 15);
  const standard: Parameters<typeof validateDetailsPage>[0] = {
    proposalType: { type: PROPOSAL_TYPE.STANDARD, subTypes: [] },
    abstract: 'An abstract',
    scienceCategory: 1,
    observations: []
  };

  it.each([2300, 2301])('checks the Zod character limit at %s characters', (length) => {
    expect(validateDetailsPage({ ...standard, abstract: 'a'.repeat(length) })).toBe(
      length === 2300 ? STATUS_OK : STATUS_ERROR
    );
  });

  it('requires an abstract and a science category for standard proposals', () => {
    expect(validateDetailsPage(standard)).toBe(STATUS_OK);
    expect(validateDetailsPage({ ...standard, scienceCategory: null })).toBe(STATUS_ERROR);
  });

  it('requires an abstract and an observation (the observing mode) for SV proposals', () => {
    const sv = {
      ...standard,
      proposalType: { type: PROPOSAL_TYPE.SCIENCE_VERIFICATION, subTypes: [] },
      scienceCategory: null
    };
    expect(validateDetailsPage({ ...sv, observations: [observation] })).toBe(STATUS_OK);
    expect(validateDetailsPage(sv)).toBe(STATUS_ERROR);
    expect(validateDetailsPage({ ...sv, abstract: '' })).toBe(STATUS_ERROR);
  });
});

describe('validateRightAscension', () => {
  test('validates correct equatorial format', () => {
    expect(validateRightAscension('12:34:56')).toBeNull();
    expect(validateRightAscension('2:34:56')).toBeNull();
    expect(validateRightAscension('+12:34:56')).toBeNull();
  });

  test('rejects incorrect equatorial format', () => {
    expect(validateRightAscension('123:45:67')).toBe('0'); // Invalid hours
    expect(validateRightAscension('12:345:67')).toBe('0'); // Invalid minutes
    expect(validateRightAscension('12:3:67')).toBe('0'); // Invalid minutes
    expect(validateRightAscension('12:34:567')).toBe('0'); // Invalid seconds
    expect(validateRightAscension('12:34:5')).toBe('0'); // Invalid seconds
    expect(validateRightAscension('12:34')).toBe('0'); // Missing seconds
    expect(validateRightAscension('12:34:')).toBe('0'); // Missing seconds value
    expect(validateRightAscension('')).toBe('0'); // Empty string
    expect(validateRightAscension('abc:def:ghi')).toBe('0'); // Non-numeric input
  });

  test('validates fractional seconds', () => {
    expect(validateRightAscension('12:34:56.789')).toBeNull(); // Valid fractional seconds
    expect(validateRightAscension('12:34:56.789 ')).toBeNull(); // Valid with trailing whitespace
    expect(validateRightAscension('12:34:56.')).toBeNull(); // Valid trailing dot
  });

  test('rejects out-of-range values', () => {
    expect(validateRightAscension('91:00:00')).toBe('1'); // Hours out of range
    expect(validateRightAscension('-91:00:00')).toBe('0'); // Negative sign → format error
    expect(validateRightAscension('12:60:00')).toBe('0'); // Minutes > 59 is a format error (hours are fine)
    expect(validateRightAscension('12:34:60')).toBe('0'); // Seconds >= 60 is a format error (hours are fine)
  });

  test('rejects negative values', () => {
    expect(validateRightAscension('-12:34:56')).toBe('0');
    expect(validateRightAscension('-12:34:56.789')).toBe('0');
  });

  test('rejects targets not visible', () => {
    expect(validateRightAscension('50:00:00')).toBe('1');
    expect(validateRightAscension('89:50:00')).toBe('1');
    expect(validateRightAscension('90:00:00')).toBe('1');
  });
});

describe('validateDeclination', () => {
  test('validates correct equatorial format', () => {
    expect(validateDeclination('12:34:56')).toBe(null);
    expect(validateDeclination('2:34:56')).toBe(null);
    expect(validateDeclination('-12:34:56')).toBe(null);
    expect(validateDeclination('+12:34:56')).toBe(null);
    expect(validateDeclination('-90:00:00')).toBe(null);
  });

  test('rejects incorrect equatorial format', () => {
    expect(validateDeclination('123:45:67')).toBe('0'); // Invalid hours
    expect(validateDeclination('12:345:67')).toBe('0'); // Invalid minutes
    expect(validateDeclination('12:3:67')).toBe('0'); // Invalid minutes
    expect(validateDeclination('12:34:567')).toBe('0'); // Invalid seconds
    expect(validateDeclination('12:34:5')).toBe('0'); // Invalid seconds
    expect(validateDeclination('12:34')).toBe('0'); // Missing seconds
    expect(validateDeclination('12:34:')).toBe('0'); // Missing seconds value
    expect(validateDeclination('')).toBe('0'); // Empty string
    expect(validateDeclination('abc:def:ghi')).toBe('0'); // Non-numeric input
  });

  test('validates fractional seconds', () => {
    expect(validateDeclination('12:34:56.789')).toBe(null); // Valid fractional seconds
    expect(validateDeclination('-12:34:56.789')).toBe(null); // Valid negative fractional seconds
    expect(validateDeclination('-90:00:00.0')).toBe(null); // Valid edge case with fractional seconds
    expect(validateDeclination('12:34:56.789 ')).toBe(null); // Valid trailing whitespace
    expect(validateDeclination('-12:34:56.789 ')).toBe(null); // Valid trailing whitespace
    expect(validateDeclination('12:34:56.')).toBe(null); // Valid trailing dot
    expect(validateDeclination('-12:34:56.')).toBe(null); // Valid negative trailing dot
  });

  test('rejects out-of-range values', () => {
    expect(validateDeclination('91:00:00')).toBe('1'); // Hours out of range
    expect(validateDeclination('-91:00:00')).toBe('1'); // Negative hours out of range
    expect(validateDeclination('12:60:00')).toBe('0'); // Invalid format (60 min has no meaning in context of sky direction)
    expect(validateDeclination('12:34:60')).toBe('0'); // Invalid format (60 sec has no meaning in context of sky direction)
  });
});
