import { OBSERVATION } from '../../../utils/constants';

const sensCalHelpers = {
  format: {
    /**
     * returns the subarray as a string in the format needed for the Sens Cal API
     * @param _subArray the subarray such as AA4, AA*, AA4(15-m antennas only), AA2(core-only), AA0.5, etc.
     * @param telescope
     * @returns {string} a string such as 'LOW_AA4_all'
     */
    getLowSubarrayType(_subArray: string, telescope: string): string {
      let subArray = _subArray?.replace('*', '')?.replace('(core only)', ''); // remove * // remove (core only)
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
    convertSensitivityToDisplayValue(
      sensitivity: number,
      precision = 2
    ): { value: string; units: string } {
      // TODO: create a proper type
      // TODO: add tests (cypress?)
      if (Number(sensitivity)) {
        if (sensitivity < 1e3) {
          // For 0 - 999 uJy/beam, display the value in uJy/beam
          return {
            value: sensitivity.toFixed(precision),
            units: 'uJy/beam'
          };
          // return `${sensitivity.toFixed(precision)} uJy/beam`;
        }
        if (sensitivity < 1e6) {
          // For 1000 - 999999 uJy/beam, display the value in mJy/beam
          return {
            value: (sensitivity / 1e3).toFixed(precision),
            units: 'mJy/beam'
          };
          // return `${(sensitivity / 1e3).toFixed(precision)} mJy/beam`;
        }
        // For values above 999999 uJy/beam, display the value in Jy/beam
        return {
          value: (sensitivity / 1e6).toFixed(precision),
          units: 'Jy/beam'
        };
        // return `${(sensitivity / 1e6).toFixed(precision)} Jy/beam`;
      } else {
        return {
          value: sensitivity.toFixed(precision),
          units: ''
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
     * into a formatted string in arcsecs eg '4.6" x 7.9"'
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
    }
  },
  calculate: {
    sqrtOfSumSqs(value1: number, value2: number): number {
      return Math.sqrt(value1 ** 2 + value2 ** 2);
    }
  }
};

export default sensCalHelpers;
