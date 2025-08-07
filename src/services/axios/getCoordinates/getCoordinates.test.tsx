import { beforeEach, describe, expect, test, vi } from 'vitest';
import axios from 'axios';
import * as CONSTANTS from '@utils/constants.ts';
import GetCoordinates from '@services/axios/getCoordinates/getCoordinates.tsx';
import { MockEquatorialCoordinates } from '@services/axios/getCoordinates/mockCoordinates.tsx';

vi.mock('axios');
const mockedAxios = (axios as unknown) as {
  get: ReturnType<typeof vi.fn>;
};

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