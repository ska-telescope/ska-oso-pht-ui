import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import TimedAlert from './TimedAlert';
import { useNotify } from '@/utils/notify/useNotify';

vi.mock('@/utils/notify/useNotify', () => ({
  useNotify: vi.fn()
}));

const mockNotifyClear = vi.fn();

beforeEach(() => {
  vi.useFakeTimers();
  (useNotify as any).mockReturnValue({ notifyClear: mockNotifyClear });
});

afterEach(() => {
  vi.clearAllTimers();
  vi.resetAllMocks();
});

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('TimedAlert', () => {
  const testId = 'alert-test';
  const text = 'This is a test alert';

  it('renders and auto-dismisses for Info alert', async () => {
    wrapper(<TimedAlert color={AlertColorTypes.Info} testId={testId} text={text} delay={1} />);
    expect(screen.getByTestId(testId)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000); // 1 * SECS
    });

    expect(mockNotifyClear).toHaveBeenCalled();
    expect(screen.queryByTestId(testId)).not.toBeInTheDocument();
  });

  it('renders and auto-dismisses for Success alert', async () => {
    wrapper(<TimedAlert color={AlertColorTypes.Success} testId={testId} text={text} delay={1} />);
    expect(screen.getByTestId(testId)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(mockNotifyClear).toHaveBeenCalled();
    expect(screen.queryByTestId(testId)).not.toBeInTheDocument();
  });

  it('renders and does not auto-dismiss for Error alert', async () => {
    wrapper(<TimedAlert color={AlertColorTypes.Error} testId={testId} text={text} />);
    expect(screen.getByTestId(testId)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(6000); // Wait longer than default delay
    });

    expect(mockNotifyClear).not.toHaveBeenCalled();
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  it('renders and does not auto-dismiss for Warning alert', async () => {
    wrapper(<TimedAlert color={AlertColorTypes.Warning} testId={testId} text={text} />);
    expect(screen.getByTestId(testId)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(mockNotifyClear).not.toHaveBeenCalled();
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });
});
