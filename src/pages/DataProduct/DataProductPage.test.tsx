import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import DataProductPage from './DataProductPage';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

describe('<DataProductPage />', () => {
  test('renders correctly', () => {
    wrapper(<DataProductPage />);
  });
});

// TODO : Test for no observations message
// TODO : Test for DataProduct table rendering
// TODO : Test for single DataProduct rendering
