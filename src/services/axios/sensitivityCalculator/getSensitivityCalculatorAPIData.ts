import GetCalculate from './getCalculate/getCalculate';
import GetWeighting from './getWeighting/getWeighting';
import { helpers } from '../../../utils/helpers';
import Observation from '../../../utils/types/observation';

const TEL = ['', 'Mid', 'Low'];
const MODE = ['Zoom', 'Continuum'];

async function getSensitivityCalculatorAPIData(observation: Observation) {
  /* 
    When the users clicks on the Calculate button of the Sensitivity Calculator,
    there are 2 or 3 calls to the API made

    Continuum Modes (Low or Mid): 
    - 1 call to getCalculate - with Continuum parameter
    - 1 call to GetWeighting - with Continuum parameter
    - 1 call to GetWeighting - with Zoom parameter (weightingLine)

    Zoom Modes (Low or Mid): 
    - 1 call to getCalculate - with Zoom parameter
    - 1 call to GetWeighting - with Zoom parameter (weightingLine)
  */

  const isZoom = observation.type === 0;
  const calculate = await GetCalculate(
    TEL[observation.telescope],
    MODE[observation.type],
    observation
  );
  const weighting = await GetWeighting(
    TEL[observation.telescope],
    MODE[observation.type],
    observation
  );
  let weightingLine;
  if (!isZoom) {
    weightingLine = await GetWeighting(TEL[observation.telescope], MODE[1], observation);
  } // 2nd weighting call with Zoom - Continuum Mode only

  const response = {
    calculate,
    weighting,
    weightingLine
  };

  helpers.transform.trimObject(response);

  return response;
}

export default getSensitivityCalculatorAPIData;
