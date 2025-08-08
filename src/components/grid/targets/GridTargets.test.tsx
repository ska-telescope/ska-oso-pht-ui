import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import GridTargets from './GridTargets';
import { RA_TYPE_GALACTIC, RA_TYPE_ICRS } from '@/utils/constants';

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
            kind: RA_TYPE_GALACTIC.value,
            id: 1,
            name: 'Galactic target',
            b: 45.0,
            l: 180.0,
            redshift: '',
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
            kind: RA_TYPE_ICRS.value,
            id: 1,
            decStr: '-45:00:00.0',
            name: 'ICRS target',
            raStr: '12:30:00.0',
            redshift: '',
            referenceFrame: RA_TYPE_ICRS.label,
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
            kind: RA_TYPE_ICRS.value,
            id: 1,
            decStr: '-45:00:00.0',
            name: 'ICRS target',
            raStr: '12:30:00.0',
            redshift: '',
            referenceFrame: RA_TYPE_ICRS.label,
            velType: 0,
            vel: '',
            velUnit: 0
          }
        ]}
      />
    );
  });
});
