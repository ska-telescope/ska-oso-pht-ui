import Proposal, { ProposalBackend } from '../../../utils/types/proposal';
import {
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA,
  OSO_SERVICES_PROPOSAL_PATH
} from '../../../utils/constants';
import useAxiosAuthClient from '../axiosAuthClient/axiosAuthClient';
import MockProposalBackendList from '../get/getProposalList/mockProposalBackendList';
import { mappingList } from '../get/getProposalList/getProposalList';
import { getUniqueMostRecentItems } from '@/utils/helpers';

export function GetMockProposalList(): Proposal[] {
  return mappingList(MockProposalBackendList);
}

async function GetProposalByStatusList(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  status: string
): Promise<Proposal[] | string> {
  if (USE_LOCAL_DATA) {
    return GetMockProposalList();
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PROPOSAL_PATH}/status/${status}`;
    const result = await authAxiosClient.get(`${SKA_OSO_SERVICES_URL}${URL_PATH}`);

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

export default GetProposalByStatusList;
