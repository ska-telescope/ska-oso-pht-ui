import { isAxiosError, isCancel } from 'axios';
import axiosClient from '@/services/axios/axiosClient/axiosClient';
import { SKA_SENSITIVITY_CALCULATOR_API_URL } from '@/utils/constants';
import type {
  ContinuumResponse,
  LowContinuumRequest,
  LowZoomRequest,
  MidContinuumRequest,
  MidZoomRequest,
  ZoomResponse
} from './types';

export const SENS_CALC_ERROR_KIND = {
  ABORTED: 'aborted',
  FAILED: 'failed'
} as const;
export type SensCalcErrorKind = (typeof SENS_CALC_ERROR_KIND)[keyof typeof SENS_CALC_ERROR_KIND];

export type SensCalcSuccess<T> = { ok: true; data: T };

export type SensCalcError = {
  ok: false;
  kind: SensCalcErrorKind;
  title: string;
  detail: string;
};

/** Normalises anything thrown by a Sensitivity Calculator request into a SensCalcError. */
export const toSensCalcError = (e: unknown): SensCalcError => {
  if (isCancel(e)) {
    return {
      ok: false,
      kind: SENS_CALC_ERROR_KIND.ABORTED,
      title: 'Aborted',
      detail: 'The request was canceled.'
    };
  }
  const body = isAxiosError(e) ? e.response?.data : undefined;
  return {
    ok: false,
    kind: SENS_CALC_ERROR_KIND.FAILED,
    title: body?.title ?? 'Sensitivity Calculator Error',
    detail: body?.detail ?? (e instanceof Error ? e.message : String(e))
  };
};

export type SensCalcRequestOptions = { signal?: AbortSignal };

const post = async <Req, Res>(
  path: string,
  body: Req,
  options: SensCalcRequestOptions = {}
): Promise<SensCalcSuccess<Res> | SensCalcError> => {
  try {
    const response = await axiosClient.post(`${SKA_SENSITIVITY_CALCULATOR_API_URL}${path}`, body, {
      signal: options.signal
    });
    return { ok: true, data: response.data };
  } catch (e) {
    return toSensCalcError(e);
  }
};

export const postLowContinuum = (body: LowContinuumRequest, options?: SensCalcRequestOptions) =>
  post<LowContinuumRequest, ContinuumResponse>('low/continuum/calculate', body, options);

export const postLowZoom = (body: LowZoomRequest, options?: SensCalcRequestOptions) =>
  post<LowZoomRequest, ZoomResponse>('low/zoom/calculate', body, options);

export const postMidContinuum = (body: MidContinuumRequest, options?: SensCalcRequestOptions) =>
  post<MidContinuumRequest, ContinuumResponse>('mid/continuum/calculate', body, options);

export const postMidZoom = (body: MidZoomRequest, options?: SensCalcRequestOptions) =>
  post<MidZoomRequest, ZoomResponse>('mid/zoom/calculate', body, options);
