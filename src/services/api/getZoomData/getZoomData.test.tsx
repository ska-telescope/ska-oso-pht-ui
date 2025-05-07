import { describe, test } from 'vitest';
import getZoomData from './getZoomData';
import '@testing-library/jest-dom';
import {
  NEW_ADVANCED_DATA,
  NEW_STANDARD_DATA_LOW,
  NEW_ZOOM_DATA_LOW
} from '@/utils/types/data.tsx';
import { ZOOM_DATA_MOCKED } from './mockedZoomResults';
import { TELESCOPE_LOW } from '@ska-telescope/ska-gui-components';
import { SUBARRAY_DATA_LOW_MOCKED } from '../getSubArrayData/mockedSubArrayResults';
import { addWarningData } from '@/services/api/submissionEntries/submissionEntries.tsx';

describe('getZoomData', () => {
  test('Retrieved mocked data LOW', async () => {
    const results = await getZoomData(
      TELESCOPE_LOW,
      SUBARRAY_DATA_LOW_MOCKED,
      NEW_STANDARD_DATA_LOW,
      NEW_ADVANCED_DATA,
      NEW_ZOOM_DATA_LOW,
      false,
      true
    );
    expect(results).toBe(ZOOM_DATA_MOCKED);
  });

  test('Custom Warning ', () => {
    const inData: string[] = ['WARNING'];
    const results: any[] = [];
    expect(addWarningData(inData, results, 'warningCustom')).toBeDefined();
  });
});
