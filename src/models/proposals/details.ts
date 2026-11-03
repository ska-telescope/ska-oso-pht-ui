import { z } from 'zod';
import { countWords } from '@/utils/helpers';
import { DETAILS } from '@/utils/constants';
import type { ProposalInfo } from '@/generated/models/proposal-info';
import phtTranslations from '../../../public/locales/en/pht.json';

const MAX_ABSTRACT_WORDS = Number(phtTranslations.abstract.maxWord);

export function getDetailsSchema() {
  return z.object({
    observingMode: z.string().nullable(),
    abstract: z.string().superRefine((value, ctx) => {
      const wordCount = countWords(value);
      if (wordCount > MAX_ABSTRACT_WORDS) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${phtTranslations.specialCharacters.numWord} ${wordCount} / ${MAX_ABSTRACT_WORDS}`
        });
      }
    }),
    scienceCategory: z
      .number()
      .refine((value) => DETAILS.ScienceCategory.some((category) => category.value === value))
      .nullable()
  });
}

type DetailsSeed = {
  observations?: { type?: string }[];
  abstract?: string;
  scienceCategory?: number | string | null;
};

const scienceCategoryValue = (value: DetailsSeed['scienceCategory']): number | null => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    return (
      DETAILS.ScienceCategory.find(
        (category) => category.label.toLowerCase() === value.toLowerCase()
      )?.value ?? null
    );
  }
  return null;
};

export const getDetailsValues = (proposal?: DetailsSeed): DetailsType => ({
  observingMode: proposal?.observations?.[0]?.type ?? null,
  abstract: proposal?.abstract ?? '',
  scienceCategory: scienceCategoryValue(proposal?.scienceCategory)
});

export type DetailsType = z.input<ReturnType<typeof getDetailsSchema>>;

export const detailsFromPdm = (
  proposalInfo?: Partial<ProposalInfo>,
  observingMode: string | null = null
): DetailsType => {
  const scienceCategory = DETAILS.ScienceCategory.find(
    (category) => category.label.toLowerCase() === proposalInfo?.science_category?.toLowerCase()
  )?.value;

  return {
    observingMode,
    abstract: proposalInfo?.abstract ?? '',
    scienceCategory: scienceCategory ?? null
  };
};

export const detailsToPdm = (
  details: DetailsType
): Pick<ProposalInfo, 'abstract' | 'science_category'> => {
  return {
    abstract: details.abstract,
    science_category: DETAILS.ScienceCategory.find(
      (category) => category.value === details.scienceCategory
    )?.label
  };
};
