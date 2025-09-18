import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import TargetNoSpecificSection from './targetNoSpecificSection';

describe('<TargetNoSpecificSection />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <TargetNoSpecificSection />
      </StoreProvider>
    );
  });
});
