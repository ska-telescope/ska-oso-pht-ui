import {
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA,
  OSO_SERVICES_REVIEWERS_PATH
} from '@utils/constants.ts';
import { Reviewer, ReviewerBackend } from '@utils/types/reviewer.tsx';
import useAxiosAuthClient from '../../axiosAuthClient/axiosAuthClient.tsx';
import { MockReviewersList } from './mockReviewerList.tsx';

/*********************************************************** filter *********************************************************/

export const getReviewersAlphabetical = (data: Reviewer[]) => {
  return data?.sort((a, b) => a?.displayName?.localeCompare(b?.displayName));
};

/*****************************************************************************************************************************/

export function combineReviewers(
  sci_reviewers: ReviewerBackend[],
  tech_reviewers: ReviewerBackend[]
): Reviewer[] {
  const combinedMap = new Map<string, Reviewer>();

  // Add science reviewers
  for (const reviewer of sci_reviewers) {
    combinedMap.set(reviewer.id, {
      ...reviewer,
      isScience: true,
      reviewType: 'science',
      isTechnical: false
    });
  }

  // Add technical reviewers
  for (const reviewer of tech_reviewers) {
    if (combinedMap.has(reviewer.id)) {
      // Already exists from science list — update flag
      const existing = combinedMap.get(reviewer.id)!;
      existing.isTechnical = true;
    } else {
      combinedMap.set(reviewer.id, {
        ...reviewer,
        isScience: false,
        reviewType: 'technical',
        isTechnical: true
      });
    }
  }

  return Array.from(combinedMap.values());
}

export function GetMockReviewersList(): Reviewer[] {
  return MockReviewersList;
}

async function GetReviewerList(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>
): Promise<Reviewer[] | string> {
  if (USE_LOCAL_DATA) {
    return GetMockReviewersList();
  }

  try {
    const URL_PATH = `${OSO_SERVICES_REVIEWERS_PATH}`;
    const result = await authAxiosClient.get(`${SKA_OSO_SERVICES_URL}${URL_PATH}`);
    if (!result || typeof result.data !== 'object') {
      return 'error.API_UNKNOWN_ERROR';
    }
    if (Array.isArray(result?.data?.sci_reviewers) && Array.isArray(result?.data?.tech_reviewers)) {
      const combined = combineReviewers(result.data.sci_reviewers, result.data.tech_reviewers);
      return combined?.length ? getReviewersAlphabetical(combined) : result?.data;
    } else {
      return 'error.API_UNKNOWN_ERROR';
    }
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'error.API_UNKNOWN_ERROR';
  }
}

export default GetReviewerList;
