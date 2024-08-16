export const presentUnits = (inUnits: string) => {
  switch (inUnits) {
    case 'arcsec2':
      return 'arcsec\xb2';
    case 'arcsecs2':
      return 'arcsecs\xb2';
    default:
      return inUnits;
  }
};

export const presentValue = (inValue: string | number, fractionLength = 2) => {
  if (typeof inValue === 'string' && inValue.split(' ').length > 1) {
    return inValue;
  }
  const result = Number(inValue);
  return result > 999 ? result.toExponential(1) : result.toFixed(fractionLength);
};
