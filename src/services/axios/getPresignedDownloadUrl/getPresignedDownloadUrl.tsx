import {
  OSO_SERVICES_PROPOSAL_PATH,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '../../../utils/constants';
import useAxiosAuthClient from '../axiosAuthClient/axiosAuthClient';

async function GetPresignedDownloadUrl(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  selectedFile: string
) {
  if (USE_LOCAL_DATA) {
    return 'https://dagrs.berkeley.edu/sites/default/files/2020-01/sample.pdf';
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PROPOSAL_PATH}/signed-url/download/${selectedFile}`;
    const result = await authAxiosClient.post(`${SKA_OSO_SERVICES_URL}${URL_PATH}`);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'error.API_UNKNOWN_ERROR';
  }
}

export default GetPresignedDownloadUrl;
