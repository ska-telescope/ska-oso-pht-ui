import { SKA_OSO_SERVICES_URL, USE_LOCAL_DATA } from '@utils/constants.ts';

function PostUploadPDF(): string {
  const URL_UPLOAD = `/prsls/signed-url/upload`;
  const UPLOAD_URL_DUMMY = 'https://httpbin.org/post';

  if (USE_LOCAL_DATA) {
    return `${UPLOAD_URL_DUMMY}`;
  }
  return `${SKA_OSO_SERVICES_URL}${URL_UPLOAD}`;
}

export default PostUploadPDF;
