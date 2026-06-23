import React from 'react';
import { describe, test, it, vi, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import TargetEntry from './TargetEntry';
import autoLinking from '@/utils/autoLinking/AutoLinking';
import { TYPE_ZOOM } from '@/utils/constants';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({
    osdCycleId: 'CYCLE-1',
    osdCyclePolicy: {
      maxTargets: 1,
      maxObservations: 1
    }
  })
}));

vi.mock('@/utils/autoLinking/AutoLinking', () => ({
  default: vi.fn()
}));

vi.mock('@ska-telescope/ska-gui-local-storage', () => ({
  storageObject: {
    useStore: () => ({
      application: {
        content2: {
          scienceCategory: TYPE_ZOOM,
          targets: [],
          observations: [],
          dataProductSDP: [],
          targetObservation: [],
          calibrationStrategy: []
        }
      },
      updateAppContent2: vi.fn(),
      updateAppContent5: vi.fn(),
      helpComponent: vi.fn(),
      helpComponentURL: vi.fn()
    })
  },
  StoreProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('<TargetEntry />', () => {
  test('renders correctly', () => {
    wrapper(<TargetEntry />);
  });
});

describe('<TargetEntry /> form preservation on autoLinking error', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retains field values when the sensitivity calculator returns an error', async () => {
    vi.mocked(autoLinking as any).mockResolvedValue({
      success: false,
      error: 'Declination not supported by sensitivity calculator'
    });

    const user = userEvent.setup();

    await act(async () => {
      wrapper(<TargetEntry/>);
    });

    const nameInput = screen.getByTestId('name').querySelector('input')!;
    const raInput = screen.getByTestId('skyDirectionValue1').querySelector('input')!;
    const decInput = screen.getByTestId('skyDirectionValue2').querySelector('input')!;

    await user.type(nameInput, 'My Target');
    await user.type(raInput, '12:34:56');
    await user.type(decInput, '45:00:00');

    await waitFor(() => {
      expect(screen.getByTestId('addTargetButton')).not.toBeDisabled();
    });

    await user.click(screen.getByTestId('addTargetButton'));

    await waitFor(() => {
      expect(vi.mocked(autoLinking as any)).toHaveBeenCalled();
    });

    expect(nameInput.value).toBe('My Target');
    expect(raInput.value).toBe('12:34:56.000');
    expect(decInput.value).toBe('45:00:00.000');
  });
});
