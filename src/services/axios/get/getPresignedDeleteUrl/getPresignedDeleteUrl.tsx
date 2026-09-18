import { OSO_SERVICES_PROPOSAL_PATH, SKA_OSO_SERVICES_URL } from '@utils/constants.ts';
import { AxiosAuthClient } from '../../axiosAuthClient/axiosAuthClient.tsx';

async function GetPresignedDeleteUrl(authAxiosClient: AxiosAuthClient, selectedFile: string) {
  try {
    const URL_PATH = `${OSO_SERVICES_PROPOSAL_PATH}/signed-url/delete/${selectedFile}`;
    const result = await authAxiosClient.post(`${SKA_OSO_SERVICES_URL}${URL_PATH}`);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'error.API_UNKNOWN_ERROR';
  }
}

export default GetPresignedDeleteUrl;
