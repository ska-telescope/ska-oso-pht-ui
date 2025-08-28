import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResizablePanel from './ResizablePanel';

describe('ResizablePanel', () => {
  it('renders without crashing', () => {
    render(<ResizablePanel title="Test Title">Test Content</ResizablePanel>);
    expect(screen.getByTestId('resizable-panel')).toBeInTheDocument();
  });

  it('displays the correct title', () => {
    render(<ResizablePanel title="My Panel">Content</ResizablePanel>);
    expect(screen.getByTestId('panel-title')).toHaveTextContent('My Panel');
  });

  it('renders children correctly', () => {
    render(<ResizablePanel title="Panel">Hello World</ResizablePanel>);
    expect(screen.getByTestId('panel-content')).toHaveTextContent('Hello World');
  });

  it('has correct styles applied', () => {
    const { getByTestId } = render(<ResizablePanel title="Styled">Styled Content</ResizablePanel>);
    const panel = getByTestId('resizable-panel');
    expect(panel).toHaveStyle('resize: both');
    expect(panel).toHaveStyle('overflow: auto');
    expect(panel).toHaveStyle('border-radius: 16px');
  });
});
