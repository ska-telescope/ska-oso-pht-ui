import { TEAM_STATUS_TYPE_OPTIONS } from '@utils/constants.ts';
import Investigator, { InvestigatorBackend } from '@utils/types/investigator.tsx';
import { MockUserBackendList } from './mockUserBackend.tsx';

/*****************************************************************************************************************************/
/*********************************************************** mapping *********************************************************/

export function mapping(data: InvestigatorBackend): Investigator {
  const investigator = {
    id: data.user_id,
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

// This mocks fetching a user by email using Stargazer team
export function GetMockUserByEmail(email: string): Investigator | string {
  const teamList: Investigator[] = MockUserBackendList.map(mapping);
  const user = teamList.find(user => user?.email?.toLowerCase() === email?.toLowerCase());
  if (!user) {
    return 'error.API_UNKNOWN_ERROR';
  }
  return user;
}

/* 
// TODO implement this with correct path when the backend is ready
async function GetUserByEmail(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  email: string
): Promise<Investigator | string> {
    if (USE_LOCAL_DATA) {
      return GetMockUserByEmail();
    }

  try {
    const URL_PATH = `${OSO_SERVICES_USERS_PATH}/${email}`;
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
