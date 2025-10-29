import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ResizablePanel from './ResizablePanel';

const theme = createTheme();

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('ResizablePanel', () => {
  it('renders the panel container with correct test ID', () => {
    renderWithTheme(<ResizablePanel title="Test Title">Content</ResizablePanel>);
    const panel = screen.getByTestId('resizable-panel');
    expect(panel).toBeInTheDocument();
  });

  it('renders the title correctly', () => {
    renderWithTheme(<ResizablePanel title="My Panel">Content</ResizablePanel>);
    const title = screen.getByTestId('panel-title');
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('My Panel');
  });

  it('renders the children inside panel content', () => {
    renderWithTheme(<ResizablePanel title="Panel">Hello World</ResizablePanel>);
    const content = screen.getByTestId('panel-content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent('Hello World');
  });

  it('applies correct styles to the container', () => {
    renderWithTheme(<ResizablePanel title="Styled Panel">Content</ResizablePanel>);
    const panel = screen.getByTestId('resizable-panel');
    // expect(panel).toHaveStyle('width: 30vw');
    // expect(panel).toHaveStyle('height: 30vh');
    expect(panel).toHaveStyle('overflow: auto');
    expect(panel).toHaveStyle('resize: both');
    // expect(panel).toHaveStyle('border: 1px solid #ccc');
    expect(panel).toHaveStyle('border-radius: 16px');
  });
});
