import {
  OSO_SERVICES_MEMBER_PATH,
  SKA_OSO_SERVICES_URL,
  TEAM_STATUS_TYPE_OPTIONS
} from '@utils/constants.ts';
import Investigator, { InvestigatorMSGraph } from '@utils/types/investigator.tsx';
import { AxiosAuthClient } from '../../axiosAuthClient/axiosAuthClient.ts';

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

async function GetUserByEmail(
  authAxiosClient: AxiosAuthClient,
  email: string
): Promise<Investigator | string> {
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
