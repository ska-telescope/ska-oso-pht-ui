import GetCalculate from './getCalculate/getCalculate';
import GetWeighting from './getWeighting/getWeighting';
import { helpers } from '../../../utils/helpers';

const TEL = ['', 'Mid', 'Low'];
const MODE = ['', 'Zoom', 'Continuum'];

async function getSensitivityCalculatorAPIData(telescope: number, mode: number) {
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

  const isZoom = mode === 1;

  const calculate = await GetCalculate(TEL[telescope], MODE[mode]);
  const weighting = await GetWeighting(telescope, mode);
  let weightingLine;
  if (!isZoom) {
    weightingLine = await GetWeighting(telescope, MODE[1]);
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
