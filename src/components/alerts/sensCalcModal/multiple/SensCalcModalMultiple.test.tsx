import { describe, expect, test } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import SensCalcModalMultiple from './SensCalcModalMultiple';
import { STATUS_ERROR, TYPE_CONTINUUM, TYPE_ZOOM } from '@/utils/constants';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const data = [
  {
    id: 1,
    section1: [
      // TODO use more meaningful results
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
      <AppFlowProvider>
        <ThemeA11yProvider>{component}</ThemeA11yProvider>
      </AppFlowProvider>
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
          subarray: 0,
          linked: '',
          type: TYPE_ZOOM,
          observingBand: 0,
          weather: undefined,
          elevation: 0,
          centralFrequency: 0,
          centralFrequencyUnits: 0,
          bandwidth: 0,
          continuumBandwidth: 0,
          continuumBandwidthUnits: 0,
          spectralAveraging: undefined,
          tapering: undefined,
          imageWeighting: 0,
          robust: 0,
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
          subarray: 0,
          linked: '',
          type: TYPE_CONTINUUM,
          observingBand: 0,
          weather: undefined,
          elevation: 0,
          centralFrequency: 0,
          centralFrequencyUnits: 0,
          bandwidth: 0,
          continuumBandwidth: 0,
          continuumBandwidthUnits: 0,
          spectralAveraging: undefined,
          tapering: undefined,
          imageWeighting: 0,
          robust: 0,
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
    await waitFor(() => {
      const element1 = screen.getByTestId('field1');
      expect(element1).toBeInTheDocument();
      expect(element1).toHaveTextContent('0 Jy');

      const element2 = screen.getByTestId('field2');
      expect(element2).toBeInTheDocument();
      expect(element2).toHaveTextContent('0 Jy');

      const element3 = screen.getByTestId('field3');
      expect(element3).toBeInTheDocument();
      expect(element3).toHaveTextContent('0 Jy');

      const element4 = screen.getByTestId('field4');
      expect(element4).toBeInTheDocument();
      expect(element4).toHaveTextContent('0 Jy');

      const element5 = screen.getByTestId('field5');
      expect(element5).toBeInTheDocument();
      expect(element5).toHaveTextContent('0 Jy');

      const element6 = screen.getByTestId('field6');
      expect(element6).toBeInTheDocument();
      expect(element6).toHaveTextContent('0 Jy');

      const element7 = screen.getByTestId('field7');
      expect(element7).toBeInTheDocument();
      expect(element7).toHaveTextContent('0 Jy');

      const element8 = screen.getByTestId('field8');
      expect(element8).toBeInTheDocument();
      expect(element8).toHaveTextContent('0 Jy');

      const element9 = screen.getByTestId('field9');
      expect(element9).toBeInTheDocument();
      expect(element9).toHaveTextContent('0 Jy');

      const element10 = screen.getByTestId('field10');
      expect(element10).toBeInTheDocument();
      expect(element10).toHaveTextContent('0 Jy');

      const element11 = screen.getByTestId('field11');
      expect(element11).toBeInTheDocument();
      expect(element11).toHaveTextContent('0 Jy');
    });
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
          subarray: 0,
          linked: '',
          type: TYPE_CONTINUUM,
          observingBand: 0,
          weather: undefined,
          elevation: 0,
          centralFrequency: 0,
          centralFrequencyUnits: 0,
          bandwidth: 0,
          continuumBandwidth: 0,
          continuumBandwidthUnits: 0,
          spectralAveraging: undefined,
          tapering: undefined,
          imageWeighting: 0,
          robust: 0,
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
    await waitFor(() => {
      const element1 = screen.getByTestId('field1');
      expect(element1).toBeInTheDocument();
      expect(element1).toHaveTextContent('sensitivityCalculatorResults.customArray');

      const element2 = screen.getByTestId('field2');
      expect(element2).toBeInTheDocument();
      expect(element2).toHaveTextContent('sensitivityCalculatorResults.customArray');

      const element3 = screen.getByTestId('field3');
      expect(element3).toBeInTheDocument();
      expect(element3).toHaveTextContent('sensitivityCalculatorResults.customArray');

      const element4 = screen.getByTestId('field4');
      expect(element4).toBeInTheDocument();
      expect(element4).toHaveTextContent('sensitivityCalculatorResults.customArray');

      const element5 = screen.getByTestId('field5');
      expect(element5).toBeInTheDocument();
      expect(element5).toHaveTextContent('sensitivityCalculatorResults.customArray');

      const element6 = screen.getByTestId('field6');
      expect(element6).toBeInTheDocument();
      expect(element6).toHaveTextContent('sensitivityCalculatorResults.customArray');

      const element7 = screen.getByTestId('field7');
      expect(element7).toBeInTheDocument();
      expect(element7).toHaveTextContent('sensitivityCalculatorResults.customArray');

      const element8 = screen.getByTestId('field8');
      expect(element8).toBeInTheDocument();
      expect(element8).toHaveTextContent('sensitivityCalculatorResults.customArray');

      const element9 = screen.getByTestId('field9');
      expect(element9).toBeInTheDocument();
      expect(element9).toHaveTextContent('sensitivityCalculatorResults.customArray');

      const element10 = screen.getByTestId('field10');
      expect(element10).toBeInTheDocument();
      expect(element10).toHaveTextContent('sensitivityCalculatorResults.customArray');

      const element11 = screen.getByTestId('field11');
      expect(element11).toBeInTheDocument();
      expect(element11).toHaveTextContent('sensitivityCalculatorResults.customArray');
    });
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
          subarray: 0,
          linked: '',
          type: TYPE_CONTINUUM,
          observingBand: 0,
          weather: undefined,
          elevation: 0,
          centralFrequency: 0,
          centralFrequencyUnits: 0,
          bandwidth: 0,
          continuumBandwidth: 0,
          continuumBandwidthUnits: 0,
          spectralAveraging: undefined,
          tapering: undefined,
          imageWeighting: 0,
          robust: 0,
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
    await waitFor(() => {
      const element1 = screen.getByTestId('field1');
      expect(element1).toBeInTheDocument();
      expect(element1).toHaveTextContent('sensitivityCalculatorResults.nonGaussian');

      const element2 = screen.getByTestId('field2');
      expect(element2).toBeInTheDocument();
      expect(element2).toHaveTextContent('sensitivityCalculatorResults.nonGaussian');

      const element3 = screen.getByTestId('field3');
      expect(element3).toBeInTheDocument();
      expect(element3).toHaveTextContent('sensitivityCalculatorResults.nonGaussian');

      const element4 = screen.getByTestId('field4');
      expect(element4).toBeInTheDocument();
      expect(element4).toHaveTextContent('sensitivityCalculatorResults.nonGaussian');

      const element5 = screen.getByTestId('field5');
      expect(element5).toBeInTheDocument();
      expect(element5).toHaveTextContent('sensitivityCalculatorResults.nonGaussian');

      const element6 = screen.getByTestId('field6');
      expect(element6).toBeInTheDocument();
      expect(element6).toHaveTextContent('sensitivityCalculatorResults.nonGaussian');

      const element7 = screen.getByTestId('field7');
      expect(element7).toBeInTheDocument();
      expect(element7).toHaveTextContent('sensitivityCalculatorResults.nonGaussian');

      const element8 = screen.getByTestId('field8');
      expect(element8).toBeInTheDocument();
      expect(element8).toHaveTextContent('sensitivityCalculatorResults.nonGaussian');

      const element9 = screen.getByTestId('field9');
      expect(element9).toBeInTheDocument();
      expect(element9).toHaveTextContent('sensitivityCalculatorResults.nonGaussian');

      const element10 = screen.getByTestId('field10');
      expect(element10).toBeInTheDocument();
      expect(element10).toHaveTextContent('sensitivityCalculatorResults.nonGaussian');

      const element11 = screen.getByTestId('field11');
      expect(element11).toBeInTheDocument();
      expect(element11).toHaveTextContent('sensitivityCalculatorResults.nonGaussian');
    });
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
          subarray: 0,
          linked: '',
          type: TYPE_CONTINUUM,
          observingBand: 0,
          weather: undefined,
          elevation: 0,
          centralFrequency: 0,
          centralFrequencyUnits: 0,
          bandwidth: 0,
          continuumBandwidth: 0,
          continuumBandwidthUnits: 0,
          spectralAveraging: undefined,
          tapering: undefined,
          imageWeighting: 0,
          robust: 0,
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
