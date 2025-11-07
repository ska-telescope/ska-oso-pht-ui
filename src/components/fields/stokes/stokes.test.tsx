import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { AppFlowProvider } from '@utils/appFlow/AppFlowContext.tsx';
import StokesField from './stokes';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('StokesField', () => {
  it('renders the component with the correct label', () => {
    wrapper(<StokesField value="I" />);
    expect(screen.getByText('stokes.I')).toBeInTheDocument();
  });
});
