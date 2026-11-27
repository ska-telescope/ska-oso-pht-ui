import { Reviewer, ReviewerBackend } from '@utils/types/reviewer.tsx';

/** The reviewers sorted by display name. */
export const getReviewersAlphabetical = (data: Reviewer[]) =>
  data?.sort((a, b) => a?.displayName?.localeCompare(b?.displayName));

/**
 * One list of the science and technical reviewers, flagged with which they are. A reviewer in both
 * lists appears once, with both flags set.
 */
export function combineReviewers(
  sciReviewers: ReviewerBackend[],
  techReviewers: ReviewerBackend[]
): Reviewer[] {
  const combinedMap = new Map<string, Reviewer>();

  for (const reviewer of sciReviewers) {
    combinedMap.set(reviewer.id, { ...reviewer, isScience: true, isTechnical: false });
  }

  for (const reviewer of techReviewers) {
    const existing = combinedMap.get(reviewer.id);
    if (existing) {
      // Already there from the science list
      existing.isTechnical = true;
    } else {
      combinedMap.set(reviewer.id, { ...reviewer, isScience: false, isTechnical: true });
    }
  }

  return Array.from(combinedMap.values());
}
