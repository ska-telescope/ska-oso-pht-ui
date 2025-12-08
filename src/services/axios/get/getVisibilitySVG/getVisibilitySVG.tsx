import { OSO_SERVICES_VISIBILITY_PATH } from '@utils/constants.ts';
import axiosClient from '@services/axios/axiosClient/axiosClient.tsx';

async function GetVisibility(ra: string, dec: string, array: string) {
  try {
    const result = await axiosClient.get(`${OSO_SERVICES_VISIBILITY_PATH}`, {
      params: { ra, dec, array }
    });

    if (!result || !result?.data) {
      return 'error.API_UNKNOWN_ERROR';
    }
    return result;
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default GetVisibility;
