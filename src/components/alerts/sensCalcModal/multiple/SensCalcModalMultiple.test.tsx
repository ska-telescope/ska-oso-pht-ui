import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import SensCalcModalMultiple from './SensCalcModalMultiple';
import { STATUS_ERROR, TYPE_CONTINUUM, TYPE_ZOOM } from '@/utils/constants';

describe('<SensCalcModalMultiple />', () => {
  test('renders correctly', () => {
    render(
      <SensCalcModalMultiple
        open={false}
        onClose={vi.fn()}
        data={undefined}
        observation={{
          id: '',
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
      />
    );
  });
  test('renders correctly with data', () => {
    render(
      <SensCalcModalMultiple
        open={false}
        onClose={vi.fn()}
        data={[
          {
            section1: [
              {
                field: 'targetName',
                value: 'testValue',
                units: 'testUnits'
              },
              {
                field: 'testField1',
                value: 'testValue1',
                units: 'testUnits1'
              }
            ],
            section2: [
              {
                field: 'sensitivity',
                value: 'testValue2',
                units: 'testUnits2'
              },
              {
                field: 'testField2',
                value: 'testValue2',
                units: 'testUnits2'
              }
            ],
            section3: [
              {
                field: 'testField3',
                value: 'testValue3',
                units: 'testUnits3'
              }
            ]
          }
        ]}
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
        level={0}
        levelError={''}
        isCustom={false}
      />
    );
  });
  test('renders correctly with data ( custom )', () => {
    render(
      <SensCalcModalMultiple
        open={false}
        onClose={vi.fn()}
        data={[
          {
            section1: [
              {
                field: 'targetName',
                value: 'testValue',
                units: 'testUnits'
              },
              {
                field: 'testField1',
                value: 'testValue1',
                units: 'testUnits1'
              }
            ],
            section2: [
              {
                field: 'sensitivity',
                value: 'testValue2',
                units: 'testUnits2'
              },
              {
                field: 'testField2',
                value: 'testValue2',
                units: 'testUnits2'
              }
            ],
            section3: [
              {
                field: 'testField3',
                value: 'testValue3',
                units: 'testUnits3'
              }
            ]
          }
        ]}
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
        level={0}
        levelError={''}
        isCustom={true}
      />
    );
  });
  test('renders correctly (error)', () => {
    render(
      <SensCalcModalMultiple
        open={false}
        onClose={vi.fn()}
        data={{
          id: 0,
          title: '',
          statusGUI: STATUS_ERROR,
          error: 'SOME ERROR',
          section1: undefined,
          section2: undefined,
          section3: undefined
        }}
        isCustom={true}
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
