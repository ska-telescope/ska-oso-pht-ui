import { TEXT_ENTRY_PARAMS } from './constants';

export const helpers = {
  validate: {
    validateTextEntry(
      text: string,
      setText: Function,
      setErrorText: Function,
      textType: string
    ): void {
      // type of text to check (TITLE, EMAIL, etc.)
      const textEntryParams = TEXT_ENTRY_PARAMS[textType];
      if (!textEntryParams) {
        // handle invalid textType (no match in TEXT_ENTRY_PARAMS)
        throw new Error(`Invalid text type: ${textType}`);
      }
      const { MAX_LENGTH, ERROR_TEXT, PATTERN } = textEntryParams;
      if (PATTERN.test(text)) {
        setText(text.substring(0, MAX_LENGTH));
        setErrorText('');
      } else {
        setErrorText(ERROR_TEXT);
      }
    }
  }
};
