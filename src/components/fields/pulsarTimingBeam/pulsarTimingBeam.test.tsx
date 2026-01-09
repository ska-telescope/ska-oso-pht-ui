// PulsarTimingBeamField.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import PulsarTimingBeamField from './PulsarTimingBeam';
import Target from '@/utils/types/target';

// Mock translation hook
vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string) => key // return key as label
  })
}));

// Mock help hook
vi.mock('@/utils/help/useHelp', () => ({
  useHelp: () => ({
    setHelp: vi.fn()
  })
}));

vi.mock('@/utils/constants.ts', () => ({
  LAB_POSITION: 'start',
  RA_TYPE_ICRS: { value: 'icrs', label: 'ICRS' }
}));

// Mock child components that are not critical for test
vi.mock('@ska-telescope/ska-gui-components', () => ({
  DataGrid: (props: any) => <div data-testid={props.testId}>DataGrid rows={props.rows.length}</div>,
  TextEntry: (props: any) => (
    <input
      data-testid={props.testId}
      value={props.value}
      onChange={e => props.setValue(e.target.value)}
    />
  ),
  LABEL_POSITION: 'start',
  TELESCOPE_MID: 'MID'
}));

vi.mock('@components/button/Add/Add.tsx', () => ({
  default: (props: any) => (
    <button data-testid={props.testId} onClick={props.action}>
      AddButton
    </button>
  )
}));

vi.mock('@components/alerts/alertDialog/AlertDialog.tsx', () => ({
  default: (props: any) =>
    props.open ? (
      <div data-testid="alertDialog">
        <button onClick={props.onDialogResponse}>Confirm</button>
        <button onClick={props.onClose}>Close</button>
        {props.children}
      </div>
    ) : null
}));

vi.mock('@components/button/Resolve/Resolve.tsx', () => ({
  default: (props: any) => (
    <button data-testid={props.testId} disabled={props.disabled} onClick={props.action}>
      ResolveButton
    </button>
  )
}));

vi.mock('@/components/fields/skyDirection/SkyDirection1', () => ({
  default: (props: any) => (
    <input
      data-testid="skyDirection1"
      value={props.value}
      onChange={e => props.setValue(e.target.value)}
    />
  )
}));

vi.mock('@/components/fields/skyDirection/SkyDirection2', () => ({
  default: (props: any) => (
    <input
      data-testid="skyDirection2"
      value={props.value}
      onChange={e => props.setValue(e.target.value)}
    />
  )
}));

describe('PulsarTimingBeamField', () => {
  const theme = createTheme();

  it('renders radio buttons', () => {
    render(
      <ThemeProvider theme={theme}>
        <PulsarTimingBeamField />
      </ThemeProvider>
    );

    expect(screen.getByTestId('NoBeamTestId')).toBeInTheDocument();
    expect(screen.getByTestId('MultipleBeamsTestId')).toBeInTheDocument();
  });

  it('shows DataGrid when multipleBeams selected and beams exist', () => {
    const target: Target = {
      id: 123,
      name: 'TestTarget',
      redshift: '0.0',
      velType: 0,
      vel: '0',
      velUnit: 1,
      kind: 1
      // Add other required properties with dummy values if needed
      // For example, if Target has more required fields, add them here
    };

    render(
      <ThemeProvider theme={theme}>
        <PulsarTimingBeamField target={target} showBeamData />
      </ThemeProvider>
    );

    expect(screen.getByTestId('pulsarTimingBeamColumns')).toBeInTheDocument();
  });

  it('opens dialog when AddButton clicked', () => {
    render(
      <ThemeProvider theme={theme}>
        <PulsarTimingBeamField />
      </ThemeProvider>
    );

    // Select multipleBeams
    fireEvent.click(screen.getByTestId('MultipleBeamsTestId'));

    // Click AddButton
    fireEvent.click(screen.getByTestId('addPulsarTimingBeamButton'));

    expect(screen.getByTestId('alertDialog')).toBeInTheDocument();
  });

  it('adds a beam when dialog confirmed', () => {
    render(
      <ThemeProvider theme={theme}>
        <PulsarTimingBeamField />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByTestId('MultipleBeamsTestId'));
    fireEvent.click(screen.getByTestId('addPulsarTimingBeamButton'));

    // Fill fields
    fireEvent.change(screen.getByTestId('beamName'), { target: { value: 'BeamX' } });
    fireEvent.change(screen.getByTestId('skyDirection1'), { target: { value: '12h' } });
    fireEvent.change(screen.getByTestId('skyDirection2'), { target: { value: '-30d' } });

    // Confirm dialog
    fireEvent.click(screen.getByText('Confirm'));

    // DataGrid should appear
    expect(screen.getByTestId('pulsarTimingBeamColumns')).toBeInTheDocument();
    expect(screen.getByText(/DataGrid rows=1/)).toBeInTheDocument();
  });
});
