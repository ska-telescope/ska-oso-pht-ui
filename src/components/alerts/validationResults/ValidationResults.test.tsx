import { describe, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
import '@testing-library/jest-dom';
import ValidationResults from './ValidationResults';
import { getProposalFormDefaults } from '@/models/proposals/useProposalForm';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

describe('<ValidationResults />', () => {
  test('renders correctly ( empty proposal', () => {
    const mockActionClose = vi.fn();
    wrapper(
      <ValidationResults open={false} onClose={mockActionClose} proposal={null} results={[]} />
    );
  });
  test('renders correctly', () => {
    wrapper(
      <ValidationResults
        open={true}
        onClose={vi.fn()}
        proposal={getProposalFormDefaults()}
        results={['LOOKS OK', 'NO ISSUES FOUND']}
      />
    );
    screen.queryByTestId('cancelButtonTestId')?.click();
  });
});
