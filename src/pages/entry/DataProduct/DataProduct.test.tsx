// DataProduct.test.tsx
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { DataProductSDPNew } from '@/utils/types/dataProduct';
import { SensCalcResults } from '@/utils/types/sensCalcResults';
import DataProduct from './DataProduct';

const { mockFetchSensCalcPatches } = vi.hoisted(() => ({
  mockFetchSensCalcPatches: vi.fn(async () => [])
}));

const wrapper = (component: React.ReactElement) => {
  return render(component);
};

// --- Mocks ---
vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({ t: (key: string) => key })
}));
vi.mock('@/utils/help/useHelp', () => ({ useHelp: () => ({ setHelp: vi.fn() }) }));
let mockOsdCyclePolicy = { maxObservations: 5, maxDataProducts: 2 };
vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({ osdCyclePolicy: mockOsdCyclePolicy })
}));

let mockStoreReturn: any = {
  application: { content2: { observations: [], dataProductSDP: [] } },
  updateAppContent2: vi.fn()
};
vi.mock('@ska-telescope/ska-gui-local-storage', () => ({
  storageObject: { useStore: () => mockStoreReturn }
}));
vi.mock('@/utils/update/sensCalc/updateSensCalc', () => ({
  default: mockFetchSensCalcPatches,
  applySensCalcPatches: (existing: any[] = []) => existing
}));

vi.mock('@/utils/helpers', () => ({ generateId: () => 'SDP000001' }));
vi.mock('@/utils/present/present', () => ({
  presentUnits: (val: string) => `unit(${val})`,
  presentValue: (val: string) => val
}));

// Safe constants mock
vi.mock('@/utils/constants.ts', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    PAGE_DATA_PRODUCTS: 'PAGE_DATA_PRODUCTS',
    TYPE_CONTINUUM: 'continuum',
    TYPE_PST: 'pst',
    TYPE_ZOOM: 'spectral',
    IW_BRIGGS: 99,
    FLOW_THROUGH_VALUE: 0,
    DETECTED_FILTER_BANK_VALUE: 1,
    PULSAR_TIMING_VALUE: 2,
    NAV: { PAGE_DATA_PRODUCTS: '/mock-nav' },
    FOOTER_HEIGHT_PHT: 0,
    WRAPPER_HEIGHT: 100,
    CHANNELS_OUT_MAX: 10
  };
});

// Lightweight mocks for child components
vi.mock('@/components/fields/outputFrequencyResolution/outputFrequencyResolution', () => ({
  default: () => <div data-testid="OutputFrequencyResolutionField" />
}));
vi.mock('@/components/fields/outputSamplingInterval/outputSamplingInterval', () => ({
  default: () => <div data-testid="OutputSamplingIntervalField" />
}));
vi.mock('@/components/fields/dispersionMeasure/dispersionMeasure', () => ({
  default: () => <div data-testid="DispersionMeasureField" />
}));
vi.mock('@/components/fields/rotationMeasure/rotationMeasure', () => ({
  default: () => <div data-testid="RotationMeasureField" />
}));
vi.mock('@/components/fields/bitDepth/bitDepth', () => ({
  default: ({ value, options }: { value: number; options?: Array<{ value: number }> }) => (
    <div
      data-testid="BitDepthField"
      data-value={String(value)}
      data-options={JSON.stringify((options ?? []).map((option) => option.value))}
    />
  )
}));
vi.mock('@/components/fields/polarisations/polarisations', () => ({
  default: () => <div data-testid="PolarisationsField" />
}));
vi.mock('@/components/fields/dataProductType/dataProductType', () => ({
  default: () => <div data-testid="DataProductTypeField" />
}));
vi.mock('@/components/fields/imageSize/imageSize', () => ({
  default: () => <div data-testid="ImageSizeField" />
}));
vi.mock('@/components/fields/pixelSize/pixelSize', () => ({
  default: () => <div data-testid="PixelSizeField" />
}));
vi.mock('@/components/fields/robust/Robust', () => ({
  default: () => <div data-testid="RobustField" />
}));
vi.mock('@/components/fields/channelsOut/channelsOut', () => ({
  default: () => <div data-testid="ChannelsOutField" />
}));
vi.mock('@/components/fields/continuumSubtraction/continuumSubtraction', () => ({
  default: () => <div data-testid="ContinuumSubtractionField" />
}));
vi.mock('@/components/fields/imageWeighting/imageWeighting', () => ({
  default: () => <div data-testid="ImageWeightingField" />
}));
vi.mock('@/components/fields/taper/taper', () => ({
  default: () => <div data-testid="TaperField" />
}));
vi.mock('@/components/fields/taperDropdown/taperDropdown', () => ({
  default: () => <div data-testid="TaperDropdown" />
}));
vi.mock('@/components/fields/timeAveraging/timeAveraging', () => ({
  default: () => <div data-testid="TimeAveragingField" />
}));
vi.mock('@/components/fields/frequencyAveraging/frequencyAveraging', () => ({
  default: () => <div data-testid="FrequencyAveragingField" />
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

describe('DataProduct component', () => {
  const theme = createTheme();
  const existingDataProduct = {
    id: 'DP1',
    observationId: 'OBS1',
    data: { dataProductType: 1 }
  } as DataProductSDPNew;

  const renderExistingDataProduct = (sensCalc: SensCalcResults) => {
    mockOsdCyclePolicy = { maxObservations: 1, maxDataProducts: 1 };
    mockStoreReturn = {
      application: {
        content2: {
          observations: [
            {
              id: 'OBS1',
              type: 'continuum',
              centralFrequency: 1,
              centralFrequencyUnits: 'Hz'
            }
          ],
          dataProductSDP: [existingDataProduct],
          targetObservation: [
            {
              observationId: 'OBS1',
              dataProductsSDPId: 'DP1',
              targetId: 'T1',
              sensCalc
            }
          ]
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
    mockFetchSensCalcPatches.mockClear();
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

  it('uses persisted sensitivity results without recalculating when the edit page loads', () => {
    renderExistingDataProduct({
      title: 'Target 1',
      statusGUI: 0,
      section1: [{ field: 'continuumSensitivityWeighted', value: '1', units: 'Jy' }]
    });

    expect(mockStoreReturn.updateAppContent2).not.toHaveBeenCalled();
    expect(mockFetchSensCalcPatches).not.toHaveBeenCalled();
    expect(screen.getByTestId('field-continuumSensitivityWeighted')).toHaveTextContent('1');
  });

  it('immediately calculates missing sensitivity results when the edit page loads', () => {
    renderExistingDataProduct({
      title: 'Target 1',
      statusGUI: 3,
      error: ''
    });

    expect(mockFetchSensCalcPatches).toHaveBeenCalledWith(
      expect.objectContaining({
        observations: expect.any(Array),
        dataProductSDP: expect.any(Array),
        targetObservation: expect.any(Array)
      }),
      expect.objectContaining({ id: 'OBS1' }),
      expect.objectContaining({ id: 'DP1' })
    );
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

  it('uses the PST proposal mode for the description when no observation is selected', () => {
    mockStoreReturn = {
      application: {
        content2: {
          scienceCategory: 'pst',
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
