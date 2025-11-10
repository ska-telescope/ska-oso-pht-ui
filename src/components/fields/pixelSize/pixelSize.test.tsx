import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PixelSizeField from '@components/fields/pixelSize/pixelSize.tsx';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { AppFlowProvider } from '@utils/appFlow/AppFlowContext.tsx';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('PixelSizeField', () => {
  it('renders the component with the correct label', () => {
    wrapper(<PixelSizeField label="Pixel Size" testId="pixel-size-field" value={10} />);
    expect(screen.getByText('Pixel Size')).toBeInTheDocument();
  });

  it('renders the suffix if provided', () => {
    wrapper(<PixelSizeField testId="pixel-size-field" value={10} suffix="px" />);
    expect(screen.getByText('px')).toBeInTheDocument();
  });

  it('renders the required indicator if required is true', () => {
    wrapper(<PixelSizeField testId="pixel-size-field" value={10} required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});
