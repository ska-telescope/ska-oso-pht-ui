import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StoreProvider } from '@utils/storage/store';
import ContinuumSubtractionField from './continuumSubtraction';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('ContinuumSubtractionField', () => {
  it('renders the component with the correct label', () => {
    wrapper(<ContinuumSubtractionField value={true} />);
    expect(screen.getByText('continuumSubtraction.label')).toBeInTheDocument();
  });
});
