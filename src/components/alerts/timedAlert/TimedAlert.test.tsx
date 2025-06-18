import { describe, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import '@testing-library/jest-dom';
import TimedAlert from './TimedAlert';

describe('<TimedAlert />', () => {
  test('renders correctly (INFO)', () => {
    render(
      <StoreProvider>
        <TimedAlert color={AlertColorTypes.Info} delay={1} testId={''} text={''} />
      </StoreProvider>
    );
  });
  test('renders correctly (WARNING)', () => {
    render(
      <StoreProvider>
        <TimedAlert color={AlertColorTypes.Warning} testId={''} text={''} />
      </StoreProvider>
    );
  });
  test('renders correctly (ERROR)', () => {
    render(
      <StoreProvider>
        <TimedAlert color={AlertColorTypes.Error} testId={''} text={''} />
      </StoreProvider>
    );
  });
  screen.queryByTestId('CloseIcon')?.click();
});
