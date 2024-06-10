import axios from 'axios';
import { USE_LOCAL_DATA } from '../../../utils/constants';

async function PutUploadPDF(signedUrl, selectedFile) {
  const UPLOAD_URL_DUMMY = 'https://httpbin.org/put';

  //TODO: revisit error handling when s3 credential is added to the backend

  if (USE_LOCAL_DATA) {
    return `${UPLOAD_URL_DUMMY}`;
  }

  try {
    let formData = new FormData();
    formData.append('file', selectedFile);
    const result = await axios.put(`${signedUrl}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default PutUploadPDF;
