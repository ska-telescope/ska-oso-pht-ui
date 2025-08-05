import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import GridTargets from './GridTargets';
import { ICRS } from '@/utils/constants';

describe('<GridTargets />', () => {
  test('renders correctly', () => {
    render(<GridTargets raType={0} />);
  });
  test('renders correctly with rows', () => {
    render(
      <GridTargets
        raType={0}
        rows={[
          {
            kind: ICRS,
            id: 1,
            decStr: '',
            name: '',
            latitude: '',
            longitude: '',
            raStr: '',
            redshift: '',
            referenceFrame: ICRS,
            velType: 0,
            vel: '',
            velUnit: 0
          }
        ]}
      />
    );
  });
  test('renders correctly with rows, deleteClicked', () => {
    render(
      <GridTargets
        deleteClicked={vi.fn()}
        raType={0}
        rows={[
          {
            kind: ICRS,
            id: 1,
            decStr: '',
            name: '',
            latitude: '',
            longitude: '',
            raStr: '',
            redshift: '',
            referenceFrame: ICRS,
            velType: 0,
            vel: '',
            velUnit: 0
          }
        ]}
      />
    );
  });
  test('renders correctly with rows, editClicked', () => {
    render(
      <GridTargets
        editClicked={vi.fn()}
        raType={0}
        rows={[
          {
            kind: ICRS,
            id: 1,
            decStr: '',
            name: '',
            latitude: '',
            longitude: '',
            raStr: '',
            redshift: '',
            referenceFrame: ICRS,
            velType: 0,
            vel: '',
            velUnit: 0
          }
        ]}
      />
    );
  });
});
