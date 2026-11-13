import TestProposalFormProvider from '@/models/proposals/testing/TestProposalFormProvider';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { DATA_PRODUCT_KIND, DataProductInput } from '@/models/proposals/dataProducts';
import { TYPE_CONTINUUM, TYPE_PST } from '@/utils/constants.ts';
import DataProduct from './DataProduct';

// --- Mocks ---
vi.mock('@/utils/help/useHelp', () => ({ useHelp: () => ({ setHelp: vi.fn() }) }));
const mockOsdCyclePolicy = { maxObservations: 5, maxDataProducts: 2 };
vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({ osdCyclePolicy: mockOsdCyclePolicy })
}));

let mockStoreReturn: any;
vi.mock('@utils/storage/store', () => ({
  storageObject: { useStore: () => mockStoreReturn }
}));

let mockId = 0;
vi.mock('@/utils/helpers', () => ({
  generateId: () => 'SDP000001',
  generateDataProductId: () => `new-dp-${++mockId}`,
  convertFrequencyToDisplayUnits: (value: number, unit: string) => ({ value, unit }),
  getSpectralResolutionHz: () => 1000000,
  frequencyConversion: (value: number) => value
}));

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

const theme = createTheme();

// The images or visibilities choice of a continuum observation
const productType = () => screen.getByRole('combobox', { name: 'dataProductType.label' });
const IMAGES = 'dataProductType.options.continuum.1';

const observation = (type: string, extra: object = {}) => ({
  id: 'OBS1',
  type,
  observingBand: 'low',
  centralFrequency: 1,
  centralFrequencyUnits: 'Hz',
  supplied: { value: 1 },
  continuumBandwidth: 1,
  continuumBandwidthUnits: 2,
  bandwidth: 1,
  ...extra
});

// The store the form is seeded from
const openProposal = (proposal: {
  observations: object[];
  dataProducts: DataProductInput[];
  targetObservation?: object[];
  targets?: object[];
}) => {
  mockStoreReturn = {
    application: {
      content2: {
        id: 'prsl-1',
        targets: [],
        targetObservation: [],
        ...proposal
      }
    },
    updateAppContent2: vi.fn()
  };
};

// The proposal the form last copied into the store
const storedProposal = () => mockStoreReturn.updateAppContent2.mock.calls.at(-1)?.[0];

const renderPage = () =>
  render(
    <TestProposalFormProvider>
      <ThemeProvider theme={theme}>
        <DataProduct />
      </ThemeProvider>
    </TestProposalFormProvider>
  );

beforeEach(() => {
  mockId = 0;
  openProposal({ observations: [], dataProducts: [] });
});

describe('DataProduct entry', () => {
  it('shows nothing until the proposal has an observation', () => {
    renderPage();

    expect(screen.queryByTestId('GridObservation')).not.toBeInTheDocument();
  });

  const observations = [
    observation(TYPE_CONTINUUM),
    observation(TYPE_PST, { id: 'OBS2', pstMode: 1 })
  ];

  it('starts with the defaults for the PST observation', () => {
    openProposal({ observations, dataProducts: [] });
    renderPage();

    expect(screen.getByText(/Observation OBS1/)).toBeInTheDocument();
    expect(screen.getByText('page.7.descContent.pstDetectedFilterbank')).toBeInTheDocument();
  });

  it('starts again with the defaults of another observation when the user picks it', async () => {
    openProposal({ observations, dataProducts: [] });
    renderPage();

    fireEvent.click(screen.getByText(/Observation OBS1/));

    await waitFor(() => expect(productType()).toHaveTextContent(IMAGES));
  });

  it('adds the data product to the proposal only when the user adds it', async () => {
    openProposal({ observations, dataProducts: [] });
    renderPage();
    const add = screen.getByTestId('addDataProductButtonEntry');
    await waitFor(() => expect(add).toBeEnabled());
    expect(storedProposal()?.dataProducts ?? []).toEqual([]);

    fireEvent.click(add);

    await waitFor(() =>
      expect(storedProposal().dataProducts).toEqual([
        expect.objectContaining({
          observationId: 'OBS2',
          kind: DATA_PRODUCT_KIND.PST_DETECTED_FILTERBANK
        })
      ])
    );
  });
});
