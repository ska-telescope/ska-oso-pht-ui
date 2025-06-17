// import axios from 'axios';
import CycleData from '../../../utils/types/cycleData';
import MockCycleData from './mockCycleData';

/*****************************************************************************************************************************/

// TODO : PLACEHOLDER FOR GET-CYCLE-DATA ENDPOINT

export function GetMockCycleData(): CycleData[] {
  return MockCycleData;
}

async function GetCycleData(): Promise<CycleData[] | string> {
  return GetMockCycleData();
}

export default GetCycleData;
