import { type ApiResult, callApi } from './apiResult';
import { publicApi } from './client';

/**
 * Fetches the visibility plot of the given equatorial coordinates for an array (LOW or MID), as
 * SVG markup. The endpoint is public, so this works logged out.
 */
export const getVisibilitySvg = (
  ra: string,
  dec: string,
  array: string
): Promise<ApiResult<string>> =>
  // The generated client types the SVG response as any
  callApi(() => publicApi.common.visibilitySvgOsoApiV17VisibilityVisibilityGet(array, ra, dec));
