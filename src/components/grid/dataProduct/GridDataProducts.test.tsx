import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import GridDataProducts from './GridDataProducts';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<ReferenceFrame />', () => {
  test('renders correctly', () => {
    wrapper(<GridDataProducts baseObservations={[]} />);
  });
  test('renders correctly with rows', () => {
    wrapper(
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
    wrapper(
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
