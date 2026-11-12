import { describe, it, expect, test } from 'vitest';
import {
  PROPOSAL_TYPE,
  STATUS_ERROR,
  STATUS_OK,
  STATUS_PARTIAL,
  SUPPLIED_INTEGRATION_TIME_MAX_HOURS,
  SUPPLIED_INTEGRATION_TIME_UNITS_H,
  SUPPLIED_INTEGRATION_TIME_UNITS_M,
  SUPPLIED_TYPE_INTEGRATION,
  SUPPLIED_TYPE_SENSITIVITY,
  TIME_HOURS,
  TYPE_CONTINUUM
} from '../constants';
import { timeConversion } from '../helpers';
import {
  validateDeclination,
  validateDetailsPage,
  validateObservationPage,
  validateRightAscension,
  validateTitlePage
} from './validation';

describe('validateTitlePage', () => {
  it('returns STATUS_ERROR for titles with unsupported characters', () => {
    expect(
      validateTitlePage({ title: 'A proposal with @', proposalType: PROPOSAL_TYPE.STANDARD })
    ).toBe(STATUS_ERROR);
  });
});

describe('validateObservationPage supplied rules', () => {
  const baseObservation = {
    supplied: {
      type: SUPPLIED_TYPE_INTEGRATION,
      value: 1,
      units: SUPPLIED_INTEGRATION_TIME_UNITS_H
    }
  };

  it('returns STATUS_OK when observations exist with valid supplied values, with no target', () => {
    const proposal = {
      observations: [baseObservation],
      targetObservation: []
    };
    expect(validateObservationPage(proposal as any)).toBe(STATUS_OK);
  });

  it('returns STATUS_ERROR for integration supplied values above the converted max', () => {
    const maxMinutes = timeConversion(
      SUPPLIED_INTEGRATION_TIME_MAX_HOURS,
      TIME_HOURS,
      SUPPLIED_INTEGRATION_TIME_UNITS_M
    );
    const proposal = {
      observations: [
        {
          ...baseObservation,
          supplied: {
            type: SUPPLIED_TYPE_INTEGRATION,
            value: maxMinutes + 1,
            units: SUPPLIED_INTEGRATION_TIME_UNITS_M
          }
        }
      ],
      targetObservation: []
    };
    expect(validateObservationPage(proposal as any)).toBe(STATUS_ERROR);
  });

  it('returns STATUS_OK for sensitivity supplied values greater than zero', () => {
    const proposal = {
      observations: [
        {
          ...baseObservation,
          supplied: {
            type: SUPPLIED_TYPE_SENSITIVITY,
            value: 5,
            units: 1
          }
        }
      ],
      targetObservation: []
    };
    expect(validateObservationPage(proposal as any)).toBe(STATUS_OK);
  });

  it('returns STATUS_ERROR when a linked observation has an invalid supplied value', () => {
    const proposal = {
      observations: [{ ...baseObservation, supplied: { ...baseObservation.supplied, value: -1 } }],
      targetObservation: [{ targetId: '1', observationId: 'obs-1' }]
    };
    expect(validateObservationPage(proposal as any)).toBe(STATUS_ERROR);
  });

  it('transitions Observation breadcrumb status from STATUS_OK to STATUS_ERROR when supplied becomes invalid', () => {
    const validProposal = {
      observations: [baseObservation],
      targetObservation: []
    };
    expect(validateObservationPage(validProposal as any)).toBe(STATUS_OK);

    const invalidProposal = {
      observations: [{ ...baseObservation, supplied: { ...baseObservation.supplied, value: -1 } }],
      targetObservation: []
    };
    expect(validateObservationPage(invalidProposal as any)).toBe(STATUS_ERROR);
  });
});

describe('validateDetailsPage', () => {
  const observation = { id: 'obs-1', type: TYPE_CONTINUUM };

  it('requires an abstract and a science category for standard proposals', () => {
    const proposal = { proposalType: PROPOSAL_TYPE.STANDARD, abstract: 'An abstract' };
    expect(validateDetailsPage({ ...proposal, scienceCategory: 1 } as any)).toBe(STATUS_OK);
    expect(validateDetailsPage({ ...proposal, scienceCategory: null } as any)).toBe(STATUS_PARTIAL);
  });

  it('requires an abstract and an observation (the observing mode) for SV proposals', () => {
    const proposal = {
      proposalType: PROPOSAL_TYPE.SCIENCE_VERIFICATION,
      scienceCategory: null,
      abstract: 'An abstract'
    };
    expect(validateDetailsPage({ ...proposal, observations: [observation] } as any)).toBe(
      STATUS_OK
    );
    expect(validateDetailsPage({ ...proposal, observations: [] } as any)).toBe(STATUS_PARTIAL);
    expect(validateDetailsPage({ ...proposal, abstract: '', observations: [] } as any)).toBe(
      STATUS_ERROR
    );
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
