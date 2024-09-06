// import axios from 'axios';
import { USE_LOCAL_DATA } from '../../../utils/constants';
import CycleData from '../../../utils/types/cycleData';
import MockCycleData from './mockCycleData';

/*****************************************************************************************************************************/

// TODO : PLACEHOLDER FOR GET-CYCLE-DATA ENDPOINT

export function GetMockCycleData(): CycleData[] {
  return MockCycleData;
}

async function GetCycleData(): Promise<CycleData[] | string> {
  if (true || USE_LOCAL_DATA) {
    return GetMockCycleData();
  }
}

export default GetCycleData;
