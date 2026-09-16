import { AxiosAuthClient } from '../../axiosAuthClient/axiosAuthClient';
import { OSO_SERVICES_PANEL_PATH, SKA_OSO_SERVICES_URL } from '@/utils/constants';

async function PostPanelGenerate(
  authAxiosClient: AxiosAuthClient
): Promise<string | { error: string }> {
  try {
    const result = await authAxiosClient.post(
      `${SKA_OSO_SERVICES_URL}${OSO_SERVICES_PANEL_PATH}/generate`
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
