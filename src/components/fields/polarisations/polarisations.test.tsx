import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
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

  it('allows deselecting the last checked option and reports a validation error', () => {
    const setError = vi.fn();

    // A controlled wrapper mirroring how the real parent (DataProduct.tsx) wires this field -
    // setValue must actually reach the checkbox's `checked` prop for the deselect to stick.
    const Controlled = () => {
      const [value, setValue] = useState(['I']);
      return <PolarisationsField value={value} setValue={setValue} setError={setError} />;
    };
    wrapper(<Controlled />);

    const checkbox = within(screen.getByTestId('polarisationsI')).getByRole(
      'checkbox'
    ) as HTMLInputElement;
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(setError).toHaveBeenLastCalledWith('polarisations.error');
  });
});
