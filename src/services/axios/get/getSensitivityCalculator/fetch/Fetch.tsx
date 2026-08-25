import { Telescope } from '@ska-telescope/ska-gui-local-storage';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import { SKA_SENSITIVITY_CALCULATOR_API_URL, STATUS_ERROR } from '@/utils/constants';
import { SensCalcResults } from '@utils/types/sensCalcResults.tsx';
import { SensCalcQueryParams } from '@services/axios/get/getSensitivityCalculator/sensitivityCalculator/sensCalHelpers.ts';

const Fetch = async (
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  telescope: Telescope,
  baseUrl: string,
  properties: SensCalcQueryParams
): Promise<SensCalcResults> => {
  try {
    const finalURL = `${SKA_SENSITIVITY_CALCULATOR_API_URL}${telescope.code}${baseUrl}`;
    return authAxiosClient.get(finalURL, { params: properties }).then((result) => result.data);
  } catch (e) {
    const errMsg = e?.message || e?.response?.data?.detail || e?.toString();

    return {
      statusGUI: STATUS_ERROR,
      error: errMsg
    };
  }
};
export default Fetch;
