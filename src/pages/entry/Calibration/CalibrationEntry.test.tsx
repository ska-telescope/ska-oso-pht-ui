import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CalibrationEntry from './CalibrationEntry';
import { MemoryRouter } from 'react-router-dom';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

// ----------------------
// MOCKS
// ----------------------

vi.mock('@ska-telescope/ska-login-page', () => ({
  isLoggedIn: vi.fn(() => true)
}));

vi.mock('@ska-telescope/ska-gui-local-storage', () => ({
  storageObject: {
    useStore: () => ({
      application: {
        content2: {
          targets: [{ id: 'T1', name: 'Target A' }],
          targetObservation: [{ targetId: 'T1' }],
          observations: [
            {
              supplied: { type: 1, units: 1, value: 10 }
            }
          ]
        }
      },
      updateAppContent2: vi.fn()
    })
  }
}));

vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string) => key // identity mock
  })
}));

vi.mock('@/utils/help/useHelp', () => ({
  useHelp: () => ({
    setHelp: vi.fn()
  })
}));

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({
    observatoryConstants: {
      Supplied: [{ units: [{ label: 'min' }] }, { units: [{ label: 'sec' }] }]
    },
    osdCyclePolicy: { calibrationFactoryDefined: false }
  })
}));

vi.mock('@/services/axios/get/getCalibratorList/getCalibratorList', () => ({
  default: vi.fn(async () => [
    {
      name: 'Calibrator X',
      durationMin: 5,
      calibrationIntent: 'TestIntent'
    }
  ])
}));

// ----------------------
// TESTS
// ----------------------

const wrapper = (component: React.ReactElement) => {
  const theme = createTheme();
  return render(
    <MemoryRouter>
      <ThemeA11yProvider>
        <ThemeProvider theme={theme}>{component}</ThemeProvider>
      </ThemeA11yProvider>
    </MemoryRouter>
  );
};

describe('CalibrationEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    wrapper(<CalibrationEntry />);

    expect(screen.getByText('calibrator.desc')).toBeInTheDocument();
  });

  it('shows the warning alert when proposal has targets', async () => {
    wrapper(<CalibrationEntry />);

    const alert = await screen.findByText('calibrator.limitReached');
    expect(alert).toBeInTheDocument();
  });
});
