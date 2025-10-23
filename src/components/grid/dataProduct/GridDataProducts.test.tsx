import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import GridDataProducts from './GridDataProducts';

describe('<ReferenceFrame />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <GridDataProducts baseObservations={[]} />
      </StoreProvider>
    );
  });
  test('renders correctly with rows', () => {
    render(
      <StoreProvider>
        <GridDataProducts
          baseObservations={[]}
          rows={[
            {
              observationId: ['1'],
              id: 0,
              observatoryDataProduct: [true, true, true, true],
              imageSizeValue: 0,
              imageSizeUnits: 0,
              imageCellSizeValue: 0,
              imageCellSizeUnits: '',
              weighting: 0
            }
          ]}
        />
      </StoreProvider>
    );
  });
  test('renders correctly with rows & observations', () => {
    render(
      <StoreProvider>
        <GridDataProducts
          baseObservations={[
            { label: 1, value: 1 },
            { label: 2, value: 2 }
          ]}
          rows={[
            {
              observationId: ['1'],
              id: 0,
              observatoryDataProduct: [true, true, true, true],
              imageSizeValue: 0,
              imageSizeUnits: 0,
              imageCellSizeValue: 0,
              imageCellSizeUnits: '',
              weighting: 0
            }
          ]}
        />
      </StoreProvider>
    );
  });
});
