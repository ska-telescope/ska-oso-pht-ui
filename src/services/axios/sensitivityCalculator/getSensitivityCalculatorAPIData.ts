import GetCalculate from './getCalculate/getCalculate';
import GetWeighting from './getWeighting/getWeighting';
import { helpers } from '../../../utils/helpers';
import Observation from '../../../utils/types/observation';
import Target from '../../../utils/types/target';
import { SensCalcResults } from '../../../utils/types/sensCalcResults';
import {
  TYPE_ZOOM,
  STATUS_PARTIAL,
  USE_LOCAL_DATA_SENSITIVITY_CALC,
  STATUS_ERROR,
  TYPE_CONTINUUM,
  SUPPLIED_TYPE_SENSITIVITY
} from '../../../utils/constants';
import calculateSensitivityCalculatorResults from './calculateSensitivityCalculatorResults';
import { SENSCALC_CONTINUUM_MOCKED } from '../../axios/sensitivityCalculator/SensCalcResultsMOCK';

const makeResponse = (target: Target, statusGUI: number, error: string) => {
  return {
    id: target.id,
    title: target.name,
    statusGUI,
    error
  };
};

async function getSensCalc(observation: Observation, target: Target): Promise<SensCalcResults> {
  if (USE_LOCAL_DATA_SENSITIVITY_CALC) {
    return Promise.resolve(SENSCALC_CONTINUUM_MOCKED);
  }
  const fetchSensCalc = async (observation: Observation, target: Target) => {
    try {
      return await getSensitivityCalculatorAPIData(observation, target);
    } catch (e) {
      return { error: e };
    }
  };

  try {
    const output = await fetchSensCalc(observation, target);
    if ('error' in output) {
      return makeResponse(target, STATUS_ERROR, output.error.detail.split('\n')[0]);
    }
    if (output['calculate']['error'] && output['calculate']['error']['detail']) {
      return makeResponse(target, STATUS_ERROR, output['calculate']['error']['detail']);
    }
    if (output['weighting']['error'] && output['weighting']['error']['detail']) {
      return makeResponse(target, STATUS_ERROR, output['weighting']['error']['detail']);
    }
    const results = calculateSensitivityCalculatorResults(output, observation, target);
    return results;
  } catch (e) {
    const results = Object.assign(
      {},
      makeResponse(target, STATUS_PARTIAL, ''),
      makeResponse(target, STATUS_ERROR, e)
    );
    return results as SensCalcResults;
  }
}

async function getSensitivityCalculatorAPIData(observation: Observation, target: Target) {
  /* 
    When the users clicks on the Calculate button of the Sensitivity Calculator,
    there are 2, 3, or 4 calls to the API made

    Mid Continuum Modes: 
    - 1 call to getCalculate - supplied integration time or for supplied sensitivity: with Continuum thermal sensitivity
    - 1 call to getCalculate - for supplied sensitivity: with Spectral thermal sensitivity
    - 1 call to GetWeighting - with Continuum parameter
    - 1 call to GetWeighting - with Spectral parameter (weightingLine)

    Mid Zoom Modes: 
    - 1 call to getCalculate - with Zoom parameter and with supplied integration time or for supplied sensitivity: with Spectral thermal sensitivity
    - 1 call to GetWeighting - with Zoom parameter (weightingLine)

    Low (Continuum and Zoom Modes): 
    - 1 call to getCalculate
    - 1 call to GetWeighting
  */

  /* // original, keep it for a bit
  const promises = [
    GetCalculate(observation, target),
    GetWeighting(observation, target, observation.type)
  ];

  if (observation.type === TYPE_CONTINUUM) {
    promisesWeighting.push(GetWeighting(observation, target, TYPE_ZOOM));
    if (observation.supplied.type === SUPPLIED_TYPE_SENSITIVITY) {
      promises.push(GetCalculate(observation, target),);
    }
  }
  const [weighting, weightingLine] = await Promise.all(promises);
    */


  function handleWeighting (resolve, reject, obsType, Weightingresponses) {
    console.log('::: HEY in handleWeighting');
    const responseName = obsType === TYPE_CONTINUUM ? 'weighting' : 'weightingLine';
    GetWeighting(observation, target, obsType)
      .then((weightingRes) => {
        console.log('HEY weightingRes', weightingRes);
        Weightingresponses[responseName] = weightingRes;
        resolve(Weightingresponses); // Resolve the promise with the response value
      })
      .catch((error) => {
        console.error('HEY error', error);
        reject(error); // Reject the promise with the error object
      });
  }

  const promise = new Promise(function(resolve, reject) {
    const Weightingresponses = {};
    handleWeighting(resolve, reject, observation.type, Weightingresponses);
    if (observation.type === TYPE_CONTINUUM) {
      handleWeighting(resolve, reject, TYPE_ZOOM, Weightingresponses);
    }
  }).then(function(response) {
    console.log('HEY test');
    console.log('HEY response', response);
    // Then do some other stuff with the response
    // TODO add calculate calls now, using response from weighting
    return response;
  })
  .catch((error) => {
    console.error('HEY error 2', error); // Handle errors
  });

  console.log('HEY promise', promise);

  const response = await promise;
  console.log('HEY test response', response);


  // this works, just trying to optimize - keep it for a bit
  /*
  new Promise(function(resolve, reject) {
    const Weightingresponses = [];
    GetWeighting(observation, target, observation.type)
      .then((weighting) => {
        console.log('HEY response', response);
        Weightingresponses.push({weighting});
        resolve(Weightingresponses); // Resolve the promise with the response value
      })
      .catch((error) => {
        console.error('HEY error', error);
        reject(error); // Reject the promise with the error object
      });
    if (observation.type === TYPE_CONTINUUM) {
      GetWeighting(observation, target, TYPE_ZOOM)
      .then((weightingLine) => {
        console.log('HEY response', response);
        Weightingresponses.push({weightingLine});
        resolve(Weightingresponses); // Resolve the promise with the response value
      })
      .catch((error) => {
        console.error('HEY error', error);
        reject(error); // Reject the promise with the error object
      });
    }
  }).then(function(response) {
    console.log('HEY test');
    console.log('HEY response 2', response);
    // Then do some other stuff with the response
  })
  .catch((error) => {
    console.error('HEY error 2', error); // Handle errors
  });
  */

  /*
  const response = {
    calculate,
    weighting,
    weightingLine
  };
  */

  helpers.transform.trimObject(response);
  console.log('HEY trim response', response);
  return response;
}

export default getSensCalc;
