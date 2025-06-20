import axios from 'axios';
import {
  AXIOS_CONFIG,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA,
  OSO_SERVICES_REVIEWERS_PATH
} from '../../../utils/constants';
import MockReviewerList from './mockReviewerList';
import Reviewer from '@/utils/types/reviewer';

/*********************************************************** filter *********************************************************/

export const getReviewersAlphabetical = (data: Reviewer[]) => {
  return data.sort((a, b) => a.displayName.localeCompare(b.displayName));
};

/*****************************************************************************************************************************/

export function GetMockReviewerList(): Reviewer[] {
  return MockReviewerList;
}

async function GetReviewerList(): Promise<Reviewer[] | string> {
  if (USE_LOCAL_DATA) {
    return GetMockReviewerList();
  }

  try {
    const URL_PATH = `${OSO_SERVICES_REVIEWERS_PATH}`;
    const result = await axios.get(`${SKA_OSO_SERVICES_URL}${URL_PATH}`, AXIOS_CONFIG);
    const results = result.data.length > 1 ? getReviewersAlphabetical(result.data) : result.data;
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : (results as Reviewer[]);
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'error.API_UNKNOWN_ERROR';
  }
}

export default GetReviewerList;
