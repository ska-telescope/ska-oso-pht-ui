import { FREQUENCY_UNITS, SPEED_OF_LIGHT, TEXT_ENTRY_PARAMS } from './constants';

// TODO : Ensure that we remove all hard-coded values

export const generateId = (prefix: string, length: number) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return prefix + result;
};

export const countWords = (text: string) => {
  return !text
    ? 0
    : text
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
};

export const frequencyConversion = (inValue: any, from: number, to: number = 4) => {
  return (inValue * FREQUENCY_UNITS[to - 1].toHz) / FREQUENCY_UNITS[from - 1].toHz;
};

export const getScaledValue = (value: any, multiplier: number, operator: string) => {
  let val_scaled = 0;
  switch (operator) {
    case '*':
      val_scaled = value * multiplier;
      break;
    case '/':
      val_scaled = value / multiplier;
      break;
    default:
      val_scaled = value;
  }
  return val_scaled;
};

export const calculateVelocity = (resolutionHz: number, frequencyHz: number, precision = 1) => {
  const velocity = frequencyHz > 0 ? (resolutionHz / frequencyHz) * SPEED_OF_LIGHT : 0;
  if (velocity < 1000) {
    return velocity.toFixed(precision) + ' m/s';
  } else {
    return (velocity / 1000).toFixed(precision) + ' km/s';
  }
};

export const helpers = {
  validate: {
    validateTextEntry(
      text: string,
      setText: Function,
      setErrorText: Function,
      textType?: string
    ): boolean {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      textType = textType ?? 'DEFAULT';
      const textEntryParams = TEXT_ENTRY_PARAMS[textType];
      if (!textEntryParams) {
        // handle invalid textType (no match in TEXT_ENTRY_PARAMS)
        throw new Error(`Invalid text type: ${textType}`);
      }
      const { ERROR_TEXT, PATTERN } = textEntryParams;
      if (PATTERN.test(text)) {
        setText(text);
        setErrorText('');
        return true;
      }
      setErrorText(ERROR_TEXT);
      return false;
    }
  },
  transform: {
    // trim undefined and empty properties of an object
    trimObject(obj) {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (value === undefined || value === '' || value === null) {
          if (key === 'submitted_by' || key === 'submitted_on' || key === 'abstract') return; //TODO: review null values in data model
          delete obj[key];
        } else if (typeof value === 'object') {
          this.trimObject(value);
        }
      });
    }
  }
};
