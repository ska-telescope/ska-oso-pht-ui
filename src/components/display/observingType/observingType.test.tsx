import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import ObservingType from './observingType';
import { TYPE_CONTINUUM } from '@/utils/constants';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

describe('<ObservingType />', () => {
  test('renders correctly', () => {
    wrapper(<ObservingType type={TYPE_CONTINUUM} />);
  });
});
