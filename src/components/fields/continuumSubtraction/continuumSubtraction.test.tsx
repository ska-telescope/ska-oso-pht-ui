import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { AppFlowProvider } from '@utils/appFlow/AppFlowContext.tsx';
import ContinuumSubtractionField from './continuumSubtraction';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('ContinuumSubtractionField', () => {
  it('renders the component with the correct label', () => {
    wrapper(<ContinuumSubtractionField value={true} />);
    expect(screen.getByText('continuumSubtraction.label')).toBeInTheDocument();
  });
});
