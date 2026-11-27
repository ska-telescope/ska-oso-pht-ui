import { beforeEach, describe, expect, test, vi } from 'vitest';
import { UNKNOWN_API_ERROR } from './apiResult';
import { getVisibilitySvg } from './visibility';

const { mockVisibility } = vi.hoisted(() => ({ mockVisibility: vi.fn() }));

vi.mock('./client', () => ({
  osoApiBasePath: '',
  publicApi: { common: { visibilitySvgOsoApiV17VisibilityVisibilityGet: mockVisibility } }
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('getVisibilitySvg', () => {
  test('fetches the plot for the coordinates and array, returning the SVG', async () => {
    mockVisibility.mockResolvedValue({ data: '<svg></svg>' });

    await expect(getVisibilitySvg('05:34:31.94', '+22:00:52.2', 'LOW')).resolves.toEqual({
      data: '<svg></svg>'
    });
    expect(mockVisibility).toHaveBeenCalledExactlyOnceWith('LOW', '05:34:31.94', '+22:00:52.2');
  });

  test('returns the standard error when there is no SVG', async () => {
    mockVisibility.mockResolvedValue({ data: '' });
    await expect(getVisibilitySvg('1', '2', 'LOW')).resolves.toEqual({ error: UNKNOWN_API_ERROR });
  });

  test('returns the error from a failed request', async () => {
    mockVisibility.mockRejectedValue(new Error('Network Error'));
    await expect(getVisibilitySvg('1', '2', 'LOW')).resolves.toEqual({ error: 'Network Error' });
  });
});
