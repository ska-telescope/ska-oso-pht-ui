import axios from 'axios';
import { USE_LOCAL_DATA } from '../../../utils/constants';

async function DeleteDeletePDF(signedUrl: string) {
  const UPLOAD_URL_DUMMY = 'https://httpbin.org/delete';

  if (USE_LOCAL_DATA) {
    return `${UPLOAD_URL_DUMMY}`;
  }

  try {
    const result = await axios.delete(`${signedUrl}`);
    return typeof result === 'undefined' || result?.status !== 204
      ? 'error.API_UNKNOWN_ERROR'
      : result.data;
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default DeleteDeletePDF;
