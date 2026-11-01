import { AxiosError } from 'axios';
import { Telescope } from '@utils/types/typesSensCalc';
import { AxiosAuthClient } from '@/services/axios/axiosAuthClient/axiosAuthClient';
import { SKA_SENSITIVITY_CALCULATOR_API_URL, STATUS_ERROR } from '@/utils/constants';
import { SensCalcResults } from '@utils/types/sensCalcResults.tsx';
import { SensCalcQueryParams } from '@services/axios/get/getSensitivityCalculator/sensitivityCalculator/sensCalHelpers.ts';

const Fetch = async (
  authAxiosClient: AxiosAuthClient,
  telescope: Telescope,
  baseUrl: string,
  properties: SensCalcQueryParams
): Promise<SensCalcResults> => {
  try {
    const finalURL = `${SKA_SENSITIVITY_CALCULATOR_API_URL}${telescope.code}${baseUrl}`;
    const result = await authAxiosClient.get(finalURL, { params: properties });
    return result.data;
  } catch (e) {
    const err = e as AxiosError<{ detail?: string }>;
    const errMsg = err?.response?.data?.detail || err?.message || err?.toString();

    return {
      statusGUI: STATUS_ERROR,
      error: errMsg
    };
  }
};
export default Fetch;
