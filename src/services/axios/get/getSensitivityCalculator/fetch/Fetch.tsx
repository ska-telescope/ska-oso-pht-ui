import { Telescope } from '@ska-telescope/ska-gui-local-storage';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import Observation from '@/utils/types/observation';
import Target from '@/utils/types/target';
import { SKA_SENSITIVITY_CALCULATOR_API_URL, STATUS_ERROR } from '@/utils/constants';
import { SensCalcResults } from '@utils/types/sensCalcResults.tsx';

export type MappingFunction = (
  sensCalcApiResponse: any,
  target: Target,
  observation: Observation
) => SensCalcResults;

const Fetch = async (
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  telescope: Telescope,
  baseUrl: string,
  properties: string,
  mapping: MappingFunction,
  target: Target,
  observation: Observation
): Promise<SensCalcResults> => {
  try {
    let finalURL = `${SKA_SENSITIVITY_CALCULATOR_API_URL}${telescope.code}${baseUrl}`;
    finalURL += properties;
    const result = await authAxiosClient.get(finalURL);
    return mapping(result.data, target, observation);
  } catch (e) {
    const title = e?.response?.data?.title || 'Sensitivity Calculator API error';
    const errMsg = e?.response?.data?.detail || e?.message || e?.toString();

    return {
      statusGUI: STATUS_ERROR,
      title: title,
      error: errMsg
    };
  }
};
export default Fetch;
