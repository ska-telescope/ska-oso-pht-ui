import { describe, test } from 'vitest';
import '@testing-library/jest-dom';
import {
  getBeamSize,
  isGalactic,
  isLow,
  isNumeric,
  isSuppliedTime,
  transformPerSubBandData,
  transformPerSubBandTime,
  transformSurfaceBrightnessPerSubBandData,
  transformSynthesizedBeamSizePerSubBandData
} from '@/utils/helpersSensCalc.ts';
import { TELESCOPE_LOW, TELESCOPE_MID } from '@ska-telescope/ska-gui-components';
import { RA_TYPE_EQUATORIAL, RA_TYPE_GALACTIC } from '@/utils/constantsSensCalc.ts';
import { SUPPLIED_TYPE_INTEGRATION, SUPPLIED_TYPE_SENSITIVITY } from '@/utils/constants.ts';

describe('Sensitivity Calculator helper functions', () => {
  test('Telescope type, TELESCOPE_LOW', () => {
    expect(isLow(TELESCOPE_LOW)).toBe(true);
  });
  test('Telescope type, TELESCOPE_MID', () => {
    expect(isLow(TELESCOPE_MID)).toBe(false);
  });

  test('Numeric check, Returns false when supplied value is "1.4"', () => {
    expect(isNumeric('1.4')).toBe(false);
  });
  test('Numeric check, Returns true when supplied value is "14"', () => {
    expect(isNumeric('14')).toBe(true);
  });

  test('Beam Size', () => {
    expect(
      getBeamSize({ beam_maj: { value: 1000, unit: 'max' }, beam_min: { value: 0, unit: 'min' } })
    ).toStrictEqual('1000.0" x 0.0"');
  });

  test('Transform Surface Brightness Per Sub Band Data, MID continuum default 4 subbands values', () => {
    const minMax = {
      min_value: {
        value: 1498.1171726979103,
        unit: 'K'
      },
      max_value: {
        value: 1980.544835343319,
        unit: 'K'
      }
    };
    const expected = '1.98 K - 1.50 K';
    expect(transformSurfaceBrightnessPerSubBandData(minMax)).toStrictEqual(expected);
  });
  test('Transform Surface Brightness Per Sub Band Data, LOW continuum default 4 subbands values', () => {
    const minMax = {
      min_value: {
        value: 388.99532187953145,
        unit: 'K'
      },
      max_value: {
        value: 583.4714986446586,
        unit: 'K'
      }
    };
    const expected = '583.47 K - 389.00 K';
    expect(transformSurfaceBrightnessPerSubBandData(minMax)).toStrictEqual(expected);
  });

  test('Transform Synthesized Beam Size Per Sub Band Data, MID continuum default 3 subbands values', () => {
    const minMax = {
      min_value: {
        beam_maj: {
          value: 0.32506384997943566,
          unit: 'arcsec'
        },
        beam_min: {
          value: 0.2906214059979424,
          unit: 'arcsec'
        }
      },
      max_value: {
        beam_maj: {
          value: 0.46953667219251816,
          unit: 'arcsec'
        },
        beam_min: {
          value: 0.4197864753303612,
          unit: 'arcsec'
        }
      }
    };
    const expected = `0.47" x 0.42" - 0.33" x 0.29"`;
    expect(transformSynthesizedBeamSizePerSubBandData(minMax)).toStrictEqual(expected);
  });
  test('Transform Synthesized Beam Size Per Sub Band Data, LOW continuum default 3 subbands values', () => {
    const minMax = {
      min_value: {
        beam_maj: {
          value: 2.5901188513301396,
          unit: 'arcsec'
        },
        beam_min: {
          value: 2.017267616826003,
          unit: 'arcsec'
        }
      },
      max_value: {
        beam_maj: {
          value: 7.7703565539904185,
          unit: 'arcsec'
        },
        beam_min: {
          value: 6.051802850478009,
          unit: 'arcsec'
        }
      }
    };
    const expected = `7.77" x 6.05" - 2.59" x 2.02"`;
    expect(transformSynthesizedBeamSizePerSubBandData(minMax)).toStrictEqual(expected);
  });

  test('Transform Per Sub Band Data, MID continuum default 2 subbands values', () => {
    const minMax = {
      min_value: {
        value: 0.00007388878584369049,
        unit: 'Jy'
      },
      max_value: {
        value: 0.0000882656615002801,
        unit: 'Jy'
      }
    };
    const expected = '88.27 μJy - 73.89 μJy';
    expect(transformPerSubBandData(minMax)).toStrictEqual(expected);
  });
  test('Transform Per Sub Band Data, LOW continuum default 2 subbands values', () => {
    const minMax = {
      min_value: {
        value: 0.00009982817798891444,
        unit: 'Jy / beam'
      },
      max_value: {
        value: 0.00012918274365706996,
        unit: 'Jy / beam'
      }
    };
    const expected = '129.18 μJy/beam - 99.83 μJy/beam';
    expect(transformPerSubBandData(minMax)).toStrictEqual(expected);
  });

  test('Transform Per Sub Band Time', () => {
    const minMax = {
      min_value: {
        value: 0.0001496772391786038,
        unit: 'Jy / beam'
      },
      max_value: {
        value: 0.00022404690051821644,
        unit: 'Jy / beam'
      }
    };
    expect(transformPerSubBandTime(minMax)).toStrictEqual('224.05 μs - 149.68 μs');
  });

  test('Coordinate check, is Galactic, Returns false when supplied value is "RA_TYPE_EQUATORIAL"', () => {
    expect(isGalactic(RA_TYPE_EQUATORIAL)).toBe(false);
  });
  test('Coordinate check, is Galactic, Returns true when supplied value is "RA_TYPE_GALACTIC"', () => {
    expect(isGalactic(RA_TYPE_GALACTIC)).toBe(true);
  });

  test('Supplied Time check, Returns true when supplied value is "SUPPLIED_TYPE_INTEGRATION"', () => {
    expect(isSuppliedTime(SUPPLIED_TYPE_INTEGRATION)).toBe(true);
  });
  test('Supplied Time check, Returns false when supplied value is "SUPPLIED_TYPE_SENSITIVITY"', () => {
    expect(isSuppliedTime(SUPPLIED_TYPE_SENSITIVITY)).toBe(false);
  });
});
