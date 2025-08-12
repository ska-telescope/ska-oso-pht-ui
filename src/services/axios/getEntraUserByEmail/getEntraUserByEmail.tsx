import { SKA_OSO_SERVICES_URL, USE_LOCAL_DATA, MSENTRA_GRAPH_API_USERS_PATH } from '@utils/constants.ts';
import useAxiosAuthClient from '../axiosAuthClient/axiosAuthClient';
import { EntraUser } from '@/utils/types/teamMember';
import { MockEntraUserBackend } from './mockEntraUserFrontend';

const MSENTRA_GRAPH_API_URL = "https://graph.microsoft.com/v1.0";

/*****************************************************************************************************************************/
/*********************************************************** mapping *********************************************************/

function mapping(data: any): EntraUser {
  return {
    userId: data.id,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName
  };
}

/*****************************************************************************************************************************/

export function GetMockEntraUserByEmail(): EntraUser {
  return mapping(MockEntraUserBackend);
}

async function GetEntraUserByEmail(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  skaEmail: string
): Promise<EntraUser | string> {
  if (USE_LOCAL_DATA) {
    return GetMockEntraUserByEmail();
  }

  try {
    const URL_PATH = `https://graph.microsoft.com/v1.0${MSENTRA_GRAPH_API_USERS_PATH}/${skaEmail}`;
    const result = await authAxiosClient.get(`${URL_PATH}`);

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

export default GetEntraUserByEmail;
