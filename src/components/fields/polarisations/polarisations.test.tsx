import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import PolarisationsField from './polarisations';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('PolarisationsField', () => {
  it('renders the component with the correct label', () => {
    wrapper(<PolarisationsField value={['I']} />);
    expect(screen.getByText('polarisations.I')).toBeInTheDocument();
  });
});
