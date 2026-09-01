import axiosClientPDF from '../../axiosClientPDF/axiosClientPDF';

async function PutUploadPDF(signedUrl: string, selectedFile: any) {
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
