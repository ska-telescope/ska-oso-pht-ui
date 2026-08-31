import { SKA_OSO_SERVICES_URL } from '@utils/constants.ts';

function PostUploadPDF(): string {
  const URL_UPLOAD = `/prsls/signed-url/upload`;

  return `${SKA_OSO_SERVICES_URL}${URL_UPLOAD}`;
}

export default PostUploadPDF;
