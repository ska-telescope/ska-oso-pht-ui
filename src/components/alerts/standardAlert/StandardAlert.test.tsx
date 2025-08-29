import { describe, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import StandardAlert from './StandardAlert';

describe('<StandardAlert />', () => {
  const mockActionClose = vi.fn();
  test('renders correctly (SUCCESS)', () => {
    render(
      <StoreProvider>
        <StandardAlert
          closeFunc={mockActionClose}
          color={AlertColorTypes.Success}
          testId={''}
          text={''}
        />
        <StandardAlert color={AlertColorTypes.Success} testId={''} text={''} />
      </StoreProvider>
    );
    screen.queryByTestId('CloseIcon')?.click();
  });
  test('renders correctly (INFO)', () => {
    render(
      <StoreProvider>
        <StandardAlert
          closeFunc={mockActionClose}
          color={AlertColorTypes.Info}
          testId={''}
          text={''}
        />
      </StoreProvider>
    );
    screen.queryByTestId('CloseIcon')?.click();
  });
  test('renders correctly (WARNING)', () => {
    render(
      <StoreProvider>
        <StandardAlert
          closeFunc={mockActionClose}
          color={AlertColorTypes.Warning}
          testId={''}
          text={''}
        />
      </StoreProvider>
    );
    screen.queryByTestId('CloseIcon')?.click();
  });
  test('renders correctly (ERROR)', () => {
    render(
      <StoreProvider>
        <StandardAlert
          closeFunc={mockActionClose}
          color={AlertColorTypes.Error}
          testId={''}
          text={''}
        />
      </StoreProvider>
    );
    screen.queryByTestId('CloseIcon')?.click();
  });
});
