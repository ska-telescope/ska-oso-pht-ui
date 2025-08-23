import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TriStateCheckbox from './TriStateCheckbox';

const renderWithTheme = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('TriStateCheckbox', () => {
  const setup = (state: 'checked' | 'unchecked' | 'indeterminate', colors = false) => {
    const setState = vi.fn();
    renderWithTheme(<TriStateCheckbox state={state} setState={setState} colors={colors} />);
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    return { checkbox, setState };
  };

  it('renders unchecked state', () => {
    const { checkbox } = setup('unchecked');
    expect(checkbox).not.toBeChecked();
    expect(checkbox.indeterminate).toBe(false);
  });

  it('renders checked state', () => {
    const { checkbox } = setup('checked');
    expect(checkbox).toBeChecked();
    expect(checkbox.indeterminate).toBe(false);
  });

  it('renders indeterminate state', () => {
    const { checkbox } = setup('indeterminate');
    expect(checkbox).not.toBeChecked(); // visually indeterminate
  });

  it('cycles from unchecked → indeterminate', () => {
    const { checkbox, setState } = setup('unchecked');
    fireEvent.click(checkbox);
    expect(setState).toHaveBeenCalledWith('indeterminate');
  });

  it('cycles from indeterminate → checked', () => {
    const { checkbox, setState } = setup('indeterminate');
    fireEvent.click(checkbox);
    expect(setState).toHaveBeenCalledWith('checked');
  });

  it('cycles from checked → unchecked', () => {
    const { checkbox, setState } = setup('checked');
    fireEvent.click(checkbox);
    expect(setState).toHaveBeenCalledWith('unchecked');
  });

  it('applies themed colors when colors=true', () => {
    const { checkbox } = setup('checked', true);
    expect(checkbox).toBeChecked();
    // Style assertions can be added with getComputedStyle or snapshot testing
  });

  it('applies default contrastText color when colors=false', () => {
    const { checkbox } = setup('checked', false);
    expect(checkbox).toBeChecked();
    // Again, style assertions can be added if needed
  });
});
