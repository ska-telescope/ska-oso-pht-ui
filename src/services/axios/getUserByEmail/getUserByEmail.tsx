import { MockUserBackend } from './mockUserBackend';
import TeamMember, { UserBackend } from '@/utils/types/teamMember';

/*****************************************************************************************************************************/
/*********************************************************** mapping *********************************************************/

function mapping(data: UserBackend): TeamMember {
  const teamMember = {
    id: data.id,
    userId: data.id,
    email: data.userPrincipalName,
    firstName: data.givenName,
    lastName: data.surname,
    affiliation: '',
    phdThesis: false,
    status: '',
    pi: false,
    officeLocation: data.officeLocation ? data.officeLocation : null,
    jobTitle: data.jobTitle ? data.jobTitle : null
  };
  console.log('Mapping UserBackend to TeamMember:', teamMember);
  return teamMember;
}

/*****************************************************************************************************************************/

export function GetMockUserByEmail(): TeamMember {
  return mapping(MockUserBackend);
}

async function GetUserByEmail(): Promise<TeamMember | string> {
  // authAxiosClient: ReturnType<typeof useAxiosAuthClient>, // TODO implement when using real data
  // skaEmail: string // TODO implement when using real data
  // if (USE_LOCAL_DATA) { // TODO implement when using real data
  return GetMockUserByEmail();
  // }

  // TODO implement this with correct path when the backend is ready
  /*
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
  */
}

export default GetUserByEmail;
