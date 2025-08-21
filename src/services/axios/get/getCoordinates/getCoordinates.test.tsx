import { beforeEach, describe, expect, test, vi } from 'vitest';
import * as CONSTANTS from '@utils/constants.ts';
import GetCoordinates from '@services/axios/get/getCoordinates/getCoordinates.tsx';
import { MockEquatorialCoordinates } from '@services/axios/get/getCoordinates/mockCoordinates.tsx';

vi.mock('axios');

describe('GetCoordinates Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('returns mapped mock data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await GetCoordinates('M1', 0);
    expect(result).toEqual(MockEquatorialCoordinates);
  });
});
