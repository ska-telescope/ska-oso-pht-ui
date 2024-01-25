import { SKA_PHT_API_URL, USE_LOCAL_DATA } from '../../../utils/constants';

function PostUploadPDF(): string {
  const URL_UPLOAD = `/upload/pdf`;
  const UPLOAD_URL_DUMMY = 'https://httpbin.org/post';

  // This currently just returns an API URL to use for the FileUpload component, so not an "Axios" service
  // TODO: Will this need to change to handle eroors from API etc. or not needed?

  if (USE_LOCAL_DATA) {
    return `${UPLOAD_URL_DUMMY}`;
  }
  return `${SKA_PHT_API_URL}${URL_UPLOAD}`;
}

export default PostUploadPDF;
