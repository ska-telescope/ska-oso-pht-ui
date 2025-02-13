import axiosClient from '../axiosClient/axiosClient';
import { USE_LOCAL_DATA } from '../../../utils/constants';

async function DeleteDeletePDF(signedUrl) {
  const UPLOAD_URL_DUMMY = 'https://httpbin.org/delete';

  if (USE_LOCAL_DATA) {
    return `${UPLOAD_URL_DUMMY}`;
  }

  try {
    const result = await axiosClient.delete(`${signedUrl}`);
    return typeof result === 'undefined' || result?.status !== 204
      ? 'error.API_UNKNOWN_ERROR'
      : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default DeleteDeletePDF;
