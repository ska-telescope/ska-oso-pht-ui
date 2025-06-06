import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import TargetListSection from './targetListSection';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

describe('<TargetListSection />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <TargetListSection />
      </StoreProvider>
    );
  });
});
