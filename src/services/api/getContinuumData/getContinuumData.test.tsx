// DISABLED UNTIL VITEST IS IMPLEMENTED

/*
import { describe, test } from 'vitest';
import getContinuumData from './getContinuumData';
import '@testing-library/jest-dom';
import { NEW_CONTINUUM_DATA_LOW, NEW_STANDARD_DATA_LOW } from '../../../utils/types/data';
import { CONTINUUM_DATA_MOCKED } from './mockedContinuumResults';
import { TELESCOPE_LOW } from '@ska-telescope/ska-gui-components';
import { SUBARRAY_DATA_LOW_MOCKED } from '../getSubArrayData/mockedSubArrayResults';

describe('getContinuumData', () => {
  test('Retrieved mocked data LOW ( MOCKED_API ) ', async () => {
    const results = await getContinuumData(
      TELESCOPE_LOW,
      SUBARRAY_DATA_LOW_MOCKED,
      NEW_STANDARD_DATA_LOW,
      NEW_CONTINUUM_DATA_LOW
    );
    expect(results).toBe(CONTINUUM_DATA_MOCKED);
  });
  test('Retrieved mocked data LOW', async () => {
    const results = await getContinuumData(
      TELESCOPE_LOW,
      SUBARRAY_DATA_LOW_MOCKED,
      NEW_STANDARD_DATA_LOW,
      NEW_CONTINUUM_DATA_LOW
    );
    expect(results).toBe(CONTINUUM_DATA_MOCKED);
  });
});

*/
