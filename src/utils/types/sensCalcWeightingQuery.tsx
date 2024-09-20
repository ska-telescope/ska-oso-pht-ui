export type WeightingLowContinuumQuery = {
    spectral_mode: string;
    weighting_mode: string;
    subarray_configuration: string;
    pointing_centre: string;
    freq_centre_mhz: number | string;
    robustness?: number | string;
}