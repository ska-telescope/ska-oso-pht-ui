import { describe, expect, test } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@utils/storage/store';
import '@testing-library/jest-dom';
import SensCalcModalMultiple from './SensCalcModalMultiple';
import { BAND_LOW_STR, STATUS_ERROR, TYPE_CONTINUUM, TYPE_ZOOM } from '@/utils/constants';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

// The data row's cells, minus the target name before the 11 results and the status after them
const expectResultCells = (text: string) => {
  const cells = within(screen.getAllByRole('row')[1]).getAllByRole('gridcell').slice(1, -1);
  expect(cells).toHaveLength(11);
  cells.forEach((cell) => expect(cell).toHaveTextContent(text));
};

const data = [
  {
    id: 1,
    section1: [
      {
        field: 'testField1-1',
        value: '0',
        units: 'Jy'
      },
      {
        field: 'testField1-2',
        value: '0',
        units: 'Jy'
      },
      {
        field: 'testField1-3',
        value: '0',
        units: 'Jy'
      },
      {
        field: 'testField1-4',
        value: '0',
        units: 'Jy'
      },
      {
        field: 'testField1-5',
        value: '0',
        units: 'Jy'
      }
    ],
    section2: [
      {
        field: 'testField2-1',
        value: '0',
        units: 'Jy'
      },
      {
        field: 'testField2-2',
        value: '0',
        units: 'Jy'
      },
      {
        field: 'testField2-3',
        value: '0',
        units: 'Jy'
      },
      {
        field: 'testField2-4',
        value: '0',
        units: 'Jy'
      },
      {
        field: 'testField2-5',
        value: '0',
        units: 'Jy'
      }
    ],
    section3: [
      {
        field: 'testField3',
        value: '0',
        units: 'Jy'
      }
    ]
  }
];

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

describe('<SensCalcModalMultiple />', () => {
  test('renders correctly', () => {
    wrapper(
      <SensCalcModalMultiple
        open={false}
        onClose={vi.fn()}
        data={undefined}
        observation={{
          id: '1',
          telescope: 0,
          subarray: '',
          type: TYPE_ZOOM,
          observingBand: BAND_LOW_STR,
          weather: undefined,
          elevation: 0,
          centralFrequency: 0,
          centralFrequencyUnits: 0,
          bandwidth: 0,
          continuumBandwidth: 0,
          continuumBandwidthUnits: 0,
          supplied: {
            type: 0,
            value: 0,
            units: 0
          },
          spectralResolution: '',
          effectiveResolution: '',
          numSubBands: undefined,
          num15mAntennas: undefined,
          num13mAntennas: undefined,
          numStations: undefined
        }}
        level={0}
        levelError={''}
        isCustom={false}
        isNatural={false}
      />
    );
  });
  test('renders correctly with data', async () => {
    wrapper(
      <SensCalcModalMultiple
        open={true}
        onClose={vi.fn()}
        data={data}
        observation={{
          id: '2',
          telescope: 0,
          subarray: '',
          type: TYPE_CONTINUUM,
          observingBand: BAND_LOW_STR,
          weather: undefined,
          elevation: 0,
          centralFrequency: 0,
          centralFrequencyUnits: 0,
          bandwidth: 0,
          continuumBandwidth: 0,
          continuumBandwidthUnits: 0,
          supplied: {
            type: 0,
            value: 0,
            units: 0
          },
          spectralResolution: '',
          effectiveResolution: '',
          numSubBands: undefined,
          num15mAntennas: undefined,
          num13mAntennas: undefined,
          numStations: undefined
        }}
        level={0}
        levelError={''}
        isCustom={false}
        isNatural={false}
      />
    );
    await waitFor(() => expectResultCells('0 Jy'));
  });
  test('renders correctly with data ( custom )', async () => {
    wrapper(
      <SensCalcModalMultiple
        open={true}
        onClose={vi.fn()}
        data={data}
        observation={{
          id: '3',
          telescope: 0,
          subarray: '',
          type: TYPE_CONTINUUM,
          observingBand: BAND_LOW_STR,
          weather: undefined,
          elevation: 0,
          centralFrequency: 0,
          centralFrequencyUnits: 0,
          bandwidth: 0,
          continuumBandwidth: 0,
          continuumBandwidthUnits: 0,
          supplied: {
            type: 0,
            value: 0,
            units: 0
          },
          spectralResolution: '',
          effectiveResolution: '',
          numSubBands: undefined,
          num15mAntennas: undefined,
          num13mAntennas: undefined,
          numStations: undefined
        }}
        level={0}
        levelError={''}
        isCustom={true}
        isNatural={false}
      />
    );
    await waitFor(() => expectResultCells('sensitivityCalculatorResults.customArray'));
  });
  test('renders correctly with data ( natural )', async () => {
    wrapper(
      <SensCalcModalMultiple
        open={true}
        onClose={vi.fn()}
        data={data}
        observation={{
          id: '3',
          telescope: 0,
          subarray: '',
          type: TYPE_CONTINUUM,
          observingBand: BAND_LOW_STR,
          weather: undefined,
          elevation: 0,
          centralFrequency: 0,
          centralFrequencyUnits: 0,
          bandwidth: 0,
          continuumBandwidth: 0,
          continuumBandwidthUnits: 0,
          supplied: {
            type: 0,
            value: 0,
            units: 0
          },
          spectralResolution: '',
          effectiveResolution: '',
          numSubBands: undefined,
          num15mAntennas: undefined,
          num13mAntennas: undefined,
          numStations: undefined
        }}
        level={0}
        levelError={''}
        isCustom={false}
        isNatural={true}
      />
    );
    await waitFor(() => expectResultCells('sensitivityCalculatorResults.nonGaussian'));
  });

  test('renders correctly (error)', () => {
    wrapper(
      <SensCalcModalMultiple
        open={false}
        onClose={vi.fn()}
        data={{
          id: 4,
          title: '',
          statusGUI: STATUS_ERROR,
          error: 'SOME ERROR',
          section1: undefined,
          section2: undefined,
          section3: undefined
        }}
        isCustom={true}
        isNatural={false}
        level={1}
        levelError={'1'}
        observation={{
          id: '',
          telescope: 0,
          subarray: '',
          type: TYPE_CONTINUUM,
          observingBand: BAND_LOW_STR,
          weather: undefined,
          elevation: 0,
          centralFrequency: 0,
          centralFrequencyUnits: 0,
          bandwidth: 0,
          continuumBandwidth: 0,
          continuumBandwidthUnits: 0,
          supplied: {
            type: 0,
            value: 0,
            units: 0
          },
          spectralResolution: '',
          effectiveResolution: '',
          numSubBands: undefined,
          num15mAntennas: undefined,
          num13mAntennas: undefined,
          numStations: undefined
        }}
      />
    );
  });
});
