import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import GridDataProducts from './GridDataProducts';

describe('<ReferenceFrame />', () => {
  test('renders correctly', () => {
    render(<GridDataProducts baseObservations={[]} />);
  });
  test('renders correctly with rows', () => {
    render(
      <GridDataProducts
        baseObservations={[]}
        rows={[
          {
            observationId: ['1'],
            id: 0,
            observatoryDataProduct: [true, true, true, true],
            imageSizeValue: 0,
            imageSizeUnits: 0,
            pixelSizeValue: 0,
            pixelSizeUnits: '',
            weighting: 0
          }
        ]}
      />
    );
  });
  test('renders correctly with rows & observations', () => {
    render(
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
            pixelSizeValue: 0,
            pixelSizeUnits: '',
            weighting: 0
          }
        ]}
      />
    );
  });
});
