import { r } from 'happy-dom/lib/PropertySymbol.js';
import {
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA,
  OSO_SERVICES_REVIEWS_PATH
} from '../../../utils/constants';
import axiosAuthClient from '../axiosAuthClient/axiosAuthClient';
import { mappingReviewBackendToFrontend } from '../putProposalReview/putProposalReview';
import { MockProposalReviewListBackend } from './mockProposalReviewListBackend';
import { ProposalReview, ProposalReviewBackend } from '@/utils/types/proposalReview';

/*********************************************************** filter *********************************************************/

const groupByReviewId = (data: ProposalReviewBackend[]) => {
  return data.reduce((grouped: { [key: string]: ProposalReviewBackend[] }, obj) => {
    if (!grouped[obj.review_id]) {
      grouped[obj.review_id] = [obj];
    } else {
      grouped[obj.review_id].push(obj);
    }
    return grouped;
  }, {} as { [key: string]: ProposalReviewBackend[] });
};

const sortByLastUpdated = (array: ProposalReviewBackend[]): ProposalReviewBackend[] => {
  array.sort(function(a, b) {
    return (
      new Date(b.metadata?.last_modified_on as string)?.valueOf() -
      new Date(a.metadata?.last_modified_on as string)?.valueOf()
    );
  });
  return array;
};

export const getUniqueMostRecentReviews = (data: ProposalReviewBackend[]) => {
  const grouped = groupByReviewId(data);

  const newestPerGroup = Object.values(grouped).map((arr: ProposalReviewBackend[]) => {
    sortByLastUpdated(arr); // newest first
    return arr[0]; // pick newest from group
  });

  newestPerGroup.sort(
    (a, b) =>
      new Date(b.metadata?.last_modified_on!).valueOf() -
      new Date(a.metadata?.last_modified_on!).valueOf()
  ); // TODO sort also by assigned_on

  return newestPerGroup;
};

/*****************************************************************************************************************************/
/*********************************************************** mapping *********************************************************/

export function mappingList(inRec: ProposalReviewBackend[]): ProposalReview[] {
  const output = inRec.map(item => mappingReviewBackendToFrontend(item));
  return output;
}

/*****************************************************************************************************************************/

export function GetMockProposalReviewList(mock = MockProposalReviewListBackend): ProposalReview[] {
  const uniqueResults = mock.length > 1 ? getUniqueMostRecentReviews(mock) : mock;
  return mappingList(uniqueResults);
}

async function GetProposalReviewList(): Promise<ProposalReview[] | string> {
  if (USE_LOCAL_DATA) {
    return GetMockProposalReviewList();
  }

  try {
    const URL_PATH = `${OSO_SERVICES_REVIEWS_PATH}/list/DefaultUser`;
    const result = await axiosAuthClient.get(`${SKA_OSO_SERVICES_URL}${URL_PATH}`);

    if (!result || !Array.isArray(result.data)) {
      return 'error.API_UNKNOWN_ERROR';
    }
    const uniqueResults =
      result.data?.length > 1 ? getUniqueMostRecentReviews(result.data) : result.data;
    const resultData = mappingList(uniqueResults);
    console.log('GetProposalReviewList resultData', resultData);
    return resultData;
    // return mappingList(uniqueResults);
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'error.API_UNKNOWN_ERROR';
  }
}

export default GetProposalReviewList;
