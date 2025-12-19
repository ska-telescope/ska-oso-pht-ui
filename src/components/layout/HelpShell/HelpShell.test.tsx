import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import HelpShell from './HelpShell';
import { PAGE_OBSERVATION_ADD } from '@/utils/constants';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<HelpShell />', () => {
  test('renders correctly', () => {
    wrapper(<HelpShell page={PAGE_OBSERVATION_ADD} />);
  });
});
