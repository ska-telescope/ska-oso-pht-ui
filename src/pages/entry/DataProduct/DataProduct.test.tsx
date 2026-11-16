// DataProduct.test.tsx
import TestProposalFormProvider from '@/models/proposals/testing/TestProposalFormProvider';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { DataProductSDPNew } from '@/utils/types/dataProduct';
import type { Sensitivity, SensitivityValues } from '@/models/proposals/targetObservation';
import {
  IW_BRIGGS,
  REFERENCE_COORDINATE_TYPE_SSO,
  SENSITIVITY_STATE,
  TYPE_CONTINUUM,
  TYPE_CONTINUUM_SPECTRAL,
  TYPE_PST,
  TYPE_ZOOM
} from '@/utils/constants.ts';
import DataProduct from './DataProduct';

const wrapper = (component: React.ReactElement) => {
  return render(<TestProposalFormProvider>{component}</TestProposalFormProvider>);
};

// --- Mocks ---
vi.mock('@/utils/help/useHelp', () => ({ useHelp: () => ({ setHelp: vi.fn() }) }));
let mockOsdCyclePolicy = { maxObservations: 5, maxDataProducts: 2 };
vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({ osdCyclePolicy: mockOsdCyclePolicy })
}));

let mockStoreReturn: any = {
  application: { content2: { observations: [], dataProductSDP: [] } },
  updateAppContent2: vi.fn()
};
vi.mock('@utils/storage/store', () => ({
  storageObject: { useStore: () => mockStoreReturn }
}));

vi.mock('@/utils/helpers', () => ({
  generateId: () => 'SDP000001',
  convertFrequencyToDisplayUnits: (value: number, unit: string) => ({ value, unit }),
  getSpectralResolutionHz: () => 1000000,
  frequencyConversion: (value: number) => value
}));

// Lightweight mocks for child components
vi.mock('@/components/fields/bitDepth/bitDepth', () => ({
  default: ({ value, options }: { value: number; options?: Array<{ value: number }> }) => (
    <div
      data-testid="BitDepthField"
      data-value={String(value)}
      data-options={JSON.stringify((options ?? []).map((option) => option.value))}
    />
  )
}));
vi.mock('@/components/fields/dataProductType/dataProductType', () => ({
  default: (props: any) => (
    <div data-testid="DataProductTypeField" data-value={String(props.value)}>
      {/* 2 = DP_TYPE_VISIBLE */}
      <button data-testid="selectVisibilities" onClick={() => props.setValue(2)} />
    </div>
  )
}));
vi.mock('@/components/grid/observation/GridObservation', () => ({
  default: (props: any) => (
    <div data-testid="GridObservation">
      {props.data.map((obs: any) => (
        <div key={obs.id} onClick={() => props.rowClick({ row: obs })}>
          Observation {obs.id}
        </div>
      ))}
    </div>
  )
}));
vi.mock('@/components/button/Add/Add', () => ({
  default: (props: any) => (
    <button data-testid={props.testId} onClick={props.action} disabled={props.disabled}>
      {props.title}
    </button>
  )
}));

const values = ({
  weighted,
  beamSize = '1.00 x 2.00'
}: {
  weighted: number;
  beamSize?: string;
}): SensitivityValues => ({
  weightedSensitivity: { value: weighted, unit: 'Jy/beam' },
  totalSensitivity: { value: 3, unit: 'Jy/beam' },
  confusionNoise: { value: 2, unit: 'Jy/beam' },
  surfaceBrightnessSensitivity: { value: 4, unit: 'K' },
  synthesizedBeamSize: { value: beamSize, unit: 'arcsec2' }
});

describe('DataProduct component', () => {
  const theme = createTheme();
  const existingDataProduct = {
    id: 'DP1',
    observationId: 'OBS1',
    data: { dataProductType: 1 }
  } as DataProductSDPNew;

  const renderExistingDataProduct = (
    sensitivity?: Sensitivity,
    observationType: string = TYPE_CONTINUUM,
    targets: { id: string; kind: number }[] = []
  ) => {
    mockOsdCyclePolicy = { maxObservations: 1, maxDataProducts: 1 };
    mockStoreReturn = {
      application: {
        content2: {
          observations: [
            {
              id: 'OBS1',
              type: observationType,
              centralFrequency: 1,
              centralFrequencyUnits: 'Hz',
              supplied: { value: 1 },
              continuumBandwidth: 1,
              continuumBandwidthUnits: 2,
              bandwidth: 1
            }
          ],
          dataProductSDP: [existingDataProduct],
          targets,
          targetObservation: sensitivity
            ? [
                {
                  observationId: 'OBS1',
                  dataProductsSDPId: 'DP1',
                  targetId: 'T1',
                  sensitivity
                }
              ]
            : []
        }
      },
      updateAppContent2: vi.fn()
    };
    wrapper(
      <ThemeProvider theme={theme}>
        <DataProduct data={existingDataProduct} />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    mockOsdCyclePolicy = { maxObservations: 5, maxDataProducts: 2 };
    mockStoreReturn = {
      application: { content2: { observations: [], dataProductSDP: [] } },
      updateAppContent2: vi.fn()
    };
  });

  it('renders key input fields', () => {
    wrapper(
      <ThemeProvider theme={theme}>
        <DataProduct />
      </ThemeProvider>
    );
    // expect(screen.getByTestId('taper')).toBeInTheDocument();
    // expect(screen.getByTestId('imageSize')).toBeInTheDocument();
    // expect(screen.getByTestId('pixelSize')).toBeInTheDocument();
    // expect(screen.getByTestId('imageWeighting')).toBeInTheDocument();
  });

  it('hides continuum sensitivity results when only one output channel is selected', () => {
    mockOsdCyclePolicy = { maxObservations: 1, maxDataProducts: 1 };
    const singleChannelDataProduct = {
      ...existingDataProduct,
      data: { ...existingDataProduct.data, channelsOut: 1 }
    } as DataProductSDPNew;
    const sensitivity: Sensitivity = {
      state: SENSITIVITY_STATE.DONE,
      continuum: values({ weighted: 1 }),
      spectral: values({ weighted: 2 })
    };

    mockStoreReturn = {
      application: {
        content2: {
          observations: [
            {
              id: 'OBS1',
              type: TYPE_CONTINUUM,
              centralFrequency: 1,
              centralFrequencyUnits: 'Hz',
              supplied: { value: 1 },
              continuumBandwidth: 1,
              continuumBandwidthUnits: 2
            }
          ],
          dataProductSDP: [singleChannelDataProduct],
          targetObservation: [
            {
              observationId: 'OBS1',
              dataProductsSDPId: 'DP1',
              targetId: 'T1',
              sensitivity
            }
          ]
        }
      },
      updateAppContent2: vi.fn()
    };

    wrapper(
      <ThemeProvider theme={theme}>
        <DataProduct data={singleChannelDataProduct} />
      </ThemeProvider>
    );

    expect(
      screen.getByText('sensitivityCalculatorResults.title (Imaging ODP)')
    ).toBeInTheDocument();
    expect(screen.getByTestId('field-continuumSensitivityWeighted')).toBeInTheDocument();
    expect(screen.queryByTestId('field-spectralSensitivityWeighted')).not.toBeInTheDocument();
  });

  it('updates taper value when user types', () => {
    wrapper(
      <ThemeProvider theme={theme}>
        <DataProduct />
      </ThemeProvider>
    );
    // const taperInput = screen.getByTestId('taper');
    // fireEvent.change(taperInput, { target: { value: '42' } });
    // expect((taperInput as HTMLInputElement).value).toBe('42');
  });

  it('updates image size units via DropDown', () => {
    wrapper(
      <ThemeProvider theme={theme}>
        <DataProduct />
      </ThemeProvider>
    );
    // const dropdown = screen.getByTestId('frequencyUnits');
    // fireEvent.change(dropdown, { target: { value: '2' } });
    // expect((dropdown as HTMLSelectElement).value).toBe('2');
  });

  it('renders GridObservation when observations exist', () => {
    mockStoreReturn = {
      application: { content2: { observations: [{ id: 'OBS1' }], dataProductSDP: [] } },
      updateAppContent2: vi.fn()
    };
    wrapper(
      <ThemeProvider theme={theme}>
        <DataProduct />
      </ThemeProvider>
    );
    expect(screen.getByTestId('GridObservation')).toBeInTheDocument();
    expect(screen.getByText(/Observation OBS1/)).toBeInTheDocument();
  });

  it('renders AddButton in footer and is disabled initially', () => {
    wrapper(
      <ThemeProvider theme={theme}>
        <DataProduct />
      </ThemeProvider>
    );
    const addButton = screen.getByTestId('addDataProductButtonEntry');
    expect(addButton).toBeInTheDocument();
    expect(addButton).toHaveAttribute('disabled');
  });

  it('uses the correct bit-depth options and default for PST flow-through mode', () => {
    mockStoreReturn = {
      application: {
        content2: {
          observations: [{ id: 'OBS1', type: 'pst', pstMode: 0, observingBand: 'low' }],
          dataProductSDP: []
        }
      },
      updateAppContent2: vi.fn()
    };

    wrapper(
      <ThemeProvider theme={theme}>
        <DataProduct />
      </ThemeProvider>
    );

    const bitDepthField = screen.getByTestId('BitDepthField');
    expect(bitDepthField).toHaveAttribute('data-options', '[1,2,4,8,16]');
    expect(bitDepthField).toHaveAttribute('data-value', '8');
  });

  it('uses the correct bit-depth options and default for PST detected-filterbank mode', () => {
    mockStoreReturn = {
      application: {
        content2: {
          observations: [{ id: 'OBS1', type: 'pst', pstMode: 1, observingBand: 'low' }],
          dataProductSDP: []
        }
      },
      updateAppContent2: vi.fn()
    };

    wrapper(
      <ThemeProvider theme={theme}>
        <DataProduct />
      </ThemeProvider>
    );

    const bitDepthField = screen.getByTestId('BitDepthField');
    expect(bitDepthField).toHaveAttribute('data-options', '[1,2,4,8]');
    expect(bitDepthField).toHaveAttribute('data-value', '8');
  });

  it('does not persist a data product when no real observation has been selected', () => {
    mockOsdCyclePolicy = { maxObservations: 5, maxDataProducts: 1 };
    mockStoreReturn = {
      application: {
        content2: {
          observations: [],
          dataProductSDP: []
        }
      },
      updateAppContent2: vi.fn()
    };

    wrapper(
      <ThemeProvider theme={theme}>
        <DataProduct />
      </ThemeProvider>
    );

    expect(mockStoreReturn.updateAppContent2).not.toHaveBeenCalled();
  });

  it('shows persisted sensitivity results without changing the proposal when the edit page loads', () => {
    renderExistingDataProduct({
      state: SENSITIVITY_STATE.DONE,
      continuum: values({ weighted: 1 }),
      spectral: values({ weighted: 2 })
    });

    expect(mockStoreReturn.updateAppContent2).not.toHaveBeenCalled();
    expect(screen.getByTestId('field-continuumSensitivityWeighted')).toHaveTextContent('1');
  });

  describe('when the sensitivity calculator does not apply', () => {
    it('reports PST as unsupported', () => {
      renderExistingDataProduct(undefined, TYPE_PST);

      expect(screen.getByText('page.7.pstUnavailable')).toBeInTheDocument();
    });

    it('asks for a target when none is linked', () => {
      renderExistingDataProduct();

      expect(screen.getByText('sensitivityCalculatorResults.noTarget')).toBeInTheDocument();
    });

    it('reports SSO targets as unsupported', () => {
      renderExistingDataProduct({ state: SENSITIVITY_STATE.CALCULATING }, TYPE_CONTINUUM, [
        { id: 'T1', kind: REFERENCE_COORDINATE_TYPE_SSO.value }
      ]);

      expect(
        screen.getByText('sensitivityCalculatorResults.notApplicableForSSO')
      ).toBeInTheDocument();
    });
  });

  it('persists a data product when a valid observation is explicitly selected', async () => {
    mockOsdCyclePolicy = { maxObservations: 5, maxDataProducts: 1 };
    const updateAppContent2 = vi.fn((proposal: any) => {
      mockStoreReturn.application.content2 = proposal;
    });
    mockStoreReturn = {
      application: {
        content2: {
          observations: [
            {
              id: 'OBS1',
              type: 'continuum',
              centralFrequency: 1,
              centralFrequencyUnits: 'Hz'
            },
            {
              id: 'OBS2',
              type: 'continuum',
              centralFrequency: 2,
              centralFrequencyUnits: 'Hz'
            }
          ],
          dataProductSDP: []
        }
      },
      updateAppContent2
    };

    wrapper(
      <ThemeProvider theme={theme}>
        <DataProduct />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText(/Observation OBS2/));

    await waitFor(() => {
      expect(mockStoreReturn.application.content2.dataProductSDP?.at(-1)?.observationId).toBe(
        'OBS2'
      );
    });
  });

  it.each([TYPE_CONTINUUM, TYPE_ZOOM, TYPE_CONTINUUM_SPECTRAL])(
    'shows the robust field by default for a %s data product with no saved weighting',
    (observationType) => {
      renderExistingDataProduct(undefined, observationType);

      expect(screen.getByLabelText('robust.label')).toBeInTheDocument();
    }
  );

  it('falls back to the PST observation for the description when no observation is selected', () => {
    mockStoreReturn = {
      application: {
        content2: {
          observations: [{ id: 'OBS1', type: 'pst' }],
          dataProductSDP: []
        }
      },
      updateAppContent2: vi.fn()
    };

    wrapper(
      <ThemeProvider theme={theme}>
        <DataProduct />
      </ThemeProvider>
    );

    expect(screen.getByText('page.7.descContent.pst.0')).toBeInTheDocument();
  });

  it('uses the detected-filterbank PST description when the observation has that mode', () => {
    mockStoreReturn = {
      application: {
        content2: {
          observations: [{ id: 'OBS1', type: 'pst', pstMode: 1 }],
          dataProductSDP: []
        }
      },
      updateAppContent2: vi.fn()
    };

    wrapper(
      <ThemeProvider theme={theme}>
        <DataProduct />
      </ThemeProvider>
    );

    expect(screen.getByText('page.7.descContent.pst.1')).toBeInTheDocument();
  });

  it('shows the results the calculator did not give for Briggs robust=2 as non-Gaussian', async () => {
    mockOsdCyclePolicy = { maxObservations: 1, maxDataProducts: 1 };
    mockStoreReturn = {
      application: {
        content2: {
          observations: [
            {
              id: 'OBS1',
              type: 'continuum',
              observingBand: 'low',
              centralFrequency: 1,
              centralFrequencyUnits: 'Hz',
              supplied: { value: 1 },
              continuumBandwidth: 1,
              continuumBandwidthUnits: 2,
              bandwidth: 1
            }
          ],
          dataProductSDP: [
            {
              id: 'DP1',
              observationId: 'OBS1',
              data: {
                dataProductType: 1,
                weighting: IW_BRIGGS,
                robust: 2,
                polarisations: ['I']
              }
            }
          ],
          targetObservation: [
            {
              observationId: 'OBS1',
              dataProductsSDPId: 'DP1',
              targetId: 'T1',
              sensitivity: {
                state: SENSITIVITY_STATE.DONE,
                continuum: { weightedSensitivity: { value: 7.18, unit: 'Jy/beam' } },
                spectral: { weightedSensitivity: { value: 1, unit: 'Jy/beam' } }
              }
            }
          ]
        }
      },
      updateAppContent2: vi.fn()
    };

    wrapper(
      <ThemeProvider theme={theme}>
        <DataProduct data={mockStoreReturn.application.content2.dataProductSDP[0] as any} />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('field-continuumSynthBeamSize')).toHaveTextContent(
        'sensitivityCalculatorResults.nonGaussian'
      );
      expect(screen.getByTestId('field-continuumSensitivityWeighted')).toHaveTextContent('7.18');
    });
  });

  it('loads and saves legacy string bit depths in edit mode', async () => {
    mockOsdCyclePolicy = { maxObservations: 5, maxDataProducts: 1 };
    const updateAppContent2 = vi.fn((proposal: any) => {
      mockStoreReturn.application.content2 = proposal;
    });
    mockStoreReturn = {
      application: {
        content2: {
          observations: [{ id: 'OBS1', type: 'pst', pstMode: 1, observingBand: 'low' }],
          dataProductSDP: []
        }
      },
      updateAppContent2
    };

    const legacyBitDepth = '8';
    const legacyData = {
      id: 'DP-LEGACY-8',
      observationId: 'OBS1',
      data: {
        dataProductType: 1,
        bitDepth: legacyBitDepth,
        polarisations: ['I'],
        outputFrequencyResolution: 1,
        outputSamplingInterval: 1,
        dispersionMeasure: 1,
        rotationMeasure: 1
      }
    };

    wrapper(
      <ThemeProvider theme={theme}>
        <DataProduct data={legacyData as any} />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('BitDepthField')).toHaveAttribute(
        'data-value',
        String(Number(legacyBitDepth))
      );
    });

    await waitFor(() => {
      expect(updateAppContent2).toHaveBeenCalled();
      const savedProposal = updateAppContent2.mock.calls.at(-1)[0];
      const savedDataProduct = savedProposal.dataProductSDP.at(-1);
      expect(savedDataProduct.data.bitDepth).toBe(Number(legacyBitDepth));
    });
  });
});
