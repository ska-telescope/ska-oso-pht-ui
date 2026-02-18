import { cypressToken, USE_LOCAL_DATA } from '@utils/constants.ts';
import axiosClientPDF from '../../axiosClientPDF/axiosClientPDF';

async function PutUploadPDF(signedUrl: string, selectedFile: any) {
  const UPLOAD_URL_DUMMY = 'https://httpbin.org/put';

  //TODO: revisit error handling when s3 credential is added to the backend

  if (USE_LOCAL_DATA || cypressToken) {
    return `${UPLOAD_URL_DUMMY}`;
  }

  try {
    // For S3 signed URLs, upload the file directly and let the browser set the Content-Type
    const result = await axiosClientPDF.put(`${signedUrl}`, selectedFile);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default PutUploadPDF;
