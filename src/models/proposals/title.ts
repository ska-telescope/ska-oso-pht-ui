import { z } from 'zod';
import { countWords } from '@/utils/helpers';
import { TEXT_ENTRY_PARAMS } from '@/utils/constants';
import phtTranslations from '../../../public/locales/en/pht.json';

const REQUIRED_MESSAGE = phtTranslations.title.empty;
const MAX_TITLE_WORDS = Number(phtTranslations.title.maxWord);

export function getTitleSchema() {
  return z
    .string()
    .min(1, REQUIRED_MESSAGE)
    .regex(TEXT_ENTRY_PARAMS.TITLE.PATTERN, phtTranslations.specialCharacters.invalid)
    .superRefine((value, ctx) => {
      const wordCount = countWords(value);
      if (wordCount > MAX_TITLE_WORDS) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${phtTranslations.specialCharacters.numWord} ${wordCount} / ${MAX_TITLE_WORDS}`
        });
      }
    });
}

export const getTitleValues = (proposal?: { title?: string }): TitleType => proposal?.title ?? '';

export type TitleType = z.infer<ReturnType<typeof getTitleSchema>>;
