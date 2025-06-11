import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import GridTargets from './GridTargets';

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
            id: 1,
            dec: '',
            decUnit: '',
            name: '',
            latitude: '',
            longitude: '',
            ra: '',
            raUnit: '',
            redshift: '',
            referenceFrame: 0,
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
            id: 1,
            dec: '',
            decUnit: '',
            name: '',
            latitude: '',
            longitude: '',
            ra: '',
            raUnit: '',
            redshift: '',
            referenceFrame: 0,
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
            id: 1,
            dec: '',
            decUnit: '',
            name: '',
            latitude: '',
            longitude: '',
            ra: '',
            raUnit: '',
            redshift: '',
            referenceFrame: 0,
            velType: 0,
            vel: '',
            velUnit: 0
          }
        ]}
      />
    );
  });
});
