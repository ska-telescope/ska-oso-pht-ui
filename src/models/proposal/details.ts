import { countWords } from '@/utils/helpers.ts';
import type Proposal from '@/utils/types/proposal';
import phtTranslations from '../../../public/locales/en/pht.json';
import { z } from 'zod';

const REQUIRED_MESSAGE = phtTranslations.scienceCategory.error;
const MAX_SUMMARY_WORDS = Number(phtTranslations.abstract.maxWord);

const summarySchema = z
  .string()
  .min(1, REQUIRED_MESSAGE)
  .superRefine((value, ctx) => {
    const wordCount = countWords(value);
    if (wordCount > MAX_SUMMARY_WORDS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${phtTranslations.specialCharacters.numWord} ${wordCount} / ${MAX_SUMMARY_WORDS}`
      });
    }
  });

export function getDetailsSchema() {
  return z.object({
    mode: z.string().min(1, REQUIRED_MESSAGE),
    summary: summarySchema
  });
}

export const getDetailsValues = (
  proposal?: Pick<Proposal, 'scienceCategory' | 'abstract'>
): DetailsType => ({
  mode: String(proposal?.scienceCategory ?? ''),
  summary: proposal?.abstract ?? ''
});

// TODO remove 'Type' here?
export type DetailsType = z.infer<ReturnType<typeof getDetailsSchema>>;
