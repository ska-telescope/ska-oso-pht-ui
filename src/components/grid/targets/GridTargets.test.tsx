import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import GridTargets from './GridTargets';
import { RA_TYPE_GALACTIC, RA_TYPE_ICRS } from '@/utils/constants';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('<GridTargets />', () => {
  test('renders correctly', () => {
    wrapper(<GridTargets raType={0} />);
  });
  test('renders correctly with rows', () => {
    wrapper(
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
    wrapper(
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
    wrapper(
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
