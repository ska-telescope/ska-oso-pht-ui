import { describe, expect, test } from 'vitest';
import { mapConfiguration } from './getConfiguration';
import { MockConfigurationBackend } from './mockConfigurationBackend';

describe('mapConfiguration', () => {
  test('maps the LOW frequency band fields to camelCase', () => {
    const result = mapConfiguration(MockConfigurationBackend);
    expect(result).toEqual({
      low: {
        minCoarseChannel: 64,
        maxCoarseChannel: 447,
        coarseChannelWidthHz: 781250
      }
    });
  });
});
