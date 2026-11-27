import axios from 'axios';
import { type ApiResult, callApi, UNKNOWN_API_ERROR } from './apiResult';
import { api } from './client';

/*
 * The proposal's PDF documents. ska-oso-services hands out S3 signed URLs for a file, and the file
 * itself is then sent to or deleted from S3 directly.
 */

// S3 requests carry their authorisation in the signed URL, so they go through an instance of
// their own, without the user's token that the global axios instance adds
const s3Axios = axios.create();

/** A signed URL to upload the named file to. */
export const getUploadUrl = (filename: string): Promise<ApiResult<string>> =>
  callApi(() =>
    api.proposals.createUploadPdfUrlOsoApiV17PhtPrslsSignedUrlUploadFilenamePost(filename)
  );

/** A signed URL to download the named file from. */
export const getDownloadUrl = (filename: string): Promise<ApiResult<string>> =>
  callApi(() =>
    api.proposals.createDownloadPdfUrlOsoApiV17PhtPrslsSignedUrlDownloadFilenamePost(filename)
  );

/** A signed URL to delete the named file with. */
export const getDeleteUrl = (filename: string): Promise<ApiResult<string>> =>
  callApi(() =>
    api.proposals.createDeletePdfUrlOsoApiV17PhtPrslsSignedUrlDeleteFilenamePost(filename)
  );

/** Uploads the file to the signed URL. The browser sets its Content-Type. */
export const uploadToSignedUrl = (signedUrl: string, file: Blob): Promise<ApiResult<void>> =>
  callApi(
    () => s3Axios.put(signedUrl, file),
    () => undefined,
    { allowEmpty: true }
  );

/** Deletes the file at the signed URL. S3 confirms a delete with 204, so anything else is an error. */
export const deleteAtSignedUrl = (signedUrl: string): Promise<ApiResult<void>> =>
  callApi(
    async () => {
      const response = await s3Axios.delete(signedUrl);
      if (response?.status !== 204) {
        throw new Error(UNKNOWN_API_ERROR);
      }
      return response;
    },
    () => undefined,
    { allowEmpty: true }
  );
