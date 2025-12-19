import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import StatusArray from './StatusArray';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<StatusArray />', () => {
  test('renders correctly', () => {
    const mockUpdateCanSubmit = vi.fn();
    const mockAccessCanSubmit = true;

    wrapper(
      <StatusArray updateCanSubmit={mockUpdateCanSubmit} accessCanSubmit={mockAccessCanSubmit} />
    );
  });
});
