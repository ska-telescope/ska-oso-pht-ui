import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProposalFormProvider from '@/models/proposals/ProposalFormProvider';
import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useFormContext, UseFormReturn } from 'react-hook-form';
import { ProposalType } from '@/models/proposals/proposal';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CalibrationEntry from './CalibrationEntry';
import { MemoryRouter } from 'react-router';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

// ----------------------
// MOCKS
// ----------------------

vi.mock('@ska-telescope/ska-login-page', () => ({
  isLoggedIn: vi.fn(() => true)
}));

vi.mock('@utils/storage/store', () => ({
  storageObject: {
    useStore: () => ({
      application: {
        content2: {
          targets: [{ id: 'T1', name: 'Target A' }],
          targetObservation: [{ targetId: 'T1' }],
          calibrationStrategy: [
            {
              observatoryDefined: true,
              id: 'cal-1',
              observationIdRef: 'obs-1',
              calibrators: [
                {
                  targetId: '',
                  name: 'Hercules A',
                  calibrationIntent: 'flux',
                  durationSeconds: 600,
                  selectionStrategy: 'highest_elevation',
                  relativeToScan: 'before_each_scan',
                  notes: null
                },
                {
                  targetId: '',
                  name: 'Hercules A',
                  calibrationIntent: 'flux',
                  durationSeconds: 600,
                  selectionStrategy: 'highest_elevation',
                  relativeToScan: 'after_each_scan',
                  notes: null
                }
              ],
              notes: null
            }
          ],
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

// Exposes the global form, which holds the calibration
let formProbe: UseFormReturn<ProposalType>;
const FormProbe = ({ onForm }: { onForm: (form: UseFormReturn<ProposalType>) => void }) => {
  onForm(useFormContext<ProposalType>());
  return null;
};
const keepForm = (form: UseFormReturn<ProposalType>) => {
  formProbe = form;
};

const theme = createTheme();
const tree = (component: React.ReactElement | null) => (
  <MemoryRouter>
    <ThemeA11yProvider>
      <ThemeProvider theme={theme}>
        <ProposalFormProvider>
          <FormProbe onForm={keepForm} />
          {component}
        </ProposalFormProvider>
      </ThemeProvider>
    </ThemeA11yProvider>
  </MemoryRouter>
);

const wrapper = (component: React.ReactElement) => render(tree(component));

describe('CalibrationEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    wrapper(<CalibrationEntry />);

    expect(screen.getByText('calibrator.desc')).toBeInTheDocument();
  });

  it('writes the comment to the calibration in the form, keeping its calibrators', () => {
    wrapper(<CalibrationEntry />);

    const comment = within(screen.getByTestId('commentId')).getByRole('textbox');
    fireEvent.change(comment, { target: { value: 'Please add a second scan' } });

    const [strategy] = formProbe.getValues('calibrationStrategy');
    expect(strategy.notes).toBe('Please add a second scan');
    expect(strategy.id).toBe('cal-1');
    expect(strategy.calibrators?.map((cal) => cal.relativeToScan)).toEqual([
      'before_each_scan',
      'after_each_scan'
    ]);
  });

  it('keeps the comment after leaving the page and coming back', () => {
    const { rerender } = wrapper(<CalibrationEntry />);
    fireEvent.change(within(screen.getByTestId('commentId')).getByRole('textbox'), {
      target: { value: 'Kept comment' }
    });

    rerender(tree(null));
    rerender(tree(<CalibrationEntry />));

    expect(within(screen.getByTestId('commentId')).getByRole('textbox')).toHaveValue(
      'Kept comment'
    );
  });
});
