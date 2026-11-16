import { z } from 'zod';
import { countWords } from '@/utils/helpers';
import { DETAILS, SCIENCE_CATEGORY } from '@/utils/constants';
import type { ProposalInfo } from '@/generated/models/proposal-info';
import phtTranslations from '../../../public/locales/en/pht.json';

const MAX_ABSTRACT_WORDS = Number(phtTranslations.abstract.maxWord);
const MAX_ABSTRACT_CHARACTERS = Number(phtTranslations.abstract.maxChar);
const scienceCategorySchema = z.enum(SCIENCE_CATEGORY);

export function getDetailsSchema() {
  return z.object({
    abstract: z
      .string()
      .min(1)
      .max(MAX_ABSTRACT_CHARACTERS)
      .superRefine((value, ctx) => {
        const wordCount = countWords(value);
        if (wordCount > MAX_ABSTRACT_WORDS) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${phtTranslations.specialCharacters.numWord} ${wordCount} / ${MAX_ABSTRACT_WORDS}`
          });
        }
      }),
    scienceCategory: scienceCategorySchema.nullable()
  });
}

type DetailsSeed = Omit<Partial<DetailsType>, 'scienceCategory'> & {
  scienceCategory?: number | string | null;
};

const scienceCategoryValue = (
  value: DetailsSeed['scienceCategory']
): DetailsType['scienceCategory'] => {
  if (typeof value === 'number') return scienceCategorySchema.parse(value);
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
  abstract: proposal?.abstract ?? '',
  scienceCategory: scienceCategoryValue(proposal?.scienceCategory)
});

export type DetailsType = z.input<ReturnType<typeof getDetailsSchema>>;

export const detailsFromPdm = (proposalInfo?: Partial<ProposalInfo>): DetailsType => {
  const scienceCategory = DETAILS.ScienceCategory.find(
    (category) => category.label.toLowerCase() === proposalInfo?.science_category?.toLowerCase()
  )?.value;

  return {
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
