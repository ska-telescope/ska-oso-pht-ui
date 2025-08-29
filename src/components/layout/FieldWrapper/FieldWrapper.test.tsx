import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FieldWrapper from './FieldWrapper';

describe('FieldWrapper', () => {
  it('renders without crashing', () => {
    render(
      <FieldWrapper>
        <div>Test Content</div>
      </FieldWrapper>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    render(
      <FieldWrapper>
        <span>Child Element</span>
      </FieldWrapper>
    );
    expect(screen.getByText('Child Element')).toBeInTheDocument();
  });

  it('applies correct styles', () => {
    const { container } = render(
      <FieldWrapper>
        <div />
      </FieldWrapper>
    );
    const box = container.firstChild as HTMLElement;
    expect(box).toHaveStyle('padding-top: 8px'); // pt={1} = 8px in MUI default theme
    expect(box).toHaveStyle('height: 75px'); // WRAPPER_HEIGHT
  });
});
