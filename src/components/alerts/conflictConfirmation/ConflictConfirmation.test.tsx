import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
import '@testing-library/jest-dom';
import ConflictConfirmation from './ConflictConfirmation';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

describe('<ConflictConfirmation />', () => {
  const mockActionConfirm = vi.fn();
  const mockActionClose = vi.fn();
  test('renders if null proposal', () => {
    wrapper(
      <ConflictConfirmation proposal={null} open={false} onClose={vi.fn()} onConfirm={vi.fn()} />
    );
  });
  test('renders correctly', () => {
    wrapper(
      <ConflictConfirmation
        proposal={{
          id: '',
          title: '',
          status: '',
          lastUpdated: '',
          cycle: '',
          proposalType: 'standard_proposal',
          scienceCategory: '1',
          observingType: null,
          investigators: []
        }}
        open={true}
        onClose={mockActionClose}
        onConfirm={mockActionConfirm}
      />
    );
  });
});
