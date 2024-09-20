export type CalculateMidContinuum = {
    integration_time_s?: number | string;
    sensitivity_jy?: number | string;
    rx_band: string;
    subarray_configuration: string;
    freq_centre_hz: number | string;
    bandwidth_hz: number | string;
    spectral_averaging_factor: number | string;
    pointing_centre: string;
    pwv: number | string;
    el: number | string;
    n_subbands: number | string;
}

export type CalculateMidZoom   = {
    integration_time_s?: number | string;
    sensitivity_jy?: number | string;
    rx_band: string;
    subarray_configuration: string;
    freq_centres_hz: number | string;
    pointing_centre: string;
    pwv: number | string;
    el: number | string;
    spectral_resolutions_hz: number | string;
    total_bandwidths_hz: number | string;
}