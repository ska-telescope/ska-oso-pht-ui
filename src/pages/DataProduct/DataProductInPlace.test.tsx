import TestProposalFormProvider from '@/models/proposals/testing/TestProposalFormProvider';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useFormContext, UseFormReturn } from 'react-hook-form';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { Sensitivity, SensitivityValues } from '@/models/proposals/targetObservation';
import {
  DATA_PRODUCT_KIND,
  DataProductInput,
  STEPPED_FIELD,
  steppedFromPdm
} from '@/models/proposals/dataProducts';
import { REFERENCE_COORDINATE_TYPE_SSO, SENSITIVITY_STATE } from '@/utils/constants.ts';
import DataProductInPlace from './DataProductInPlace';
import { ProposalType } from '@/models/proposals/proposal';
import { PstMode } from '@/generated/models';
import {
  newSvObservation,
  OBSERVING_MODE,
  type ObservationInput,
  type ObservingMode
} from '@/models/proposals/observations';

// --- Mocks ---
vi.mock('@/utils/help/useHelp', () => ({ useHelp: () => ({ setHelp: vi.fn() }) }));
const mockOsdCyclePolicy = { maxObservations: 1, maxDataProducts: 1 };
vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({ osdCyclePolicy: mockOsdCyclePolicy })
}));

let mockId = 0;
vi.mock('@/utils/helpers', async (importOriginal) => ({
  ...(await importOriginal()),
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
const VISIBILITIES = 'dataProductType.options.continuum.2';

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

const DONE: Sensitivity = {
  state: SENSITIVITY_STATE.DONE,
  continuum: values({ weighted: 1 }),
  spectral: values({ weighted: 2 })
};

const observation = (mode: ObservingMode, extra: object = {}) =>
  ({ ...newSvObservation(mode, 15), id: 'OBS1', ...extra }) as ObservationInput;

const image = (kind: string, extra: object = {}) =>
  ({
    id: 'DP1',
    observationId: 'OBS1',
    kind,
    imageSize: { value: 1, unit: 'deg' },
    pixelSize: { value: 1, unit: 'arcsec' },
    weighting: { type: 'briggs', robust: 0 },
    taper: 0,
    polarisations: ['I'],
    channelsOut: 10,
    ...(kind === DATA_PRODUCT_KIND.SPECTRAL_IMAGE && { continuumSubtraction: true }),
    ...extra
  }) as DataProductInput;

const visibilities = {
  id: 'DP2',
  observationId: 'OBS1',
  kind: DATA_PRODUCT_KIND.CONTINUUM_VISIBILITIES,
  timeAveragingS: steppedFromPdm(4, STEPPED_FIELD.TIME_AVERAGING_S),
  frequencyAveragingKhz: steppedFromPdm(4, STEPPED_FIELD.FREQUENCY_AVERAGING_KHZ)
} as DataProductInput;

const link = (sensitivity?: Sensitivity) => ({
  observationId: 'OBS1',
  dataProductsSDPId: 'DP1',
  targetId: 'T1',
  sensitivity
});

let openedObservation: ObservationInput;
let openedProposal: Partial<ProposalType>;
const openProposal = (proposal: {
  observations: ObservationInput[];
  dataProducts: DataProductInput[];
  targetObservation?: object[];
  targets?: object[];
}) => {
  openedObservation = proposal.observations[0];
  openedProposal = { prslId: 'prsl-1', ...proposal } as Partial<ProposalType>;
};

let form: UseFormReturn<ProposalType>;
const FormProbe = ({ onForm }: { onForm: (form: UseFormReturn<ProposalType>) => void }) => {
  onForm(useFormContext<ProposalType>());
  return null;
};
const keepForm = (probed: UseFormReturn<ProposalType>) => {
  form = probed;
};

const renderPage = () =>
  render(
    <TestProposalFormProvider values={openedProposal}>
      <FormProbe onForm={keepForm} />
      <ThemeProvider theme={theme}>
        <DataProductInPlace observation={openedObservation} />
      </ThemeProvider>
    </TestProposalFormProvider>
  );

beforeEach(() => {
  mockId = 0;
});

describe('DataProductInPlace', () => {
  it('shows the linked data product and its results without changing them', () => {
    const dataProducts = [image(DATA_PRODUCT_KIND.CONTINUUM_IMAGE), visibilities];
    openProposal({
      observations: [observation(OBSERVING_MODE.CONTINUUM)],
      dataProducts,
      targetObservation: [link(DONE)]
    });
    renderPage();

    expect(productType()).toHaveTextContent(IMAGES);
    expect(screen.getByTestId('field-continuumSensitivityWeighted')).toHaveTextContent('1');
    expect(form.getValues('dataProducts')).toEqual(dataProducts);
    expect(form.getValues('targetObservation')[0].sensitivity).toEqual(DONE);
  });

  it("shows the observation's main data product before there is a link", () => {
    openProposal({
      observations: [observation(OBSERVING_MODE.CONTINUUM)],
      dataProducts: [visibilities, image(DATA_PRODUCT_KIND.CONTINUUM_IMAGE)]
    });
    renderPage();

    expect(productType()).toHaveTextContent(VISIBILITIES);
  });

  it('offers images or visibilities only for a continuum observation', () => {
    // A continuum-spectral observation's visibilities are its hidden companion, not a choice
    openProposal({
      observations: [observation(OBSERVING_MODE.CONTINUUM_SPECTRAL)],
      dataProducts: [visibilities, image(DATA_PRODUCT_KIND.CONTINUUM_SPECTRAL_IMAGE)]
    });
    renderPage();

    expect(
      screen.queryByRole('combobox', { name: 'dataProductType.label' })
    ).not.toBeInTheDocument();
  });

  it('makes the visibilities the main data product when the user switches to them', async () => {
    openProposal({
      observations: [observation(OBSERVING_MODE.CONTINUUM)],
      dataProducts: [image(DATA_PRODUCT_KIND.CONTINUUM_IMAGE, { channelsOut: 3 }), visibilities],
      targetObservation: [link(DONE)]
    });
    renderPage();

    fireEvent.mouseDown(productType());
    fireEvent.click(screen.getByRole('option', { name: VISIBILITIES }));

    await waitFor(() =>
      expect(form.getValues('dataProducts').map((dp) => dp.id)).toEqual(['DP2', 'DP1'])
    );
    // The images data product is a hidden companion again, with its defaults back
    expect(form.getValues('dataProducts')[1]).toMatchObject({ id: 'DP1', channelsOut: 10 });
    expect(form.getValues('targetObservation')[0]).toMatchObject({
      dataProductsSDPId: 'DP2',
      sensitivity: { state: SENSITIVITY_STATE.CALCULATING }
    });
  });

  it('hides continuum spectral results when only one output channel is selected', () => {
    openProposal({
      observations: [observation(OBSERVING_MODE.CONTINUUM)],
      dataProducts: [image(DATA_PRODUCT_KIND.CONTINUUM_IMAGE, { channelsOut: 1 })],
      targetObservation: [link(DONE)]
    });
    renderPage();

    expect(
      screen.getByText('sensitivityCalculatorResults.title (Imaging ODP)')
    ).toBeInTheDocument();
    expect(screen.getByTestId('field-continuumSensitivityWeighted')).toBeInTheDocument();
    expect(screen.queryByTestId('field-spectralSensitivityWeighted')).not.toBeInTheDocument();
  });

  describe('when the sensitivity calculator does not apply', () => {
    it('reports PST as unsupported', () => {
      openProposal({
        observations: [observation(OBSERVING_MODE.PST)],
        dataProducts: [{ id: 'DP1', observationId: 'OBS1', kind: DATA_PRODUCT_KIND.PST_TIMING }]
      });
      renderPage();

      expect(screen.getByText('page.7.pstUnavailable')).toBeInTheDocument();
    });

    it('asks for a target when none is linked', () => {
      openProposal({
        observations: [observation(OBSERVING_MODE.CONTINUUM)],
        dataProducts: [image(DATA_PRODUCT_KIND.CONTINUUM_IMAGE)]
      });
      renderPage();

      expect(screen.getByText('sensitivityCalculatorResults.noTarget')).toBeInTheDocument();
    });

    it('reports SSO targets as unsupported', () => {
      openProposal({
        observations: [observation(OBSERVING_MODE.CONTINUUM)],
        dataProducts: [image(DATA_PRODUCT_KIND.CONTINUUM_IMAGE)],
        targetObservation: [link({ state: SENSITIVITY_STATE.CALCULATING })],
        targets: [
          {
            id: 'T1',
            name: 'Jupiter',
            kind: REFERENCE_COORDINATE_TYPE_SSO.value,
            velocityDefinition: 'RADIO'
          }
        ]
      });
      renderPage();

      expect(
        screen.getByText('sensitivityCalculatorResults.notApplicableForSSO')
      ).toBeInTheDocument();
    });
  });

  it.each([
    [OBSERVING_MODE.CONTINUUM, DATA_PRODUCT_KIND.CONTINUUM_IMAGE],
    [OBSERVING_MODE.SPECTRAL, DATA_PRODUCT_KIND.SPECTRAL_IMAGE],
    [OBSERVING_MODE.CONTINUUM_SPECTRAL, DATA_PRODUCT_KIND.CONTINUUM_SPECTRAL_IMAGE]
  ])('shows the robust field for briggs weighting in %s', (type, kind) => {
    openProposal({ observations: [observation(type)], dataProducts: [image(kind)] });
    renderPage();

    expect(screen.getByLabelText('robust.label')).toBeInTheDocument();
  });

  it("shows a spectral data product's own channels out, which the user can't edit", () => {
    openProposal({
      observations: [observation(OBSERVING_MODE.SPECTRAL, { zoomChannels: 40 })],
      dataProducts: [image(DATA_PRODUCT_KIND.SPECTRAL_IMAGE, { channelsOut: 40 })]
    });
    renderPage();

    const channelsOut = screen.getByRole('spinbutton', { name: 'channelsOut.label' });
    expect(channelsOut).toBeDisabled();
    expect(channelsOut).toHaveValue(40);
  });

  it('hides the robust field for other weightings', () => {
    openProposal({
      observations: [observation(OBSERVING_MODE.CONTINUUM)],
      dataProducts: [image(DATA_PRODUCT_KIND.CONTINUUM_IMAGE, { weighting: { type: 'natural' } })]
    });
    renderPage();

    expect(screen.queryByLabelText('robust.label')).not.toBeInTheDocument();
  });

  describe('switching the weighting', () => {
    const weighting = () => screen.getByRole('combobox', { name: 'imageWeighting.label' });
    const choose = (option: string) => {
      fireEvent.mouseDown(weighting());
      fireEvent.click(screen.getByRole('option', { name: option }));
    };
    const robust = () => screen.getByRole('spinbutton', { name: 'robust.label' });

    it('gives briggs the default robust when none was entered', async () => {
      openProposal({
        observations: [observation(OBSERVING_MODE.CONTINUUM)],
        dataProducts: [image(DATA_PRODUCT_KIND.CONTINUUM_IMAGE, { weighting: { type: 'natural' } })]
      });
      renderPage();

      choose('imageWeighting.2');

      await waitFor(() => expect(robust()).toHaveValue(0));
    });

    it('keeps the robust entered for briggs when switching away and back', async () => {
      openProposal({
        observations: [observation(OBSERVING_MODE.CONTINUUM)],
        dataProducts: [
          image(DATA_PRODUCT_KIND.CONTINUUM_IMAGE, { weighting: { type: 'briggs', robust: 1.5 } })
        ]
      });
      renderPage();

      choose('imageWeighting.0');
      await waitFor(() =>
        expect(screen.queryByRole('spinbutton', { name: 'robust.label' })).not.toBeInTheDocument()
      );
      choose('imageWeighting.2');

      await waitFor(() => expect(robust()).toHaveValue(1.5));
    });
  });

  // The calculator gives no beam results for a non-Gaussian beam (Briggs robust 2, say), whatever
  // the weighting the data product has
  it.each([
    [
      'shows a beam result the calculator did not give as non-Gaussian',
      { weightedSensitivity: { value: 7.18, unit: 'Jy/beam' } },
      'sensitivityCalculatorResults.nonGaussian'
    ],
    ['shows a beam result the calculator gave', values({ weighted: 7.18 }), '1.00 x 2.00']
  ])('%s', (_, continuum, beamSize) => {
    openProposal({
      observations: [observation(OBSERVING_MODE.CONTINUUM)],
      dataProducts: [image(DATA_PRODUCT_KIND.CONTINUUM_IMAGE)],
      targetObservation: [
        link({
          state: SENSITIVITY_STATE.DONE,
          continuum,
          spectral: values({ weighted: 1 })
        } as Sensitivity)
      ]
    });
    renderPage();

    expect(screen.getByTestId('field-continuumSynthBeamSize')).toHaveTextContent(beamSize);
  });

  // A whole number of steps from the backend is shown to the field's decimal places
  it('shows the detected filterbank resolution and sampling interval rounded', () => {
    openProposal({
      observations: [observation(OBSERVING_MODE.PST, { pstMode: PstMode.DetectedFilterbank })],
      dataProducts: [
        {
          id: 'DP1',
          observationId: 'OBS1',
          kind: DATA_PRODUCT_KIND.PST_DETECTED_FILTERBANK,
          polarisations: ['I'],
          bitDepth: 8,
          outputFrequencyResolutionKhz: steppedFromPdm(
            1,
            STEPPED_FIELD.OUTPUT_FREQUENCY_RESOLUTION_KHZ
          ),
          outputSamplingIntervalMs: steppedFromPdm(1, STEPPED_FIELD.OUTPUT_SAMPLING_INTERVAL_MS),
          dispersionMeasure: 0,
          rotationMeasure: 0
        } as DataProductInput
      ]
    });
    renderPage();

    expect(screen.getByRole('spinbutton', { name: 'outputFrequencyResolution.label' })).toHaveValue(
      3.62
    );
    expect(screen.getByRole('spinbutton', { name: 'outputSamplingInterval.label' })).toHaveValue(
      0.207
    );
  });

  it.each([
    [
      DATA_PRODUCT_KIND.PST_FLOW_THROUGH,
      PstMode.FlowThrough,
      ['1', '2', '4', '8', '16'],
      ['X', 'Y']
    ],
    [
      DATA_PRODUCT_KIND.PST_DETECTED_FILTERBANK,
      PstMode.DetectedFilterbank,
      ['1', '2', '4', '8'],
      ['I', 'Q', 'U', 'V']
    ]
  ])(
    'gives %s its bit depth and polarisation options and description',
    (kind, pstMode, options, polarisations) => {
      openProposal({
        observations: [observation(OBSERVING_MODE.PST, { pstMode })],
        dataProducts: [
          {
            id: 'DP1',
            observationId: 'OBS1',
            kind,
            polarisations: [polarisations[0]],
            bitDepth: 8,
            outputFrequencyResolutionKhz: steppedFromPdm(
              1,
              STEPPED_FIELD.OUTPUT_FREQUENCY_RESOLUTION_KHZ
            ),
            outputSamplingIntervalMs: steppedFromPdm(1, STEPPED_FIELD.OUTPUT_SAMPLING_INTERVAL_MS),
            dispersionMeasure: 0,
            rotationMeasure: 0
          } as DataProductInput
        ]
      });
      renderPage();

      expect(
        screen.getAllByRole('checkbox').map((box) => box.closest('label')?.textContent)
      ).toEqual(polarisations.map((value) => 'polarisations.' + value));
      expect(screen.getByLabelText('polarisations.' + polarisations[0])).toBeChecked();

      // The bit depth is the only list on the page
      fireEvent.mouseDown(screen.getByRole('combobox'));
      expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(options);
      expect(screen.getByRole('option', { selected: true })).toHaveTextContent('8');
      expect(screen.getByText(`page.7.descContent.${kind}`)).toBeInTheDocument();
    }
  );
});
