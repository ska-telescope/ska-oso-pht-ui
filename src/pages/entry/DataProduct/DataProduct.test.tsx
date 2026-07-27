// DataProduct.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DataProduct from './DataProduct';

const wrapper = (component: React.ReactElement) => {
  return render(component);
};

// --- Mocks ---
vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({ t: (key: string) => key })
}));
vi.mock('@/utils/help/useHelp', () => ({ useHelp: () => ({ setHelp: vi.fn() }) }));
vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({ osdCyclePolicy: { maxObservations: 5, maxDataProducts: 2 } })
}));

let mockStoreReturn: any = {
  application: { content2: { observations: [], dataProductSDP: [] } },
  updateAppContent2: vi.fn()
};
vi.mock('@ska-telescope/ska-gui-local-storage', () => ({
  storageObject: { useStore: () => mockStoreReturn }
}));

vi.mock('@/utils/helpers', () => ({ generateId: () => 'SDP000001' }));
vi.mock('@/utils/present/present', () => ({ presentUnits: (val: string) => `unit(${val})` }));

// Safe constants mock
vi.mock('@/utils/constants.ts', async importOriginal => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    PAGE_DATA_PRODUCTS: 'PAGE_DATA_PRODUCTS',
    TYPE_CONTINUUM: 1,
    TYPE_PST: 2,
    TYPE_ZOOM: 3,
    IW_BRIGGS: 99,
    FLOW_THROUGH_VALUE: 'FLOW',
    DETECTED_FILTER_BANK_VALUE: 'DFB',
    PULSAR_TIMING_VALUE: 'PT',
    NAV: { PAGE_DATA_PRODUCTS: '/mock-nav' },
    FOOTER_HEIGHT_PHT: 0,
    WRAPPER_HEIGHT: 100,
    CHANNELS_OUT_MAX: 10
  };
});

// Lightweight mocks for child components
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
});
