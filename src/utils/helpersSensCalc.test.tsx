import { describe, test } from 'vitest';
import '@testing-library/jest-dom';
import { TELESCOPE_LOW, TELESCOPE_MID } from '@ska-telescope/ska-gui-components';
import {
  getBeamSize,
  getImageWeightingMapping,
  getSensitivitiesUnitsMapping,
  isGalactic,
  isLow,
  isNumeric,
  isSuppliedTime,
  shiftSensitivity,
  shiftTime,
  timeConversion,
  transformPerSubBandData,
  transformPerSubBandTime,
  transformSurfaceBrightnessPerSubBandData,
  transformSynthesizedBeamSizePerSubBandData
} from '@/utils/helpersSensCalc.ts';
import {
  RA_TYPE_ICRS,
  RA_TYPE_GALACTIC,
  SUPPLIED_TYPE_INTEGRATION,
  SUPPLIED_TYPE_SENSITIVITY
} from '@/utils/constants.ts';

describe('Sensitivity Calculator helper functions', () => {
  test('Telescope type, TELESCOPE_LOW', () => {
    expect(isLow(TELESCOPE_LOW)).equal(true);
  });
  test('Telescope type, TELESCOPE_MID', () => {
    expect(isLow(TELESCOPE_MID)).equal(false);
  });

  test('Numeric check, Returns false when supplied value is "1.4"', () => {
    expect(isNumeric('1.4')).equal(false);
  });
  test('Numeric check, Returns true when supplied value is "14"', () => {
    expect(isNumeric('14')).equal(true);
  });

  test('Beam Size', () => {
    expect(
      getBeamSize({ beam_maj: { value: 1000, unit: 'max' }, beam_min: { value: 0, unit: 'min' } })
    ).equal('1000.0" x 0.0"');
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
    expect(transformSurfaceBrightnessPerSubBandData(minMax)).equal(expected);
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
    expect(transformSurfaceBrightnessPerSubBandData(minMax)).deep.equal(expected);
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
    expect(transformSynthesizedBeamSizePerSubBandData(minMax)).equal(expected);
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
    expect(transformSynthesizedBeamSizePerSubBandData(minMax)).equal(expected);
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
    expect(transformPerSubBandData(minMax)).deep.equal(expected);
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
    expect(transformPerSubBandData(minMax)).equal(expected);
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
    expect(transformPerSubBandTime(minMax)).deep.equal('224.05 μs - 149.68 μs');
  });

  test('Coordinate check, is Galactic, Returns false when supplied value is "RA_TYPE_ICRS"', () => {
    expect(isGalactic(RA_TYPE_ICRS)).equal(false);
  });
  test('Coordinate check, is Galactic, Returns true when supplied value is "RA_TYPE_GALACTIC"', () => {
    expect(isGalactic(RA_TYPE_GALACTIC)).equal(true);
  });

  test('Supplied Time check, Returns true when supplied value is "SUPPLIED_TYPE_INTEGRATION"', () => {
    expect(isSuppliedTime(SUPPLIED_TYPE_INTEGRATION)).equal(true);
  });
  test('Supplied Time check, Returns false when supplied value is "SUPPLIED_TYPE_SENSITIVITY"', () => {
    expect(isSuppliedTime(SUPPLIED_TYPE_SENSITIVITY)).equal(false);
  });

  test('Map Sensitivities Units', () => {
    expect(getSensitivitiesUnitsMapping(3)).equal('μJy/beam');
  });

  test('Shift Sensitivity { value : 50000000000, unit : Jy}', () => {
    expect(shiftSensitivity({ value: 5000000000, unit: 'Jy' })).deep.equal({
      value: 5000000000,
      unit: 'Jy'
    });
  });
  test('Shift Sensitivity { value : 40000000000, unit : 3}', () => {
    expect(shiftSensitivity({ value: 4000000000, unit: '3' })).deep.equal({
      value: 4,
      unit: 'Jy/beam'
    });
  });
  test('Shift Sensitivity { value : 300000000, unit : 3}', () => {
    expect(shiftSensitivity({ value: 300000000, unit: '3' })).deep.equal({
      value: 300,
      unit: 'mJy/beam'
    });
  });
  test('Shift Sensitivity { value : 200000, unit : 3}', () => {
    expect(shiftSensitivity({ value: 200000, unit: '3' })).deep.equal({
      value: 200,
      unit: 'μJy/beam'
    });
  });
  test('Shift Sensitivity { value : 100, unit : 3}', () => {
    expect(shiftSensitivity({ value: 100, unit: '3' })).deep.equal({
      value: 100,
      unit: 'nJy/beam'
    });
  });
  test('Shift Sensitivity { value : 0, unit : 3}', () => {
    expect(shiftSensitivity({ value: 0, unit: 'nJy/beam' })).deep.equal({
      value: 0,
      unit: 'nJy/beam'
    });
  });

  test('Time Conversion, In values 100, 3. Out value 6000', () => {
    expect(timeConversion('100', 3)).equal(6000);
  });
  test('Time Conversion, In values 100, 3, 2. Out value 1.6666666666666667', () => {
    expect(timeConversion('100', 3, 2)).equal(1.6666666666666667);
  });

  test('Shift Time, no value', () => {
    const time = undefined;
    const expected = { value: 0, unit: '' };
    expect(shiftTime(time as any, false)).deep.equal(expected);
  });
  test('Shift Time, value 0', () => {
    const time = {
      value: 0,
      unit: 's'
    };
    const expected = { value: 0, unit: 's' };
    expect(shiftTime(time as any, false)).deep.equal(expected);
  });
  test('Shift Time, s to d', () => {
    const time = {
      value: 10e9,
      unit: 's'
    };
    const expected = {
      value: 115740.74074074074,
      unit: 'd'
    };
    expect(shiftTime(time, false)).deep.equal(expected);
  });
  test('Shift Time, s to h', () => {
    const time = {
      value: 3e6,
      unit: 's'
    };
    const expected = {
      value: 833.3333333333334,
      unit: 'h'
    };
    expect(shiftTime(time, false)).deep.equal(expected);
  });
  test('Shift Time, s to min', () => {
    const time = {
      value: 9.99e5,
      unit: 's'
    };
    const expected = {
      value: 16650,
      unit: 'min'
    };
    expect(shiftTime(time, false)).deep.equal(expected);
  });
  const secondsOnly = true;
  test('Shift Time, s to s', () => {
    const time = {
      value: 161.87084064089981,
      unit: 's'
    };
    const expected = {
      value: 161.87084064089981,
      unit: 's'
    };
    expect(shiftTime(time, secondsOnly)).deep.equal(expected);
  });
  test('Shift Time, s to ms', () => {
    const time = {
      value: 0.018506663149092245,
      unit: 's'
    };
    const expected = {
      value: 18.506663149092244,
      unit: 'ms'
    };
    expect(shiftTime(time, secondsOnly)).deep.equal(expected);
  });
  test('Shift Time, s to μs', () => {
    const time = {
      value: 0.0000018506663149092246,
      unit: 's'
    };
    const expected = {
      value: 1.8506663149092246,
      unit: 'μs'
    };
    expect(shiftTime(time, secondsOnly)).deep.equal(expected);
  });
  test('Shift Time, s to ns', () => {
    const time = {
      value: 1.850666314909224e-10,
      unit: 's'
    };
    const expected = {
      value: 0.1850666314909224,
      unit: 'ns'
    };
    expect(shiftTime(time, secondsOnly)).deep.equal(expected);
  });

  test('Image Weighting, value 0, return natural', () => {
    expect(getImageWeightingMapping(0)).equal('natural');
  });

  test('Image Weighting, value 1, return uniform', () => {
    expect(getImageWeightingMapping(1)).equal('uniform');
  });

  test('Image Weighting, value 2, return robust', () => {
    expect(getImageWeightingMapping(2)).equal('briggs');
  });
});
