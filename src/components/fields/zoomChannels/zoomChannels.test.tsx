// ZoomChannels.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import ZoomChannels from './zoomChannels';

// Mock the translation hook
vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string) => key // just return the key for testing
  })
}));

// Mock the help hook
const setHelpMock = vi.fn();
vi.mock('@/utils/help/useHelp', () => ({
  useHelp: () => ({
    setHelp: setHelpMock
  })
}));

// Mock NumberEntry component from ska-gui-components
vi.mock('@ska-telescope/ska-gui-components', () => ({
  LABEL_POSITION: {
    CONTAINED: 'contained',
    START: 'start',
    TOP: 'top',
    BOTTOM: 'bottom',
    END: 'end'
  },
  TELESCOPE_MID: 'MID',
  TELESCOPE_LOW: 'LOW',
  NumberEntry: ({ errorText, value, setValue, onFocus, testId }: any) => (
    <div>
      <input
        data-testid={testId}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={onFocus}
      />
      {errorText && <span data-testid="error">{errorText}</span>}
    </div>
  )
}));

describe('ZoomChannels component', () => {
  it('renders with initial value', () => {
    render(<ZoomChannels value={5} setValue={vi.fn()} />);
  });

  it('strips non-digit characters from typed input', () => {
    const setValue = vi.fn();
    render(<ZoomChannels value={0} maxValue={100} setValue={setValue} />);

    fireEvent.change(screen.getByTestId('zoomChannels'), { target: { value: 'a12.3b-4e5' } });

    expect(screen.getByTestId('zoomChannels')).toHaveValue('12345');
  });
});
