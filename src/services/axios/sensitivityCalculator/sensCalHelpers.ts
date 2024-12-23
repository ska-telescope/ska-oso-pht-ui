import {
  FREQUENCY_UNITS,
  INFINITY,
  MICROSECOND_LABEL,
  MILLISECOND_LABEL,
  NANOSECOND_LABEL,
  OBSERVATION,
  SECOND_LABEL,
  SECONDS_UNITS
} from '../../../utils/constants';
import { ValueUnitPair } from '../../../utils/types/valueUnitPair';

const sensCalHelpers = {
  format: {
    /**
     * returns the subarray as a string in the format needed for the Sens Cal API
     * @param _subArray the subarray such as AA4, AA*, AA4(15-m antennas only), AA2(core-only), AA0.5, etc.
     * @param telescope
     * @returns {string} a string such as 'LOW_AA4_all'
     */
    getLowSubarrayType(_subArray: string, telescope: string): string {
      let subArray = _subArray
        ?.replace('*', '')
        ?.replace('(core only)', '')
        .replace('(15-m antennas only)', ''); // remove * // remove (core only)
      subArray = subArray?.replace(/(\d+)\.(\d+)/g, '$1$2'); // remove dot following a number
      const star = _subArray?.includes('*') ? 'star' : ''; // add star for *
      const type = _subArray?.includes('core') ? 'core_only' : 'all';
      return `${telescope}_${subArray}${star}_${type}`?.replace(' ', '');
    },
    /**
     * Converts the sensitivity to a sensible unit,
     * e.g. display 12.3 mJy/beam instead of 1234 uJy/beam
     *
     * @param sensitivity the sensitivity returned from the API in uJy/beam
     * @param precision the number of d.p. to display the result to
     * @returns {object} the sensitivity as an object with the correct units and precision // the sensitivity as a string with the correct units and precision
     * **/
    convertReturnedSensitivityToDisplayValue(sensitivity: number, precision = 2): ValueUnitPair {
      // TODO: add tests (cypress?)
      if (typeof sensitivity === 'number') {
        if (sensitivity === 0) {
          return {
            value: 0.0,
            unit: 'Jy/beam'
          };
        }
        if (sensitivity < 1) {
          // For < 1 uJy/beam, display the value in nJy/beam
          return {
            value: Number((sensitivity * 1e3).toFixed(precision)),
            unit: 'nJy/beam'
          };
        }
        if (sensitivity < 1e3) {
          // For 0 - 999 uJy/beam, display the value in uJy/beam
          return {
            value: Number(sensitivity.toFixed(precision)),
            unit: 'uJy/beam'
          };
        }
        if (sensitivity < 1e6) {
          // For 1000 - 999999 uJy/beam, display the value in mJy/beam
          return {
            value: Number((sensitivity / 1e3).toFixed(precision)),
            unit: 'mJy/beam'
          };
        }
        // For values above 999999 uJy/beam, display the value in Jy/beam
        return {
          value: Number((sensitivity / 1e6).toFixed(precision)),
          unit: 'Jy/beam'
        };
      } else {
        return {
          value: 0,
          unit: ''
        };
      }
    },
    convertIntegrationTimeToSeconds(integrationTime: number, unit: string): number {
      let seconds = 0;
      if (!integrationTime) {
        return seconds;
      }
      switch (unit) {
        case 'd':
          seconds = integrationTime * 24 * 3600;
          break;
        case 'h':
          seconds = integrationTime * 3600;
          break;
        case 'min':
          seconds = integrationTime * 60;
          break;
        case 's':
          seconds = integrationTime;
          break;
        case 'ms':
          seconds = integrationTime / 1000;
          break;
        case 'us':
          seconds = integrationTime / 1000000;
          break;
        case 'ns':
          seconds = integrationTime / 1000000000;
          break;
        default:
          throw new Error(`Invalid unit: ${unit}`);
      }
      return seconds;
    },
    getIntegrationTimeUnitsLabel(units: number): string {
      const unitsList = OBSERVATION.Supplied.find(s => s.label === 'Integration Time')?.units;
      return unitsList.find(u => u.value === units)?.label;
    },
    /**
     * Converts a minor and major beam in degrees (as returned by the backend)
     * into a formatted string in arcsec eg '4.6" x 7.9"'
     *
     * @param beam_min_scaled in degrees
     * @param beam_maj_scaled in degrees
     * @param precision the number of d.p. to display the result to
     * @returns {string} a string of the format '4.6" x 7.9"'
     * **/
    convertBeamValueDegreesToDisplayValue(
      beam_maj_scaled: number,
      beam_min_scaled: number,
      precision = 3
    ): string {
      return `${(beam_maj_scaled * 3600).toFixed(precision)} x ${(beam_min_scaled * 3600).toFixed(
        precision
      )}`;
    },
    convertBandwidthToMHz(bandwidthValue, bandwidthUnits): number {
      const unitMap: { [key: string]: number } = {
        GHz: 1000,
        MHz: 1,
        kHz: 0.001,
        Hz: 0.000001
      };
      if (!unitMap[bandwidthUnits]) {
        throw new Error('Invalid bandwidth unit');
      }
      return bandwidthValue * unitMap[bandwidthUnits];
    },
    convertBandwidthToKHz(bandwidthValue, bandwidthUnits): number {
      const unitMap: { [key: string]: number } = {
        GHz: 1000000,
        MHz: 1000,
        kHz: 1,
        Hz: 0.001
      };
      if (!unitMap[bandwidthUnits]) {
        throw new Error('Invalid bandwidth unit');
      }
      return bandwidthValue * unitMap[bandwidthUnits];
    },
    convertBandwidthToHz(bandwidthValue, bandwidthUnits): number {
      if (typeof bandwidthUnits === 'number') {
        bandwidthUnits = OBSERVATION.Units.find(item => item.value === bandwidthUnits)?.label;
      }
      const unitMap: { [key: string]: number } = {
        GHz: 1000000000,
        MHz: 1000000,
        kHz: 1000,
        Hz: 1
      };
      if (!unitMap[bandwidthUnits]) {
        throw new Error('Invalid bandwidth unit');
      }
      return bandwidthValue * unitMap[bandwidthUnits];
    },
    convertBandwidthToGHz(bandwidthValue: number, bandwidthUnits): number {
      if (typeof bandwidthUnits === 'number') {
        bandwidthUnits = OBSERVATION.Units.find(item => item.value === bandwidthUnits)?.label;
      }
      const unitMap: { [key: string]: number } = {
        GHz: 1,
        MHz: 0.001,
        kHz: 0.000001,
        Hz: 0.000000001
      };
      if (!unitMap[bandwidthUnits]) {
        throw new Error('Invalid bandwidth unit');
      }
      return bandwidthValue * unitMap[bandwidthUnits];
    },
    convertConfusionNoiseRawValueInuJy(inConfusionNoise: number): number {
      // Confusion noise is returned from the API in uJy, but the other sensitivities are uJy,
      // so we convert here (and hope some future refactoring makes the unit handling more robust!)
      return inConfusionNoise * 1e6;
    },
    convertKelvinsToDisplayValue(value: number, precision = 2): ValueUnitPair {
      // Converts a value in uK to a string with sensible units
      if (value < 1e3) {
        // For 0 - 999 uK, display the value in uK
        return { value: Number(value.toFixed(precision)), unit: 'uK' };
      }
      if (value < 1e6) {
        // For 1000 - 999999 uK, display the value in mK
        return { value: Number((value / 1e3).toFixed(precision)), unit: 'mK' };
      }
      // For values above 999999 uK, display the value in K
      return { value: Number((value / 1e6).toFixed(precision)), unit: 'K' };
    },
    sensitivityOnUnit(unit: string, sensitivity: number, conversion_factor: number): number {
      return ['K', 'mK', 'uK'].includes(unit) ? sensitivity / conversion_factor : sensitivity;
    },
    convertSensitivityToJy(inputSensitivity: number, unit: string): number {
      if (unit === 'mJy/beam') {
        return inputSensitivity * 1e-3;
      }
      if (unit === 'uJy/beam') {
        return inputSensitivity * 1e-6;
      }
      if (unit === 'nJy/beam') {
        return inputSensitivity * 1e-9;
      }
      if (unit === 'K') {
        return inputSensitivity * 1;
      }
      if (unit === 'mK') {
        return inputSensitivity / 1000;
      }
      if (unit === 'uK') {
        return inputSensitivity / 1000000;
      }
      return inputSensitivity;
    },
    /**
     * Converts a ms/us/ns time into seconds
     **/
    timeToSeconds(time: ValueUnitPair): ValueUnitPair {
      const unit = SECONDS_UNITS.find(unit => unit.label === time.unit);
      return {
        value: time.value * unit.toSeconds,
        unit: SECOND_LABEL
      };
    },
    /**
     * Converts a time in seconds to a sensible unit,
     * e.g. display 1 ms instead of 0.001 s
     * **/
    convertTimeToDisplayUnit(time: ValueUnitPair, precision = 2): any {
      if (time?.unit !== SECOND_LABEL) {
        time = this.timeToSeconds(time);
      }
      if (time.value.toString() === INFINITY) {
        return {
          value: INFINITY,
          unit: SECOND_LABEL
        };
      }
      const timeS = Number(time.value);
      if (timeS > 1e-1) {
        return {
          value: Number(timeS.toFixed(precision)),
          unit: SECOND_LABEL
        };
      }
      if (timeS > 1e-4) {
        return {
          value: Number((timeS * 1e3).toFixed(precision)),
          unit: MILLISECOND_LABEL
        };
      }
      if (timeS > 1e-7) {
        return {
          value: Number((timeS * 1e6).toFixed(precision)),
          unit: NANOSECOND_LABEL
        };
      }
      return {
        value: Number((timeS * 1e9).toFixed(precision)),
        unit: MICROSECOND_LABEL
      };
    }
  },
  calculate: {
    sqrtOfSumSqs(value1: number, value2: number): number {
      return Math.sqrt(value1 ** 2 + value2 ** 2);
    },
    thermalSensitivity: (
      sensitivity: number,
      confusion_noise: number,
      weighting_factor: number
    ): number =>
      Math.sqrt(sensitivity * sensitivity - confusion_noise * confusion_noise) / weighting_factor
  },
  map: {
    getFrequencyAndBandwidthUnits(unitsField: number, telescope: number): string {
      return FREQUENCY_UNITS.find(item => item.value === unitsField)?.label;
    }
  }
};

export default sensCalHelpers;
