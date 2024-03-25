import axios from 'axios';
import { SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';

async function PutUploadPDF(signedUrl, selectedFile) {
  const UPLOAD_URL_DUMMY = 'https://httpbin.org/post';

  // This currently just returns an API URL to use for the FileUpload component, so not an "Axios" service
  // TODO: Will this need to change to handle eroors from API etc. or not needed?

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
