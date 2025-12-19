import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PixelSizeField from '@components/fields/pixelSize/pixelSize.tsx';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('PixelSizeField', () => {
  it('renders the component with the correct label', () => {
    wrapper(<PixelSizeField value={10} />);
    expect(screen.getByText('pixelSize.label')).toBeInTheDocument();
  });

  it('renders the suffix if provided', () => {
    wrapper(<PixelSizeField value={10} suffix="px" />);
    expect(screen.getByText('px')).toBeInTheDocument();
  });

  it('renders the required indicator if required is true', () => {
    wrapper(<PixelSizeField value={10} required />);
    expect(screen.getByText('pixelSize.label *')).toBeInTheDocument();
  });
});
