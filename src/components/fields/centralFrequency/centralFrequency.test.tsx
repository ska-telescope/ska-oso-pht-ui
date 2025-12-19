// CentralFrequency.test.tsx
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import CentralFrequency from './centralFrequency';
import { BAND_LOW_STR } from '@/utils/constants.ts';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

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

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

describe('CentralFrequency component', () => {
  it('renders with initial value', () => {
    wrapper(
      <CentralFrequency
        bandWidth={150}
        observingBand={BAND_LOW_STR}
        value={150}
        setValue={vi.fn()}
      />
    );
  });
});
