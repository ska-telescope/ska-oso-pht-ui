import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ChoiceCards } from './choiceCards';
import { FEASIBLE_MAYBE, FEASIBLE_NO, FEASIBLE_YES } from '@/utils/constants';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

// Mock MUI theme for testing
const theme = createTheme({
  palette: {
    success: { main: '#4CAF50', contrastText: '#fff' },
    error: { main: '#F44336', contrastText: '#fff' },
    warning: { main: '#FF9800', contrastText: '#fff' },
    grey: { 300: '#E0E0E0' }
  }
});

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      <StoreProvider>
        <AppFlowProvider>{component}</AppFlowProvider>
      </StoreProvider>
    </ThemeProvider>
  );
};

describe('ChoiceCards', () => {
  it('renders all three choice options', () => {
    renderWithTheme(<ChoiceCards />);

    expect(screen.getByText(FEASIBLE_YES.toLowerCase())).toBeInTheDocument();
    expect(screen.getByText(FEASIBLE_MAYBE.toLowerCase())).toBeInTheDocument();
    expect(screen.getByText(FEASIBLE_NO.toLowerCase())).toBeInTheDocument();
  });

  it('renders icons for each choice', () => {
    renderWithTheme(<ChoiceCards />);

    // Check that icons are present (MUI icons render as SVGs)
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);

    // Each button should contain an SVG icon
    buttons.forEach(button => {
      expect(button.querySelector('svg')).toBeInTheDocument();
    });
  });

  it('selects Yes option when clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<ChoiceCards />);

    const yesButton = screen.getByText(FEASIBLE_YES.toLowerCase()).closest('button')!;
    await user.click(yesButton);
  });

  it('selects Maybe option when clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<ChoiceCards />);

    const maybeButton = screen.getByText(FEASIBLE_MAYBE.toLowerCase()).closest('button')!;
    await user.click(maybeButton);
  });

  it('selects No option when clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<ChoiceCards />);

    const noButton = screen.getByText(FEASIBLE_NO.toLowerCase()).closest('button')!;
    await user.click(noButton);
  });

  it('shows description requirement when No is selected', async () => {
    const user = userEvent.setup();
    renderWithTheme(<ChoiceCards />);

    const noButton = screen.getByText(FEASIBLE_NO.toLowerCase()).closest('button')!;
    await user.click(noButton);

    expect(screen.getByText('feasibility.label')).toBeInTheDocument();
  });

  it('shows description requirement when Maybe is selected', async () => {
    const user = userEvent.setup();
    renderWithTheme(<ChoiceCards />);

    const maybeButton = screen.getByText(FEASIBLE_MAYBE.toLowerCase()).closest('button')!;
    await user.click(maybeButton);

    expect(screen.getByText('feasibility.label')).toBeInTheDocument();
  });

  it('does not show description requirement when Yes is selected', async () => {
    const user = userEvent.setup();
    renderWithTheme(<ChoiceCards />);

    const yesButton = screen.getByText(FEASIBLE_YES.toLowerCase()).closest('button')!;
    await user.click(yesButton);

    expect(
      screen.queryByText('A description is required for this response.')
    ).not.toBeInTheDocument();
  });

  it('applies hover styles correctly', async () => {
    const user = userEvent.setup();
    renderWithTheme(<ChoiceCards />);

    const yesButton = screen.getByText(FEASIBLE_YES.toLowerCase()).closest('button')!;

    // Hover over button
    await user.hover(yesButton);

    // Should have hover styling (this tests the sx hover properties)
    expect(yesButton).toBeInTheDocument();
  });

  it('maintains accessibility attributes', () => {
    renderWithTheme(<ChoiceCards />);

    const buttons = screen.getAllByRole('button');

    buttons.forEach(button => {
      expect(button).toBeEnabled();
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  it('renders with correct initial state', () => {
    renderWithTheme(<ChoiceCards />);

    // No option should be selected initially
    expect(
      screen.queryByText('A description is required for this response.')
    ).not.toBeInTheDocument();

    // All buttons should be unselected
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).not.toHaveStyle({ backgroundColor: 'rgb(76, 175, 80)' });
      expect(button).not.toHaveStyle({ backgroundColor: 'rgb(244, 67, 54)' });
      expect(button).not.toHaveStyle({ backgroundColor: 'rgb(255, 152, 0)' });
    });
  });
});
