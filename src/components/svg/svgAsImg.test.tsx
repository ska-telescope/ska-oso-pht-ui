import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import SvgAsImg from './svgAsImg';

describe('SvgAsImg', () => {
  it('renders an img with the correct data URI', () => {
    const svgXml = '<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" /></svg>';
    render(<SvgAsImg svgXml={svgXml} />);
    const img = screen.getByAltText('Visibility Plot') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain('data:image/svg+xml;utf8,');
  });

  it('sets the alt attribute correctly', () => {
    render(<SvgAsImg svgXml="<svg></svg>" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'Visibility Plot');
  });
});
