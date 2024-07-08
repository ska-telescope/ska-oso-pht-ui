import { Proposal, ProposalBackend } from 'utils/types/proposal';
import {
  TEXT_ENTRY_PARAMS,
  Projects,
  GENERAL,
  OBSERVATION,
  DEFAULT_PI,
  OBSERVATION_TYPE_BACKEND
} from './constants';

// TODO : Ensure that we remove all hard-coded values

export const generateId = (prefix: string, length: number) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return prefix + result;
};

export const countWords = (text: string) => {
  return !text
    ? 0
    : text
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
};

export const helpers = {
  validate: {
    validateTextEntry(
      text: string,
      setText: Function,
      setErrorText: Function,
      textType?: string
    ): boolean {
      // eslint-disable-next-line react-hooks/rules-of-hooks

      textType = textType ?? 'DEFAULT';
      const textEntryParams = TEXT_ENTRY_PARAMS[textType];
      if (!textEntryParams) {
        // handle invalid textType (no match in TEXT_ENTRY_PARAMS)
        throw new Error(`Invalid text type: ${textType}`);
      }
      const { ERROR_TEXT, PATTERN } = textEntryParams;
      if (PATTERN.test(text)) {
        setText(text);
        setErrorText('');
        return true;
      }
      setErrorText(ERROR_TEXT);
      return false;
    }
  },

  transform: {
    // trim undefined and empty properties of an object
    trimObject(obj) {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (value === undefined || value === '' || value === null) {
          if (key === 'submitted_by' || key === 'submitted_on' || key === 'abstract') return; //TODO: review null values in data model
          delete obj[key];
        } else if (typeof value === 'object') {
          this.trimObject(value);
        }
      });
    },

    /* convert proposal to backend format to send with PUT/PROPOSAL (save button) and PUT/PROPOSAL/ (submit button) */
    // TODO: move this into the PUT proposal service (and POST?)
    // TODO: handle saving PDF filename as document_id and link
    // "documents" : [
    //   {"document_id" : "prsl-12334-science",         "link": 'download pdf'}

    //   ,

    //   {"document_id" : "prsl-12334-technical",          "link": 'download pdf'     }

    //   ]
    /*
    CREATE = proposal with no observations, etc.
    SAVE = proposal with or without observations, etc. STATUS: draft
    SUBMIT = STATUS: submitted
    */
    convertProposalToBackendFormat(proposal: Proposal, status: string) {
      // TODO: move to axios service + map to new backend format
      const project = Projects.find(p => p.id === proposal.category);
      // TODO : We need to update so that 0 - n entries are added.
      const subProject = project?.subProjects.find(sp => sp.id === proposal.subCategory[0]);

      // TODO: add groupObservations to send to backend

      const targetObservationsByObservation = proposal.targetObservation?.reduce((acc, to) => {
        if (!acc[to.observationId]) {
          acc[to.observationId] = [];
        }
        acc[to.observationId].push(to.targetId.toString());
        return acc;
      }, {});

      const scienceProgrammes = proposal.observations?.map(observation => {
        const targetIds = targetObservationsByObservation[observation.id] || [];
        const targets = proposal?.targets?.filter(target =>
          targetIds.includes(target.id.toString())
        );
        const array = OBSERVATION.array.find(p => p.value === observation.telescope);
        return {
          array: array?.label,
          subarray: array?.subarray?.find(sa => sa.value === observation.subarray)?.label,
          linked_sources: targets?.map(target => target.name),
          observation_type: OBSERVATION_TYPE_BACKEND[observation.type]
        };
      });

      console.log('Proposal front end', proposal);
      console.log('Status', status);
      console.log('cycle', GENERAL.Cycle);

      const transformedProposal: ProposalBackend = {
        /*
        prsl_id: proposal?.id?.toString(),
        status,
        cycle: GENERAL.Cycle,
        submitted_by:
          status === 'Submitted' ? `${DEFAULT_PI.firstName} ${DEFAULT_PI.lastName}` : '',
        submitted_on: status === 'Submitted' ? new Date().toISOString() : '',
        info: {
          title: proposal?.title,
          abstract: proposal?.abstract,
          proposal_type: {
            // main_type: project?.title,
            // sub_type: [subProject?.title]
            main_type: 'standard_proposal',
            sub_type: ['coordinated_proposal']
          },
          science_category: GENERAL.ScienceCategory?.find(
            category => category.value === proposal?.category
          )?.label,
          */

          prsl_id: 'prp-ska01-202204-01',
          status: status,
          submitted_on: '',
          submitted_by: '',
          investigator_refs: ['prp-ska01-202204-01'],
          metadata: {
            version: 1,
            created_by: `${DEFAULT_PI.firstName} ${DEFAULT_PI.lastName}`,
            created_on: new Date().toDateString(),
            last_modified_by: '',
            last_modified_on: ''
          },
          cycle: GENERAL.Cycle,
          info: {
            title: proposal.title,
            proposal_type: {
              main_type: 'standard_proposal', // TODO change to Standard Proposal once backend can accept it?
              sub_type: ['coordinated_proposal'] // TODO change to Coordinated Proposal once backend can accept it?
            },
            abstract: '',
            science_category: '',
            targets: [],
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
            investigators: [
              {
                investigator_id: 'prp-ska01-202204-01',
                given_name: DEFAULT_PI.firstName,
                family_name: DEFAULT_PI.lastName,
                email: DEFAULT_PI.email,
                organization: DEFAULT_PI.affiliation,
                for_phd: DEFAULT_PI.phdThesis,
                principal_investigator: DEFAULT_PI.pi
              }
            ],
            observation_sets: [
              {
                observation_set_id: 'mid-001',
                group_id: '2',
                observing_band: 'mid_band_1',
                array_details: {
                  array: 'ska_mid',
                  subarray: 'aa0.5',
                  weather: 3,
                  number_15_antennas: 0,
                  number_13_antennas: 0,
                  number_sub_bands: 0,
                  elevation: 15,
                  tapering: 'DUMMY'
                },
                observation_type_details: {
                  observation_type: 'continuum',
                  bandwidth: {
                    value: 0.0,
                    unit: 'm / s'
                  },
                  central_frequency: {
                    value: 0.0,
                    unit: 'm / s'
                  },
                  supplied: {
                    type: 'integration',
                    value: 0.0,
                    unit: 'm / s',
                    quantity: {
                      value: -12.345,
                      unit: 'm / s'
                    }
                  },
                  spectral_resolution: 'DUMMY',
                  effective_resolution: 'DUMMY',
                  mage_weighting: 'DUMMY'
                },
                details: 'MID + Continuum'
              },
              {
                observation_set_id: 'mid-002',
                group_id: '2',
                observing_band: 'mid_band_1',
                array_details: {
                  array: 'ska_mid',
                  subarray: 'aa0.5',
                  weather: 3,
                  number_15_antennas: 0,
                  number_13_antennas: 0,
                  number_sub_bands: 0,
                  elevation: 15,
                  tapering: 'DUMMY'
                },
                observation_type_details: {
                  observation_type: 'zoom',
                  bandwidth: {
                    value: 0.0,
                    unit: 'm / s'
                  },
                  central_frequency: {
                    value: 0.0,
                    unit: 'm / s'
                  },
                  supplied: {
                    type: 'sensitivity',
                    value: 0.0,
                    unit: 'm / s',
                    quantity: {
                      value: -12.345,
                      unit: 'm / s'
                    }
                  },
                  spectral_resolution: 'DUMMY',
                  effective_resolution: 'DUMMY',
                  image_weighting: 'DUMMY'
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
                  spectral_averaging: 'DUMMY'
                },
                observation_type_details: {
                  observation_type: 'continuum',
                  bandwidth: {
                    value: 0.0,
                    unit: 'm / s'
                  },
                  central_frequency: {
                    value: 0.0,
                    unit: 'm / s'
                  },
                  supplied: {
                    type: 'integration',
                    value: 0.0,
                    unit: 'm / s',
                    quantity: {
                      value: -12.345,
                      unit: 'm / s'
                    }
                  },
                  spectral_resolution: 'DUMMY',
                  effective_resolution: 'DUMMY',
                  image_weighting: 'DUMMY'
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
                  spectral_averaging: 'DUMMY'
                },
                observation_type_details: {
                  observation_type: 'zoom',
                  bandwidth: {
                    value: 0.0,
                    unit: 'm / s'
                  },
                  central_frequency: {
                    value: 0.0,
                    unit: 'm / s'
                  },
                  supplied: {
                    type: 'sensitivity',
                    value: 0.0,
                    unit: 'm / s',
                    quantity: {
                      value: -12.345,
                      unit: 'm / s'
                    }
                  },
                  spectral_resolution: 'DUMMY',
                  effective_resolution: 'DUMMY',
                  image_weighting: 'DUMMY'
                },
                details: 'LOW + Zoom'
              }
            ],
            data_product_sdps: [
              {
                data_products_sdp_id: 'SDP-1',
                options: ['1', '2', '5'],
                observation_set_refs: ['mid-001', 'low-001'],
                image_size: 'IMAGE SIZE',
                pixel_size: 'PIXEL SIZE',
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
                target_ref: '1',
                result_details: {
                  supplied_type: 'sensitivity',
                  weighted_continuum_sensitivity: {
                    value: 0.0,
                    unit: 'm / s'
                  },
                  weighted_spectral_sensitivity: {
                    value: 0.0,
                    unit: 'm / s'
                  },
                  total_continuum_sensitivity: {
                    value: 0.0,
                    unit: 'm / s'
                  },
                  total_spectral_sensitivity: {
                    value: 0.0,
                    unit: 'm / s'
                  },
                  surface_brightness_sensitivity: {
                    continuum: 0.0,
                    spectral: 0.0,
                    unit: 'm / s'
                  }
                },
                continuum_confusion_noise: {
                  value: 0.0,
                  unit: 'm / s'
                },
                synthesized_beam_size: {
                  value: 0.0,
                  unit: 'm / s'
                },
                spectral_confusion_noise: {
                  value: 0.0,
                  unit: 'm / s'
                }
              }
            ]

          /*
          targets: proposal?.targets?.map(target => ({
            name: target?.name,
            right_ascension: target?.ra,
            declination: target?.dec,
            velocity: parseFloat(target?.vel),
            velocity_unit: '', // TODO: confirm what units should be expected
            right_ascension_unit: '', // TODO: confirm what units should be expected
            declination_unit: '' // TODO: confirm what units should be expected
          })),
          */
         /*
          investigators: proposal.team?.map(teamMember => ({
            investigators: [
              { 
                investigator_id: teamMember.id?.toString(),
                first_name: teamMember?.firstName,
                last_name: teamMember?.lastName,
                email: teamMember?.email,
                country: teamMember?.country,
                organization: teamMember?.affiliation,
                for_phd: teamMember?.phdThesis,
                principal_investigator: teamMember?.pi
              }
            ],
          })),
          science_programmes: scienceProgrammes
          */
        }
      };

      // trim undefined properties
      this.trimObject(transformedProposal);

      return transformedProposal;
    }
  }
};
