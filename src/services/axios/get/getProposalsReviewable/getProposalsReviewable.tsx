import Proposal, { ProposalBackend } from '@utils/types/proposal.tsx';
import { SKA_OSO_SERVICES_URL, OSO_SERVICES_PROPOSAL_PATH } from '@utils/constants.ts';
import { getUniqueMostRecentItems } from '@utils/helpers.ts';
import { AxiosAuthClient } from '../../axiosAuthClient/axiosAuthClient.ts';
import { mappingList } from '../getProposalList/getProposalList.tsx';

async function GetProposalsReviewable(
  authAxiosClient: AxiosAuthClient
): Promise<Proposal[] | string> {
  try {
    const URL_PATH = `${SKA_OSO_SERVICES_URL}${OSO_SERVICES_PROPOSAL_PATH}/reviewable`;
    const result = await authAxiosClient.get(URL_PATH);

    if (!result || !Array.isArray(result.data)) {
      return 'error.API_UNKNOWN_ERROR';
    }

    const uniqueResults: ProposalBackend[] =
      result.data.length > 1 ? getUniqueMostRecentItems(result.data, 'prsl_id') : result.data;
    return mappingList(uniqueResults);
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'error.API_UNKNOWN_ERROR';
  }
}

export default GetProposalsReviewable;
