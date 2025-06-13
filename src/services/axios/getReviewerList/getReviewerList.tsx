import axios from 'axios';
import Reviewer from '@/utils/types/reviewer';
import {
  AXIOS_CONFIG,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA,
  OSO_SERVICES_PROPOSAL_PATH
} from '../../../utils/constants';
import MockReviewerList from './mockReviewerList';

/*********************************************************** filter *********************************************************/

export function GetMockReviewerList(): Reviewer[] {
  return MockReviewerList;
}

async function GetReviewerList(): Promise<Reviewer[] | string> {
  if (USE_LOCAL_DATA) {
    return GetMockReviewerList();
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PROPOSAL_PATH}/list/DefaultUser`;
    const result = await axios.get(`${SKA_OSO_SERVICES_URL}${URL_PATH}`, AXIOS_CONFIG);
    const uniqueResults =
      result.data.length > 1 ? getMostRecentProposals(result.data) : result.data;
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : mappingList(uniqueResults);
  } catch (e) {
    return e.message;
  }
}

export default GetReviewerList;
