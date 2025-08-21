import {
  OSO_SERVICES_PROPOSAL_PATH,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '@utils/constants.ts';
import useAxiosAuthClient from '../../axiosAuthClient/axiosAuthClient.tsx';

async function GetPresignedDeleteUrl(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  selectedFile: string
) {
  if (USE_LOCAL_DATA) {
    return 'https://httpbin.org/delete';
  }

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
