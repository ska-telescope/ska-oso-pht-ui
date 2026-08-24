import { CalibratorBackend } from '@/utils/types/calibrationStrategy';

export const MockCalibratorBackendList: CalibratorBackend[] = [
  {
    calibrator: {
      target_id: 'calibrator-00001',
      name: '3C 444',
      pointing_pattern: {
        active: 'SinglePointParameters',
        parameters: [
          {
            kind: 'SinglePointParameters',
            offset_x_arcsec: 0,
            offset_y_arcsec: 0
          }
        ]
      },
      reference_coordinate: {
        kind: 'icrs',
        ra_str: '22:14:25.752',
        dec_str: '-17:01:36.29',
        pm_ra: 0,
        pm_dec: 0,
        parallax: 0,
        epoch: 2000
      },
      radial_velocity: {
        quantity: {
          value: 0,
          unit: 'km / s'
        },
        definition: 'RADIO',
        reference_frame: 'LSRK',
        redshift: 0.153053
      }
    },
    when: 'before_each_scan'
  },
  {
    calibrator: {
      target_id: 'calibrator-00001',
      name: '3C 444',
      pointing_pattern: {
        active: 'SinglePointParameters',
        parameters: [
          {
            kind: 'SinglePointParameters',
            offset_x_arcsec: 0,
            offset_y_arcsec: 0
          }
        ]
      },
      reference_coordinate: {
        kind: 'icrs',
        ra_str: '22:14:25.752',
        dec_str: '-17:01:36.29',
        pm_ra: 0,
        pm_dec: 0,
        parallax: 0,
        epoch: 2000
      },
      radial_velocity: {
        quantity: {
          value: 0,
          unit: 'km / s'
        },
        definition: 'RADIO',
        reference_frame: 'LSRK',
        redshift: 0.153053
      }
    },
    when: 'after_each_scan'
  }
];
