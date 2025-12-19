import { describe, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import StandardAlert from './StandardAlert';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<StandardAlert />', () => {
  const mockActionClose = vi.fn();
  test('renders correctly (SUCCESS)', () => {
    wrapper(
      <StandardAlert
        closeFunc={mockActionClose}
        color={AlertColorTypes.Success}
        testId={''}
        text={''}
      />
    );
    screen.queryByTestId('CloseIcon')?.click();
  });
  test('renders correctly (INFO)', () => {
    wrapper(
      <StandardAlert
        closeFunc={mockActionClose}
        color={AlertColorTypes.Info}
        testId={''}
        text={''}
      />
    );
    screen.queryByTestId('CloseIcon')?.click();
  });
  test('renders correctly (WARNING)', () => {
    wrapper(
      <StandardAlert
        closeFunc={mockActionClose}
        color={AlertColorTypes.Warning}
        testId={''}
        text={''}
      />
    );
    screen.queryByTestId('CloseIcon')?.click();
  });
  test('renders correctly (ERROR)', () => {
    wrapper(
      <StandardAlert
        closeFunc={mockActionClose}
        color={AlertColorTypes.Error}
        testId={''}
        text={''}
      />
    );
    screen.queryByTestId('CloseIcon')?.click();
  });
});
