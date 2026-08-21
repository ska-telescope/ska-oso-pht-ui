import { Telescope } from '@ska-telescope/ska-gui-local-storage';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import Observation from '@/utils/types/observation';
import { SKA_SENSITIVITY_CALCULATOR_API_URL, STATUS_ERROR } from '@/utils/constants';
import { SensCalcResults } from '@utils/types/sensCalcResults.tsx';

export type MappingFunction = (
  sensCalcApiResponse: any,
  observation: Observation
) => SensCalcResults;

const Fetch = async (
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  telescope: Telescope,
  baseUrl: string,
  properties: string,
  mapping: MappingFunction,
  observation: Observation
): Promise<SensCalcResults> => {
  try {
    let finalURL = `${SKA_SENSITIVITY_CALCULATOR_API_URL}${telescope.code}${baseUrl}`;
    finalURL += properties;
    const result = await authAxiosClient.get(finalURL);
    return mapping(result.data, observation);
  } catch (e) {
    const errMsg = e?.message || e?.response?.data?.detail || e?.toString();

    return {
      statusGUI: STATUS_ERROR,
      error: errMsg
    };
  }
};
export default Fetch;
