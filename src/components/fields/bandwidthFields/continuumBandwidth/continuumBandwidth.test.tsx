import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import * as bandwidthValidationCommon from '../bandwidthValidationCommon';
import ContinuumBandwidth from './continuumBandwidth';
import { BAND_LOW_STR } from '@/utils/constants';

// --- Mocks declared at top level so Vitest hoisting works ---
vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string, opts?: any) => `${key}${opts ? JSON.stringify(opts) : ''}`
  })
}));

vi.mock('@/utils/appFlow/AppFlowContext', () => ({
  AppFlowProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAppFlow: () => ({ appFlow: 'Testing' })
}));

vi.mock('@/utils/OSDConstants.ts', () => ({
  OB_SUBARRAY_AA2: 1,
  OB_SUBARRAY_AA3: 2,
  OB_SUBARRAY_AA4: 3
}));

vi.mock('@/utils/constants.ts', () => ({
  TELESCOPE_MID: { code: 'MID' },
  TELESCOPE_LOW: { code: 'LOW' },
  TELESCOPE_LOW_NUM: 1,
  FREQUENCY_STR_HZ: 'Hz',
  LAB_IS_BOLD: true,
  LAB_POSITION: 'left',
  TYPE_CONTINUUM: 'continuum',
  ERROR_SECS: 2000,
  BAND_LOW_STR: 'low_band',
  ANTENNA_MIXED: 'mixed'
}));

vi.mock('@ska-telescope/ska-gui-components', () => ({
  LABEL_POSITION: 'start',
  TELESCOPE_MID: 'MID',
  NumberEntry: (props: any) => (
    <div data-testid={props.testId} data-errortext={props.errorText}>
      {props.value}
    </div>
  )
}));

vi.mock('@utils/osd/useOSDAccessors/useOSDAccessors.tsx', () => ({
  useOSDAccessors: () => ({
    osdMID: {},
    osdLOW: {},
    observatoryConstants: {
      array: [
        {
          value: 1,
          subarray: [{ value: 8, maxContBandwidthHz: 1000 }]
        }
      ]
    },
    findBand: vi.fn((observingBand: string) => {
      // return a fake band object for tests
      if (observingBand === BAND_LOW_STR) return { minFrequencyHz: 0, maxFrequencyHz: 1000 };
      return { minFrequencyHz: 0, maxFrequencyHz: 500 };
    })
  })
}));

vi.mock('@/utils/helpers.ts', () => ({
  getScaledBandwidthOrFrequency: vi.fn(() => 42)
}));

describe('<ContinuumBandwidth />', () => {
  const baseProps = {
    telescope: 1,
    value: 20,
    centralFrequency: 1,
    centralFrequencyUnits: 1,
    observingBand: 1,
    continuumBandwidthUnits: 2,
    setScaledBandwidth: vi.fn(),
    subarrayConfig: 8,
    minimumChannelWidthHz: 5
  };

  const renderField = (extraProps: Partial<typeof baseProps> = {}) =>
    render(
      <StoreProvider>
        <ContinuumBandwidth {...baseProps} {...extraProps} />
      </StoreProvider>
    );

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('renders correctly', () => {
    renderField();
    expect(screen.getByTestId('continuumBandwidth')).toBeInTheDocument();
  });

  test('shows no error when all checks pass', () => {
    vi.spyOn(bandwidthValidationCommon, 'checkMinimumChannelWidth').mockReturnValue(true);
    vi.spyOn(bandwidthValidationCommon, 'checkMaxContBandwidthHz').mockReturnValue(true);
    vi.spyOn(bandwidthValidationCommon, 'checkBandLimits').mockReturnValue(true);

    renderField();
    const errorText = screen.getByTestId('continuumBandwidth').getAttribute('data-errortext');
    expect(errorText).toBe('');
  });

  test('shows minimum channel width error when check fails', () => {
    vi.spyOn(bandwidthValidationCommon, 'checkMinimumChannelWidth').mockReturnValue(false);
    renderField({ minimumChannelWidthHz: 5 });
    const errorText = screen.getByTestId('continuumBandwidth').getAttribute('data-errortext');
    expect(errorText).not.toBeNull();
    expect(errorText as string).toContain('bandwidth.range.minimumChannelWidthError');
  });

  test('shows max bandwidth error when check fails', () => {
    vi.spyOn(bandwidthValidationCommon, 'checkMinimumChannelWidth').mockReturnValue(true);
    vi.spyOn(bandwidthValidationCommon, 'checkMaxContBandwidthHz').mockReturnValue(false);
    renderField();
    const errorText = screen.getByTestId('continuumBandwidth').getAttribute('data-errortext');
    expect(errorText).not.toBeNull();
    expect(errorText as string).toContain('bandwidth.range.contMaximumExceededError');
  });

  test('shows band limits error when check fails', () => {
    vi.spyOn(bandwidthValidationCommon, 'checkMinimumChannelWidth').mockReturnValue(true);
    vi.spyOn(bandwidthValidationCommon, 'checkMaxContBandwidthHz').mockReturnValue(true);
    vi.spyOn(bandwidthValidationCommon, 'checkBandLimits').mockReturnValue(false);
    renderField();
    const errorText = screen.getByTestId('continuumBandwidth').getAttribute('data-errortext');
    expect(errorText).not.toBeNull();
    expect(errorText as string).toContain('bandwidth.range.rangeError');
  });
});
