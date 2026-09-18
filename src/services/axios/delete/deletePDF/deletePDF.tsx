import axiosClient from '../../axiosClient/axiosClient.tsx';

async function DeletePDF(signedUrl: string) {
  try {
    const result = await axiosClient.delete(`${signedUrl}`);
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

export default DeletePDF;
