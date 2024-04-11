import axios from 'axios';
import { USE_LOCAL_DATA } from '../../../utils/constants';

async function GetDownloadPDF(signedUrl, selectedFile) {
  const DOWNLOAD_URL_DUMMY = 'https://httpbin.org/get';

  //TODO: revisit error handling when s3 credential is added to the backend

  if (USE_LOCAL_DATA) {
    console.log("HELLO!")
    return `${DOWNLOAD_URL_DUMMY}`;
  }

  try {
    let formData = new FormData();
    formData.append('file', selectedFile);
    console.log("Pre get request..")
    const result = await axios.get(`${signedUrl}`);
    console.log("Post get request..")

    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default GetDownloadPDF;
