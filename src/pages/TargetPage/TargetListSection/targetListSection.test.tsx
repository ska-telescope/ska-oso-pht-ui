import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import TargetListSection from './targetListSection';

// Mock translations
vi.mock('react-i18next', () => ({
  useScopedTranslation: () => ({
    t: (key: string) => key
  })
}));

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
      updateAppContent2: vi.fn()
    })
  },
  StoreProvider: ({ children }: any) => <>{children}</>
}));

describe('<TargetListSection />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <StoreProvider>
        <TargetListSection />
      </StoreProvider>
    );
    expect(screen.getByTestId('referenceFrame')).toBeInTheDocument();
    expect(screen.getByTestId('addTargetButton')).toBeInTheDocument();
  });

  it('switches tabs correctly', () => {
    render(
      <StoreProvider>
        <TargetListSection />
      </StoreProvider>
    );

    // fireEvent.click(screen.getByText('importFromFile.label'));
    // expect(screen.getByTestId('csvUpload')).toBeInTheDocument();

    // fireEvent.click(screen.getByText('spatialImaging.label'));
    // expect(screen.getByTestId('spatial-imaging')).toBeInTheDocument();
  });

  /* TODO 
  it('opens delete dialog and shows alert content', () => {
    render(
      <StoreProvider>
        <TargetListSection />
      </StoreProvider>
    );

    fireEvent.click(screen.getByText('Delete'));
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('alert')).toHaveTextContent('deleteTarget.info');
  });

  it('opens edit dialog and shows TargetEntry', () => {
    render(
      <StoreProvider>
        <TargetListSection />
      </StoreProvider>
    );

    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    // expect(screen.getByTestId('target-entry')).toBeInTheDocument();
  });

  it('renders all FieldWrapper content', () => {
    render(
      <StoreProvider>
        <TargetListSection />
      </StoreProvider>
    );

    expect(screen.getAllByTestId('fieldWrapperTestId')).toHaveLength(5);
    expect(screen.getByText('Target1')).toBeInTheDocument();
    expect(screen.getByText('12:00')).toBeInTheDocument();
    expect(screen.getByText('-45:00')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('0.01')).toBeInTheDocument();
  });
  */
});
