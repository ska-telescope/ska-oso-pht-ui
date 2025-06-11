import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import StandardAlert from './StandardAlert';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';

describe('<StandardAlert />', () => {
  test('renders correctly (INFO)', () => {
    render(
      <StoreProvider>
        <StandardAlert color={AlertColorTypes.Info} testId={''} text={''} />
      </StoreProvider>
    );
  });
  test('renders correctly (WARNING)', () => {
    render(
      <StoreProvider>
        <StandardAlert color={AlertColorTypes.Warning} testId={''} text={''} />
      </StoreProvider>
    );
  });
  test('renders correctly (ERROR)', () => {
    render(
      <StoreProvider>
        <StandardAlert color={AlertColorTypes.Error} testId={''} text={''} />
      </StoreProvider>
    );
  });
});
