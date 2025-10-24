import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { MemoryRouter } from 'react-router-dom';
import PHT from './PHT';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <StoreProvider>
        <AppFlowProvider>{component}</AppFlowProvider>
      </StoreProvider>
    </MemoryRouter>
  );
};

describe('<PHT />', () => {
  test('renders correctly', () => {
    wrapper(<PHT />);
  });
});
