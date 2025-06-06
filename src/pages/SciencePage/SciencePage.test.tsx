import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import SciencePage from './SciencePage';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

describe('<SciencePage />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <SciencePage />
      </StoreProvider>
    );
  });
});
