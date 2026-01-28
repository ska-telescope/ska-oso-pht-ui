import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import ObservingBand from './observingBand';
import { SA_AA2, TELESCOPE_LOW_NUM } from '@/utils/constants';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

describe('<ObservingBand />', () => {
  test('renders correctly', () => {
    wrapper(<ObservingBand telescope={TELESCOPE_LOW_NUM} band={SA_AA2} />);
  });
});
