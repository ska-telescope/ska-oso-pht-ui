import { MockUserBackendPartial } from './mockUserBackend';
import { TEAM_STATUS_TYPE_OPTIONS } from '@/utils/constants';
import Investigator, { InvestigatorBackend } from '@/utils/types/investigator';

/*****************************************************************************************************************************/
/*********************************************************** mapping *********************************************************/

export function mapping(data: InvestigatorBackend): Investigator {
  const investigator = {
    id: data.investigator_id,
    email: data.email, // This should always be a SKAO email (@community.skao.int or @skao.int)
    firstName: data.given_name,
    lastName: data.family_name,
    affiliation: '',
    phdThesis: false,
    status: TEAM_STATUS_TYPE_OPTIONS.pending,
    pi: false,
    officeLocation: data.officeLocation ? data.officeLocation : null,
    jobTitle: data.jobTitle ? data.jobTitle : null
  };
  return investigator;
}

/*****************************************************************************************************************************/

export function GetMockUserByEmail(skaEmail: string): Investigator | string {
  return mapping(MockUserBackendPartial);
}

/* 
// TODO implement this with correct path when the backend is ready
async function GetUserByEmail(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  skaEmail: string
): Promise<Investigator | string> {
    if (USE_LOCAL_DATA) {
      return GetMockUserByEmail();
    }

  try {
    const URL_PATH = `${OSO_SERVICES_USERS_PATH}/${skaEmail}`;
    const result = await authAxiosClient.get(`${SKA_OSO_SERVICES_URL}${URL_PATH}`);

    if (!result.data) {
      return 'error.API_UNKNOWN_ERROR';
    }
    return mapping(result.data);
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'error.API_UNKNOWN_ERROR';
  }
} 

export default GetUserByEmail;
*/
