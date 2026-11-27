import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  MockObservatoryDataBackend,
  MockObservatoryDataBackendProposal
} from '@/utils/osd/testing/mockObservatoryDataBackend';
import { ODT_CONFIGURATION_FALLBACK } from '@/utils/osd/odtConfigurationFallback';
import { osdMapping } from '@/utils/osd/osdMapping';
import { UNKNOWN_API_ERROR } from './apiResult';
import { getCycles } from './osd';

const { mockGetCycles, mockGetConfig } = vi.hoisted(() => ({
  mockGetCycles: vi.fn(),
  mockGetConfig: vi.fn()
}));

vi.mock('./client', () => ({
  osoApiBasePath: '',
  api: {
    proposals: { getAllOsdCyclesOsoApiV17PhtPrslsOsdCyclesGet: mockGetCycles },
    odt: { configurationGetOsoApiV17OdtConfigurationGet: mockGetConfig }
  }
}));

const cycles = [MockObservatoryDataBackend, MockObservatoryDataBackendProposal];
// The ODT configuration the backend sends, told apart from the fallback by a different elevation
const odtConfig = {
  ...ODT_CONFIGURATION_FALLBACK,
  ska_low: {
    ...ODT_CONFIGURATION_FALLBACK.ska_low,
    constraints: { ...ODT_CONFIGURATION_FALLBACK.ska_low.constraints, min_elevation_deg: 42 }
  }
};

// The mapped data holds functions, which aren't compared
const stripFunctions = (obj: unknown) =>
  JSON.parse(
    JSON.stringify(obj, (_key, value) => (typeof value === 'function' ? undefined : value))
  );

beforeEach(() => {
  vi.resetAllMocks();
});

describe('getCycles', () => {
  test('maps the cycles, last first, with the ODT configuration', async () => {
    mockGetCycles.mockResolvedValue({ data: [...cycles] });
    mockGetConfig.mockResolvedValue({ data: odtConfig });

    const { data } = await getCycles();

    expect(stripFunctions(data)).toEqual(
      stripFunctions(osdMapping([...cycles].reverse(), odtConfig as never))
    );
  });

  test('uses the fallback ODT configuration when it cannot be fetched', async () => {
    mockGetCycles.mockResolvedValue({ data: [...cycles] });
    mockGetConfig.mockRejectedValue(new Error('Network Error'));

    const { data } = await getCycles();

    expect(stripFunctions(data)).toEqual(
      stripFunctions(osdMapping([...cycles].reverse(), ODT_CONFIGURATION_FALLBACK))
    );
  });

  test('returns the error when the cycles cannot be fetched', async () => {
    mockGetCycles.mockRejectedValue(new Error('Network Error'));
    mockGetConfig.mockResolvedValue({ data: odtConfig });

    await expect(getCycles()).resolves.toEqual({ error: 'Network Error' });
  });

  test('returns the standard error when no cycles are returned', async () => {
    mockGetCycles.mockResolvedValue(undefined);
    mockGetConfig.mockResolvedValue({ data: odtConfig });

    await expect(getCycles()).resolves.toEqual({ error: UNKNOWN_API_ERROR });
  });
});
