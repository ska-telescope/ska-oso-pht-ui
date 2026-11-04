import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ResizablePanel from './ResizablePanel';

const theme = createTheme();

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('ResizablePanel', () => {
  it('renders the panel container named by its title', () => {
    renderWithTheme(<ResizablePanel title="Test Title">Content</ResizablePanel>);
    const panel = screen.getByRole('region', { name: 'Test Title' });
    expect(panel).toBeInTheDocument();
  });

  it('renders the title correctly', () => {
    renderWithTheme(<ResizablePanel title="My Panel">Content</ResizablePanel>);
    expect(screen.getByRole('heading', { name: 'My Panel' })).toBeInTheDocument();
  });

  it('renders the children inside panel content', () => {
    renderWithTheme(<ResizablePanel title="Panel">Hello World</ResizablePanel>);
    const panel = screen.getByRole('region', { name: 'Panel' });
    expect(panel).toHaveTextContent('Hello World');
  });
});
