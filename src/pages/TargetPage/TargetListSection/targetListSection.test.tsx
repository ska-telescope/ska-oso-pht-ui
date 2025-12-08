import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import TargetListSection from './targetListSection';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>
        <ThemeA11yProvider>{component}</ThemeA11yProvider>
      </AppFlowProvider>
    </StoreProvider>
  );
};

// Mock proposal data
const mockProposal = {
  targets: [
    {
      id: '1',
      name: 'Target1',
      raStr: '12:00',
      decStr: '-45:00',
      vel: '1000',
      redshift: '0.01',
      velType: 'velocity'
    }
  ],
  targetObservation: [{ targetId: '1' }]
};

vi.mock('@ska-telescope/ska-gui-local-storage', () => ({
  storageObject: {
    useStore: () => ({
      application: { content2: mockProposal },
      help: {
        component: 'This is help text'
      },
      helpComponent: vi.fn(),
      helpComponentURL: vi.fn(),
      updateAppContent2: vi.fn()
    })
  },
  StoreProvider: ({ children }: any) => <>{children}</>
}));

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({
    osdCycleId: 'CYCLE-1',
    osdCyclePolicy: {
      linkObservationToObservingMode: true
    }
  })
}));

describe('<TargetListSection />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    wrapper(<TargetListSection />);
    expect(screen.getByTestId('referenceFrame')).toBeInTheDocument();
    expect(screen.getByTestId('addTargetButton')).toBeInTheDocument();
  });

  it('switches tabs correctly', () => {
    wrapper(<TargetListSection />);

    // fireEvent.click(screen.getByText('importFromFile.label'));
    // expect(screen.getByTestId('csvUpload')).toBeInTheDocument();

    // fireEvent.click(screen.getByText('spatialImaging.label'));
    // expect(screen.getByTestId('spatial-imaging')).toBeInTheDocument();
  });

  it.skip('opens delete dialog and shows alert content', () => {
    wrapper(<TargetListSection />);

    fireEvent.click(screen.getByText('Delete'));
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('alert')).toHaveTextContent('deleteTarget.info');
  });

  it.skip('opens edit dialog and shows TargetEntry', () => {
    wrapper(<TargetListSection />);

    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    // expect(screen.getByTestId('target-entry')).toBeInTheDocument();
  });

  it.skip('renders all FieldWrapper content', () => {
    wrapper(<TargetListSection />);

    expect(screen.getAllByTestId('fieldWrapperTestId')).toHaveLength(5);
    expect(screen.getByText('Target1')).toBeInTheDocument();
    expect(screen.getByText('12:00')).toBeInTheDocument();
    expect(screen.getByText('-45:00')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('0.01')).toBeInTheDocument();
  });
});
