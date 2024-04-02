/*
  returns string such as 'LOW_AA4_all',
  */
export function getLowSubarrayType(_subArray: string, telescope: string): string {
  let subArray = _subArray.replace('*', '').replace('(core only)', ''); // remove * // remove (core only)
  subArray = subArray.replace(/(\d+)\.(\d+)/g, '$1$2'); // remove dot following a number
  const star = _subArray.includes('*') ? 'star' : ''; // add star for *
  const type = _subArray.includes('core') ? 'core_only' : 'all';
  return `${telescope}_${subArray}${star}_${type}`.replace(' ', '');
}

export function sqrtOfSumSqs(value1: number, value2: number): number {
  return Math.sqrt(value1 ** 2 + value2 ** 2);
}

/**
 * Converts the sensitivity to a sensible unit,
 * e.g. display 12.3 mJy/beam instead of 1234 uJy/beam
 *
 * @param sensitivity the sensitivity returned from the API in uJy/beam
 * @param precision the number of d.p. to display the result to
 * @returns {string} the sensitivity as a string with the correct units and precision
 * **/
export function convertSensitivityToDisplayValue(sensitivity: number, precision = 2): string {
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
