const sensCalHelpers = {
  format: {
    /**
     * returns the subarray as a string in the format needed for the Sens Cal API
     * @param _subArray the subarray such as AA4, AA*, AA4(15-m antennas only), AA2(core-only), AA0.5, etc.
     * @param telescope
     * @returns {string} a string such as 'LOW_AA4_all'
     */
    getLowSubarrayType(_subArray: string, telescope: string): string {
      let subArray = _subArray.replace('*', '').replace('(core only)', ''); // remove * // remove (core only)
      subArray = subArray.replace(/(\d+)\.(\d+)/g, '$1$2'); // remove dot following a number
      const star = _subArray.includes('*') ? 'star' : ''; // add star for *
      const type = _subArray.includes('core') ? 'core_only' : 'all';
      return `${telescope}_${subArray}${star}_${type}`.replace(' ', '');
    },
    /**
     * Converts the sensitivity to a sensible unit,
     * e.g. display 12.3 mJy/beam instead of 1234 uJy/beam
     *
     * @param sensitivity the sensitivity returned from the API in uJy/beam
     * @param precision the number of d.p. to display the result to
     * @returns {string} the sensitivity as a string with the correct units and precision
     * **/
    convertSensitivityToDisplayValue(sensitivity: number, precision = 2): string {
      // TODO: add tests (cypress?)
      if (Number(sensitivity)) {
        if (sensitivity < 1e3) {
          // For 0 - 999 uJy/beam, display the value in uJy/beam
          return `${sensitivity.toFixed(precision)} uJy/beam`;
        }
        if (sensitivity < 1e6) {
          // For 1000 - 999999 uJy/beam, display the value in mJy/beam
          return `${(sensitivity / 1e3).toFixed(precision)} mJy/beam`;
        }
        // For values above 999999 uJy/beam, display the value in Jy/beam
        return `${(sensitivity / 1e6).toFixed(precision)} Jy/beam`;
      } else {
        return 'NaN';
      }
    }
  },
  calculate: {
    sqrtOfSumSqs(value1: number, value2: number): number {
      return Math.sqrt(value1 ** 2 + value2 ** 2);
    }
  }
};

export default sensCalHelpers;