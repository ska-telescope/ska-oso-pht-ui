// CentralFrequency.test.tsx
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import CentralFrequency from './centralFrequency';

vi.mock(import('@/utils/constants.ts'), async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual
    // your mocked methods
  };
});

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
        onChange={e => setValue(Number(e.target.value))}
        onFocus={onFocus}
      />
      {errorText && <span data-testid="error">{errorText}</span>}
    </div>
  )
}));

describe('CentralFrequency component', () => {
  it('renders with initial value', () => {
    render(<CentralFrequency bandWidth={150} observingBand={0} value={150} setValue={vi.fn()} />);
  });
});
