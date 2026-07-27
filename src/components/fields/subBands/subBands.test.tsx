// SubBands.test.tsx
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import SubBands from './subBands';

// Mock the translation hook
vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string) => key // just return the key for testing
  })
}));

// Mock ska-gui-components once, with all needed exports
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

// Mock the help hook
const setHelpMock = vi.fn();
vi.mock('@/utils/help/useHelp', () => ({
  useHelp: () => ({
    setHelp: setHelpMock
  })
}));

describe('SubBands component', () => {
  it('renders with initial value', () => {
    render(
      <SubBands
        value={5}
        setValue={vi.fn()}
        isMid={false}
        isContinuum={false}
        continuumBandwidth={0}
        continuumBandwidthUnits={0}
        minimumChannelWidthHz={0}
      />
    );
  });
});
