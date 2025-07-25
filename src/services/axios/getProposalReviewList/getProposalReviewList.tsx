import {
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA,
  OSO_SERVICES_REVIEWS_PATH
} from '../../../utils/constants';
import useAxiosAuthClient from '../axiosAuthClient/axiosAuthClient';
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
  const output = [];
  for (let i = 0; i < inRec.length; i++) {
    const rec: ProposalReview = {
      id: inRec[i].review_id?.toString(),
      metadata: inRec[i].metadata, // TODO create metadata backend type and mapping + modify frontend type to be camelCase
      panelId: inRec[i].panel_id,
      cycle: inRec[i].cycle,
      reviewerId: inRec[i].reviewer_id,
      prslId: inRec[i].prsl_id,
      rank: inRec[i].rank,
      conflict: {
        hasConflict: inRec[i].conflict.has_conflict,
        reason: inRec[i].conflict.reason
      },
      comments: inRec[i].comments,
      srcNet: inRec[i].src_net,
      submittedOn: inRec[i].submitted_on,
      submittedBy: inRec[i].submitted_by,
      status: inRec[i].status
    };
    output.push(rec);
  }
  return output;
}

/*****************************************************************************************************************************/

export function GetMockProposalReviewList(mock = MockProposalReviewListBackend): ProposalReview[] {
  const uniqueResults = mock.length > 1 ? getUniqueMostRecentReviews(mock) : mock;
  return mappingList(uniqueResults);
}

async function GetProposalReviewList(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>
): Promise<ProposalReview[] | string> {
  if (USE_LOCAL_DATA) {
    return GetMockProposalReviewList();
  }

  try {
    const URL_PATH = `${OSO_SERVICES_REVIEWS_PATH}/list/DefaultUser`;
    const result = await authAxiosClient.get(`${SKA_OSO_SERVICES_URL}${URL_PATH}`);

    if (!result || !Array.isArray(result.data)) {
      return 'error.API_UNKNOWN_ERROR';
    }
    const uniqueResults =
      result.data?.length > 1 ? getUniqueMostRecentReviews(result.data) : result.data;
    return mappingList(uniqueResults);
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'error.API_UNKNOWN_ERROR';
  }
}

export default GetProposalReviewList;
