import {
  OSO_SERVICES_MEMBER_PATH,
  SKA_OSO_SERVICES_URL,
  TEAM_STATUS_TYPE_OPTIONS,
  USE_LOCAL_DATA
} from '@utils/constants.ts';
import Investigator, { InvestigatorMSGraph } from '@utils/types/investigator.tsx';
import useAxiosAuthClient from '../../axiosAuthClient/axiosAuthClient.ts';
import { MockUserMSGraphList } from './mockUserMSGraph.tsx';

/*****************************************************************************************************************************/
/*********************************************************** mapping *********************************************************/

export function mapping(data: InvestigatorMSGraph): Investigator {
  const investigator = {
    id: data.id,
    email: data.email,
    firstName: data.givenName,
    lastName: data.surname,
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
  const teamList: Investigator[] = MockUserMSGraphList.map(mapping);
  const user = teamList.find(user => user?.email?.toLowerCase() === email?.toLowerCase());
  if (!user) {
    return 'error.API_UNKNOWN_ERROR';
  }
  return user;
}

async function GetUserByEmail(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  email: string
): Promise<Investigator | string> {
  if (USE_LOCAL_DATA) {
    return GetMockUserByEmail(email);
  }

  try {
    const URL_PATH = `${OSO_SERVICES_MEMBER_PATH}/${email}`;
    const result = await authAxiosClient.get(`${SKA_OSO_SERVICES_URL}${URL_PATH}`);

    if (!result || !result.data || typeof result.data !== 'object') {
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
