import Proposal, { ProposalBackend } from '@utils/types/proposal.tsx';
import {
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA,
  OSO_SERVICES_PROPOSAL_PATH,
  cypressToken,
  cypressLiveMode
} from '@utils/constants.ts';
import { getUniqueMostRecentItems } from '@utils/helpers.ts';
import { AxiosAuthClient } from '../../axiosAuthClient/axiosAuthClient.ts';
import MockProposalBackendList from '../getProposalList/mockProposalBackendList.tsx';
import { mappingList } from '../getProposalList/getProposalList.tsx';

export function GetMockProposalList(): Proposal[] {
  return mappingList(MockProposalBackendList);
}

async function GetProposalsReviewable(
  authAxiosClient: AxiosAuthClient
): Promise<Proposal[] | string> {
  // cypressToken alone would also catch live-mode Cypress runs (which still set a - real - token
  // locally, see liveAuth.js), so exclude those explicitly rather than always mocking under
  // Cypress regardless of mode.
  if (USE_LOCAL_DATA || (cypressToken && !cypressLiveMode)) {
    return GetMockProposalList();
  }

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
