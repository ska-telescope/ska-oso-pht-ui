import {
  cypressToken,
  OSO_SERVICES_PROPOSAL_PATH,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '@utils/constants.ts';
import useAxiosAuthClient from '../../axiosAuthClient/axiosAuthClient.tsx';

async function GetPresignedUploadUrl(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  filename: string
): Promise<string> {
  if (USE_LOCAL_DATA || cypressToken) {
    return 'https://httpbin.org/put';
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PROPOSAL_PATH}/signed-url/upload/${filename}`;
    const result = await authAxiosClient.post(`${SKA_OSO_SERVICES_URL}${URL_PATH}`);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'error.API_UNKNOWN_ERROR';
  }
}

export default GetPresignedUploadUrl;
