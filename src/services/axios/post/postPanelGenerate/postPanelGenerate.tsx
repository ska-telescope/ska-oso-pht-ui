import useAxiosAuthClient from '../../axiosAuthClient/axiosAuthClient';
import { OSO_SERVICES_PANEL_PATH, SKA_OSO_SERVICES_URL, USE_LOCAL_DATA } from '@/utils/constants';

async function PostPanelGenerate(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  cycleDescription: string
): Promise<string | { error: string }> {
  if (USE_LOCAL_DATA) {
    return '';
  }

  try {
    const result = await authAxiosClient.post(
      `${SKA_OSO_SERVICES_URL}${OSO_SERVICES_PANEL_PATH}/generate?param=${cycleDescription}`
    );

    if (!result) {
      return { error: 'error.API_UNKNOWN_ERROR' };
    }
    return result.data as string;
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default PostPanelGenerate;
