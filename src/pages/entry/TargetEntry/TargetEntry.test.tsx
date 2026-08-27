import React from 'react';
import { describe, test, it, vi, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import TargetEntry from './TargetEntry';
import autoLinking from '@/utils/autoLinking/AutoLinking';
import { TYPE_ZOOM } from '@/utils/constants';
import GetCoordinates from '@services/axios/get/getCoordinates/getCoordinates';

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

vi.mock('@services/axios/get/getCoordinates/getCoordinates', () => ({
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

describe(
  '<TargetEntry /> form preservation on autoLinking error',
  () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('retains field values when the sensitivity calculator returns an error', async () => {
      const mockedAutoLinking = vi.mocked(autoLinking);

      mockedAutoLinking.mockResolvedValue({
        success: false,
        error: 'Declination not supported by sensitivity calculator'
      } as never);

      const user = userEvent.setup();

      await act(async () => {
        wrapper(<TargetEntry />);
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
        expect(mockedAutoLinking).toHaveBeenCalled();
      });

      expect(nameInput.value).toBe('My Target');
      expect(raInput.value).toBe('12:34:56.000');
      expect(decInput.value).toBe('45:00:00.000');
    }, 15000);

    it('shows a loading state while coordinates are resolving', async () => {
      const mockedGetCoordinates = vi.mocked(GetCoordinates);
      mockedGetCoordinates.mockReturnValue(new Promise(() => {}) as never);

      const user = userEvent.setup();

      await act(async () => {
        wrapper(<TargetEntry />);
      });

      const nameInput = screen.getByTestId('name').querySelector('input')!;
      await user.type(nameInput, 'Resolving target');

      await user.click(screen.getByTestId('resolveButton'));

      await waitFor(() => {
        expect(screen.queryByTestId('resolveButton')).not.toBeInTheDocument();
      });
    });

    it('ignores stale resolution responses after the form changes', async () => {
      let resolvePromiseResolver: ((value: unknown) => void) | undefined;
      const deferredResponse = new Promise<unknown>((resolve) => {
        resolvePromiseResolver = resolve;
      });

      vi.mocked(GetCoordinates).mockReturnValue(deferredResponse as never);

      const user = userEvent.setup();

      await act(async () => {
        wrapper(<TargetEntry />);
      });

      const nameInput = screen.getByTestId('name').querySelector('input')!;
      const raInput = screen.getByTestId('skyDirectionValue1').querySelector('input')!;

      await user.type(nameInput, 'Original target');
      await user.click(screen.getByTestId('resolveButton'));

      fireEvent.change(raInput, { target: { value: '11:22:33' } });

      await act(async () => {
        resolvePromiseResolver?.({
          reference_coordinate: { kind: 'icrs', ra_str: '01:02:03', dec_str: '04:05:06' },
          radial_velocity: { quantity: { value: 5 }, redshift: 0 }
        });
      });

      await waitFor(() => {
        expect(raInput.value).toBe('11:22:33');
      });
    });

    it('disables editing and clearing while coordinates are resolving', async () => {
      const mockedGetCoordinates = vi.mocked(GetCoordinates);
      mockedGetCoordinates.mockReturnValue(new Promise(() => {}) as never);

      const user = userEvent.setup();

      await act(async () => {
        wrapper(<TargetEntry />);
      });

      const nameInput = screen.getByTestId('name').querySelector('input')!;
      await user.type(nameInput, 'Resolving target');

      await user.click(screen.getByTestId('resolveButton'));

      await waitFor(() => {
        expect(nameInput).toBeDisabled();
        expect(screen.getByTestId('clearFormButton')).toBeDisabled();
      });
    });

    it('shows clear button only when at least one field has been entered', async () => {
      const user = userEvent.setup();

      await act(async () => {
        wrapper(<TargetEntry />);
      });

      expect(screen.queryByTestId('clearFormButton')).not.toBeInTheDocument();

      const nameInput = screen.getByTestId('name').querySelector('input')!;
      await user.type(nameInput, 'Temporary target');

      await waitFor(() => {
        expect(screen.getByTestId('clearFormButton')).toBeInTheDocument();
      });
    });

    it('clears entered values when clear button is clicked', async () => {
      const user = userEvent.setup();

      await act(async () => {
        wrapper(<TargetEntry />);
      });

      const nameInput = screen.getByTestId('name').querySelector('input')!;
      const raInput = screen.getByTestId('skyDirectionValue1').querySelector('input')!;
      const decInput = screen.getByTestId('skyDirectionValue2').querySelector('input')!;

      await user.type(nameInput, 'Reset me');
      await user.type(raInput, '10:20:30');
      await user.type(decInput, '40:50:00');

      await waitFor(() => {
        expect(screen.getByTestId('clearFormButton')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('clearFormButton'));

      await waitFor(() => {
        expect(nameInput.value).toBe('');
        expect(raInput.value).toBe('');
        expect(decInput.value).toBe('');
        expect(screen.queryByTestId('clearFormButton')).not.toBeInTheDocument();
      });
    });
  },
  { timeout: 10000 }
);
