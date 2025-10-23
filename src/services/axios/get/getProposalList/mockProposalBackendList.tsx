import { ProposalBackend } from '../../../../utils/types/proposal';

const MockProposalBackendList: ProposalBackend[] = [
  {
    prsl_id: 'prp-ska01-202204-02',
    status: 'draft',
    submitted_on: '2022-09-23T15:43:53.971548Z',
    submitted_by: 'TestUser',
    investigator_refs: ['prp-ska01-202204-01'],
    metadata: {
      version: 1,
      created_by: 'TestUser',
      created_on: '2022-09-23T15:43:53.971548Z',
      last_modified_by: 'TestUser',
      last_modified_on: '2022-09-23T15:43:53.971548Z',
      pdm_version: '1.0.0'
    },
    cycle: 'SKA_5000_2023',
    proposal_info: {
      title: 'In a galaxy far, far away',
      proposal_type: {
        main_type: 'standard_proposal',
        attributes: ['coordinated_proposal']
      },
      abstract:
        'Pretty Looking frontend depends on hard work put into good wire-framing and requirement gathering',
      science_category: 'Science Category',
      investigators: [
        {
          user_id: 'prp-ska01-202204-01',
          given_name: 'Tony',
          family_name: 'Bennet',
          email: 'somewhere.vague@example.com',
          organization: '',
          for_phd: false,
          principal_investigator: true
        }
      ]
    },
    observation_info: {
      targets: [
        {
          target_id: 'M28',
          pointing_pattern: {
            active: 'SinglePointParameters',
            parameters: [
              {
                kind: 'SinglePointParameters',
                offset_x_arcsec: 0.0,
                offset_y_arcsec: 0.0
              }
            ]
          },
          reference_coordinate: {
            kind: 'equatorial',
            ra: 250.0,
            dec: 30.0,
            unit: ['deg', 'deg'],
            reference_frame: 'icrs'
          },
          radial_velocity: {
            quantity: {
              value: -12.345,
              unit: 'm/s'
            },
            definition: 'OPTICAL',
            reference_frame: 'LSRK',
            redshift: 1.2
          }
        },
        {
          target_id: 'M1',
          pointing_pattern: {
            active: 'SinglePointParameters',
            parameters: [
              {
                kind: 'SinglePointParameters',
                offset_x_arcsec: 0.0,
                offset_y_arcsec: 0.0
              }
            ]
          },
          reference_coordinate: {
            kind: 'equatorial',
            ra: 250.0,
            dec: -30.0,
            unit: ['deg', 'deg'],
            reference_frame: 'icrs'
          },
          radial_velocity: {
            quantity: {
              value: 0.0,
              unit: 'km/s'
            },
            definition: 'RADIO',
            reference_frame: 'LSRK',
            redshift: 0.0
          }
        }
      ],
      documents: [
        {
          document_id: 'doc_ref_01',
          link: 'https://freetestdata.com/wp-content/uploads/2021/09/Free_Test_Data_100KB_PDF.pdf',
          type: 'proposal_science'
        },
        {
          document_id: 'doc_ref_02',
          link: 'https://freetestdata.com/wp-content/uploads/2021/09/Free_Test_Data_100KB_PDF.pdf',
          type: 'proposal_technical'
        }
      ],
      observation_sets: [
        {
          observation_set_id: 'mid-001',
          group_id: '2',
          observing_band: 'mid_band_1',
          elevation: 15,
          // TODO: use this once latest PDM changes merged
          /*
          elevation: {
            default: 15,
            description: 'Elevation from the horizon to be used',
            maximum: 90,
            minimum: 15,
            title: 'Elevation',
            type: 'integer'
          },
          */
          array_details: {
            array: 'ska_mid',
            subarray: 'aa0.5',
            weather: 3,
            number_15_antennas: 0,
            number_13_antennas: 0,
            number_sub_bands: 0,
            tapering: '50'
          },
          observation_type_details: {
            observation_type: 'continuum',
            bandwidth: {
              value: 0.0,
              unit: 'm/s'
            },
            central_frequency: {
              value: 0.0,
              unit: 'm/s'
            },
            supplied: {
              type: 'integration',
              quantity: {
                value: -12.345,
                unit: 'ms'
              }
            },
            spectral_resolution: '50',
            effective_resolution: '50',
            image_weighting: 'Uniform'
          },
          details: 'MID + Continuum'
        },
        {
          observation_set_id: 'mid-002',
          group_id: '2',
          observing_band: 'mid_band_1',
          elevation: 15,
          // TODO: use this once latest PDM changes merged
          /*
          elevation: {
            default: 15,
            description: 'Elevation from the horizon to be used',
            maximum: 90,
            minimum: 15,
            title: 'Elevation',
            type: 'integer'
          },
          */
          array_details: {
            array: 'ska_mid',
            subarray: 'aa0.5',
            weather: 3,
            number_15_antennas: 0,
            number_13_antennas: 0,
            number_sub_bands: 0,
            tapering: '50'
          },
          observation_type_details: {
            observation_type: 'zoom',
            bandwidth: {
              value: 0.0,
              unit: 'm/s'
            },
            central_frequency: {
              value: 0.0,
              unit: 'm/s'
            },
            supplied: {
              type: 'sensitivity',
              quantity: {
                value: -12.345,
                unit: 'm/s'
              }
            },
            spectral_resolution: '50',
            effective_resolution: '50',
            image_weighting: 'Uniform'
          },
          details: 'MID + Zoom'
        },
        {
          observation_set_id: 'low-001',
          group_id: '2',
          observing_band: 'low_band',
          array_details: {
            array: 'ska_low',
            subarray: 'aa0.5',
            number_of_stations: 1,
            spectral_averaging: '50'
          },
          observation_type_details: {
            observation_type: 'continuum',
            bandwidth: {
              value: 0.0,
              unit: 'm/s'
            },
            central_frequency: {
              value: 0.0,
              unit: 'm/s'
            },
            supplied: {
              type: 'integration',
              quantity: {
                value: -12.345,
                unit: 'ms'
              }
            },
            spectral_resolution: '50',
            effective_resolution: '50',
            image_weighting: 'Uniform'
          },
          details: 'LOW + Continuum'
        },
        {
          observation_set_id: 'low-002',
          group_id: '2',
          observing_band: 'low_band',
          array_details: {
            array: 'ska_low',
            subarray: 'aa0.5',
            number_of_stations: 1,
            spectral_averaging: '50'
          },
          observation_type_details: {
            observation_type: 'zoom',
            bandwidth: {
              value: 0.0,
              unit: 'm/s'
            },
            central_frequency: {
              value: 0.0,
              unit: 'm/s'
            },
            supplied: {
              type: 'sensitivity',
              quantity: {
                value: -12.345,
                unit: 'm/s'
              }
            },
            spectral_resolution: '50',
            effective_resolution: '50',
            image_weighting: 'Uniform'
          },
          details: 'LOW + Zoom'
        }
      ],
      data_product_sdps: [
        {
          data_product_id: 'SDP-1',
          products: ['1', '2', '5'],
          observation_set_refs: ['mid-001', 'low-001'],
          image_size: 'IMAGE SIZE',
          image_cellsize: 'PIXEL SIZE',
          weighting: 'WEIGHTING'
        }
      ],
      data_product_src_nets: [
        {
          data_products_src_id: '2'
        }
      ],
      results: [
        {
          observation_set_ref: 'low-002',
          target_ref: 'M28',
          result_details: {
            supplied_type: 'sensitivity',
            weighted_continuum_sensitivity: {
              value: 0.0,
              unit: 'm/s'
            },
            weighted_spectral_sensitivity: {
              value: 0.0,
              unit: 'm/s'
            },
            total_continuum_sensitivity: {
              value: 0.0,
              unit: 'm/s'
            },
            total_spectral_sensitivity: {
              value: 0.0,
              unit: 'm/s'
            },
            surface_brightness_sensitivity: {
              continuum: 0.0,
              spectral: 0.0,
              unit: 'm/s'
            }
          },
          continuum_confusion_noise: {
            value: 0.0,
            unit: 'm/s'
          },
          synthesized_beam_size: {
            value: 190.17, // this should be a string such as "190.0 x 171.3" -> currently rejected by backend
            unit: 'arcsec2'
          },
          spectral_confusion_noise: {
            value: 0.0,
            unit: 'm/s'
          }
        }
      ]
    }
  },
  {
    prsl_id: 'prp-ska01-202204-01',
    status: 'submitted',
    submitted_on: '2022-09-23T15:43:53.971548Z',
    submitted_by: 'TestUser',
    investigator_refs: ['prp-ska01-202204-01'],
    metadata: {
      version: 1,
      created_by: 'TestUser',
      created_on: '2022-09-23T15:43:53.971548Z',
      last_modified_by: 'TestUser',
      last_modified_on: '2022-09-23T15:43:53.971548Z',
      pdm_version: '1.0.0'
    },
    cycle: 'SKA_5000_2023',
    proposal_info: {
      title: 'The Milky Way View',
      proposal_type: {
        main_type: 'standard_proposal',
        attributes: ['coordinated_proposal']
      },
      abstract:
        'Pretty Looking frontend depends on hard work put into good wire-framing and requirement gathering',
      science_category: 'Science Category',
      investigators: [
        {
          user_id: 'prp-ska01-202204-01',
          given_name: 'Tony',
          family_name: 'Bennet',
          email: 'somewhere.vague@example.com',
          organization: '',
          for_phd: false,
          principal_investigator: true
        }
      ]
    },
    observation_info: {
      targets: [
        {
          target_id: 'M28',
          pointing_pattern: {
            active: 'SinglePointParameters',
            parameters: [
              {
                kind: 'SinglePointParameters',
                offset_x_arcsec: 0.0,
                offset_y_arcsec: 0.0
              }
            ]
          },
          reference_coordinate: {
            kind: 'equatorial',
            ra: 250.0,
            dec: 30.0,
            unit: ['deg', 'deg'],
            reference_frame: 'icrs'
          },
          radial_velocity: {
            quantity: {
              value: -12.345,
              unit: 'm/s'
            },
            definition: 'OPTICAL',
            reference_frame: 'LSRK',
            redshift: 1.2
          }
        },
        {
          target_id: 'M1',
          pointing_pattern: {
            active: 'SinglePointParameters',
            parameters: [
              {
                kind: 'SinglePointParameters',
                offset_x_arcsec: 0.0,
                offset_y_arcsec: 0.0
              }
            ]
          },
          reference_coordinate: {
            kind: 'equatorial',
            ra: 250.0,
            dec: -30.0,
            unit: ['deg', 'deg'],
            reference_frame: 'icrs'
          },
          radial_velocity: {
            quantity: {
              value: 0.0,
              unit: 'km/s'
            },
            definition: 'RADIO',
            reference_frame: 'LSRK',
            redshift: 0.0
          }
        }
      ],
      documents: [
        {
          document_id: 'doc_ref_01',
          link: 'https://freetestdata.com/wp-content/uploads/2021/09/Free_Test_Data_100KB_PDF.pdf',
          type: 'proposal_science'
        },
        {
          document_id: 'doc_ref_02',
          link: 'https://freetestdata.com/wp-content/uploads/2021/09/Free_Test_Data_100KB_PDF.pdf',
          type: 'proposal_technical'
        }
      ],
      observation_sets: [
        {
          observation_set_id: 'mid-001',
          group_id: '2',
          observing_band: 'mid_band_1',
          elevation: 15,
          // TODO: use this once latest PDM changes merged
          /*
          elevation: {
            default: 15,
            description: 'Elevation from the horizon to be used',
            maximum: 90,
            minimum: 15,
            title: 'Elevation',
            type: 'integer'
          },
          */
          array_details: {
            array: 'ska_mid',
            subarray: 'aa0.5',
            weather: 3,
            number_15_antennas: 0,
            number_13_antennas: 0,
            number_sub_bands: 0,
            tapering: '50'
          },
          observation_type_details: {
            observation_type: 'continuum',
            bandwidth: {
              value: 0.0,
              unit: 'm/s'
            },
            central_frequency: {
              value: 0.0,
              unit: 'm/s'
            },
            supplied: {
              type: 'integration',
              quantity: {
                value: -12.345,
                unit: 'ms'
              }
            },
            spectral_resolution: '50',
            effective_resolution: '50',
            image_weighting: 'Uniform'
          },
          details: 'MID + Continuum'
        },
        {
          observation_set_id: 'mid-002',
          group_id: '2',
          observing_band: 'mid_band_1',
          elevation: 15,
          // TODO: use this once latest PDM changes merged
          /*
          elevation: {
            default: 15,
            description: 'Elevation from the horizon to be used',
            maximum: 90,
            minimum: 15,
            title: 'Elevation',
            type: 'integer'
          },
          */
          array_details: {
            array: 'ska_mid',
            subarray: 'aa0.5',
            weather: 3,
            number_15_antennas: 0,
            number_13_antennas: 0,
            number_sub_bands: 0,
            tapering: '50'
          },
          observation_type_details: {
            observation_type: 'zoom',
            bandwidth: {
              value: 0.0,
              unit: 'm/s'
            },
            central_frequency: {
              value: 0.0,
              unit: 'm/s'
            },
            supplied: {
              type: 'sensitivity',
              quantity: {
                value: -12.345,
                unit: 'm/s'
              }
            },
            spectral_resolution: '50',
            effective_resolution: '50',
            image_weighting: 'Uniform'
          },
          details: 'MID + Zoom'
        },
        {
          observation_set_id: 'low-001',
          group_id: '2',
          observing_band: 'low_band',
          array_details: {
            array: 'ska_low',
            subarray: 'aa0.5',
            number_of_stations: 1,
            spectral_averaging: '50'
          },
          observation_type_details: {
            observation_type: 'continuum',
            bandwidth: {
              value: 0.0,
              unit: 'm/s'
            },
            central_frequency: {
              value: 0.0,
              unit: 'm/s'
            },
            supplied: {
              type: 'integration',
              quantity: {
                value: -12.345,
                unit: 'ms'
              }
            },
            spectral_resolution: '50',
            effective_resolution: '50',
            image_weighting: 'Uniform'
          },
          details: 'LOW + Continuum'
        },
        {
          observation_set_id: 'low-002',
          group_id: '2',
          observing_band: 'low_band',
          array_details: {
            array: 'ska_low',
            subarray: 'aa0.5',
            number_of_stations: 1,
            spectral_averaging: '50'
          },
          observation_type_details: {
            observation_type: 'zoom',
            bandwidth: {
              value: 0.0,
              unit: 'm/s'
            },
            central_frequency: {
              value: 0.0,
              unit: 'm/s'
            },
            supplied: {
              type: 'sensitivity',
              quantity: {
                value: -12.345,
                unit: 'm/s'
              }
            },
            spectral_resolution: '50',
            effective_resolution: '50',
            image_weighting: 'Uniform'
          },
          details: 'LOW + Zoom'
        }
      ],
      data_product_sdps: [
        {
          data_product_id: 'SDP-1',
          products: ['1', '2', '5'],
          observation_set_refs: ['mid-001', 'low-001'],
          image_size: '50',
          image_cellsize: '50',
          weighting: '50'
        }
      ],
      data_product_src_nets: [
        {
          data_products_src_id: '2'
        }
      ],
      results: [
        {
          observation_set_ref: 'low-002',
          target_ref: 'M28',
          result_details: {
            supplied_type: 'sensitivity',
            weighted_continuum_sensitivity: {
              value: 0.0,
              unit: 'm/s'
            },
            weighted_spectral_sensitivity: {
              value: 0.0,
              unit: 'm/s'
            },
            total_continuum_sensitivity: {
              value: 0.0,
              unit: 'm/s'
            },
            total_spectral_sensitivity: {
              value: 0.0,
              unit: 'm/s'
            },
            surface_brightness_sensitivity: {
              continuum: 0.0,
              spectral: 0.0,
              unit: 'm/s'
            }
          },
          continuum_confusion_noise: {
            value: 0.0,
            unit: 'm/s'
          },
          synthesized_beam_size: {
            value: 190.17, // this should be a string such as "190.0 x 171.3" -> currently rejected by backend
            unit: 'arcsec2'
          },
          spectral_confusion_noise: {
            value: 0.0,
            unit: 'm/s'
          }
        }
      ]
    }
  },
  {
    prsl_id: 'prsl-t0001-20250814-00002',
    status: 'submitted',
    submitted_on: '2022-09-23T15:43:53.971548Z',
    submitted_by: 'TestUser',
    investigator_refs: ['prp-ska01-202204-01'],
    metadata: {
      version: 1,
      created_by: 'TestUser',
      created_on: '2022-09-23T15:43:53.971548Z',
      last_modified_by: 'TestUser',
      last_modified_on: '2022-09-23T15:43:53.971548Z',
      pdm_version: '1.0.0'
    },
    cycle: 'SKA_5000_2023',
    proposal_info: {
      title: 'Incomplete Proposal',
      proposal_type: {
        main_type: 'standard_proposal'
        // attributes: []
      },
      abstract:
        'Pretty Looking frontend depends on hard work put into good wire-framing and requirement gathering',
      science_category: 'Extragalactic continuum',
      investigators: [
        {
          user_id: 'prp-ska01-202204-01',
          given_name: 'Tony',
          family_name: 'Bennet',
          email: 'somewhere.vague@example.com',
          organization: '',
          for_phd: false,
          principal_investigator: true
        }
      ]
    },
    observation_info: {
      targets: [
        {
          target_id: 'M28',
          pointing_pattern: {
            active: 'SinglePointParameters',
            parameters: [
              {
                kind: 'SinglePointParameters',
                offset_x_arcsec: 0.0,
                offset_y_arcsec: 0.0
              }
            ]
          },
          reference_coordinate: {
            kind: 'equatorial',
            ra: 250.0,
            dec: 30.0,
            unit: ['deg', 'deg'],
            reference_frame: 'icrs'
          },
          radial_velocity: {
            quantity: {
              value: -12.345,
              unit: 'm/s'
            },
            definition: 'OPTICAL',
            reference_frame: 'LSRK',
            redshift: 1.2
          }
        },
        {
          target_id: 'M1',
          pointing_pattern: {
            active: 'SinglePointParameters',
            parameters: [
              {
                kind: 'SinglePointParameters',
                offset_x_arcsec: 0.0,
                offset_y_arcsec: 0.0
              }
            ]
          },
          reference_coordinate: {
            kind: 'equatorial',
            ra: 250.0,
            dec: -30.0,
            unit: ['deg', 'deg'],
            reference_frame: 'icrs'
          },
          radial_velocity: {
            quantity: {
              value: 0.0,
              unit: 'km/s'
            },
            definition: 'RADIO',
            reference_frame: 'LSRK',
            redshift: 0.0
          }
        }
      ],
      documents: [
        {
          document_id: 'doc_ref_01',
          link: 'https://freetestdata.com/wp-content/uploads/2021/09/Free_Test_Data_100KB_PDF.pdf',
          type: 'proposal_science'
        },
        {
          document_id: 'doc_ref_02',
          link: 'https://freetestdata.com/wp-content/uploads/2021/09/Free_Test_Data_100KB_PDF.pdf',
          type: 'proposal_technical'
        }
      ],
      observation_sets: [
        {
          observation_set_id: 'mid-001',
          group_id: '2',
          observing_band: 'mid_band_1',
          elevation: 15,
          // TODO: use this once latest PDM changes merged
          /*
          elevation: {
            default: 15,
            description: 'Elevation from the horizon to be used',
            maximum: 90,
            minimum: 15,
            title: 'Elevation',
            type: 'integer'
          },
          */
          array_details: {
            array: 'ska_mid',
            subarray: 'aa0.5',
            weather: 3,
            number_15_antennas: 0,
            number_13_antennas: 0,
            number_sub_bands: 0,
            tapering: '50'
          },
          observation_type_details: {
            observation_type: 'continuum',
            bandwidth: {
              value: 0.0,
              unit: 'm/s'
            },
            central_frequency: {
              value: 0.0,
              unit: 'm/s'
            },
            supplied: {
              type: 'integration',
              quantity: {
                value: -12.345,
                unit: 'ms'
              }
            },
            spectral_resolution: '50',
            effective_resolution: '50',
            image_weighting: 'Uniform'
          },
          details: 'MID + Continuum'
        },
        {
          observation_set_id: 'mid-002',
          group_id: '2',
          observing_band: 'mid_band_1',
          elevation: 15,
          // TODO: use this once latest PDM changes merged
          /*
          elevation: {
            default: 15,
            description: 'Elevation from the horizon to be used',
            maximum: 90,
            minimum: 15,
            title: 'Elevation',
            type: 'integer'
          },
          */
          array_details: {
            array: 'ska_mid',
            subarray: 'aa0.5',
            weather: 3,
            number_15_antennas: 0,
            number_13_antennas: 0,
            number_sub_bands: 0,
            tapering: '50'
          },
          observation_type_details: {
            observation_type: 'zoom',
            bandwidth: {
              value: 0.0,
              unit: 'm/s'
            },
            central_frequency: {
              value: 0.0,
              unit: 'm/s'
            },
            supplied: {
              type: 'sensitivity',
              quantity: {
                value: -12.345,
                unit: 'm/s'
              }
            },
            spectral_resolution: '50',
            effective_resolution: '50',
            image_weighting: 'Uniform'
          },
          details: 'MID + Zoom'
        },
        {
          observation_set_id: 'low-001',
          group_id: '2',
          observing_band: 'low_band',
          array_details: {
            array: 'ska_low',
            subarray: 'aa0.5',
            number_of_stations: 1,
            spectral_averaging: '50'
          },
          observation_type_details: {
            observation_type: 'continuum',
            bandwidth: {
              value: 0.0,
              unit: 'm/s'
            },
            central_frequency: {
              value: 0.0,
              unit: 'm/s'
            },
            supplied: {
              type: 'integration',
              quantity: {
                value: -12.345,
                unit: 'ms'
              }
            },
            spectral_resolution: '50',
            effective_resolution: '50',
            image_weighting: 'Uniform'
          },
          details: 'LOW + Continuum'
        },
        {
          observation_set_id: 'low-002',
          group_id: '2',
          observing_band: 'low_band',
          array_details: {
            array: 'ska_low',
            subarray: 'aa0.5',
            number_of_stations: 1,
            spectral_averaging: '50'
          },
          observation_type_details: {
            observation_type: 'zoom',
            bandwidth: {
              value: 0.0,
              unit: 'm/s'
            },
            central_frequency: {
              value: 0.0,
              unit: 'm/s'
            },
            supplied: {
              type: 'sensitivity',
              quantity: {
                value: -12.345,
                unit: 'm/s'
              }
            },
            spectral_resolution: '50',
            effective_resolution: '50',
            image_weighting: 'Uniform'
          },
          details: 'LOW + Zoom'
        }
      ],
      data_product_sdps: [
        {
          data_product_id: 'SDP-1',
          products: ['1', '2', '5'],
          observation_set_refs: ['mid-001', 'low-001'],
          image_size: '50',
          image_cellsize: '50',
          weighting: '50'
        }
      ],
      data_product_src_nets: [
        {
          data_products_src_id: '2'
        }
      ],
      results: [
        {
          observation_set_ref: 'low-002',
          target_ref: 'M28',
          result_details: {
            supplied_type: 'sensitivity',
            weighted_continuum_sensitivity: {
              value: 0.0,
              unit: 'm/s'
            },
            weighted_spectral_sensitivity: {
              value: 0.0,
              unit: 'm/s'
            },
            total_continuum_sensitivity: {
              value: 0.0,
              unit: 'm/s'
            },
            total_spectral_sensitivity: {
              value: 0.0,
              unit: 'm/s'
            },
            surface_brightness_sensitivity: {
              continuum: 0.0,
              spectral: 0.0,
              unit: 'm/s'
            }
          },
          continuum_confusion_noise: {
            value: 0.0,
            unit: 'm/s'
          },
          synthesized_beam_size: {
            value: 190.17, // this should be a string such as "190.0 x 171.3" -> currently rejected by backend
            unit: 'arcsec2'
          },
          spectral_confusion_noise: {
            value: 0.0,
            unit: 'm/s'
          }
        }
      ]
    }
  }
];

export default MockProposalBackendList;
