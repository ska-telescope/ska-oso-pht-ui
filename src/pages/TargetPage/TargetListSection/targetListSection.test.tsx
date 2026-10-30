import { afterEach, describe, it, expect, vi, beforeEach } from 'vitest';
import ProposalFormProvider from '@/models/proposals/ProposalFormProvider';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useFormContext, UseFormReturn } from 'react-hook-form';
import { ProposalType } from '@/models/proposals/proposal';
import { VELOCITY_TYPE } from '@utils/constants.ts';
import '@testing-library/jest-dom';
import { StoreProvider } from '@utils/storage/store';
import TargetListSection from './targetListSection';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

// Exposes the global form, which holds the targets, links and calibration
let formProbe: UseFormReturn<ProposalType>;
const FormProbe = ({ onForm }: { onForm: (form: UseFormReturn<ProposalType>) => void }) => {
  onForm(useFormContext<ProposalType>());
  return null;
};
const keepForm = (form: UseFormReturn<ProposalType>) => {
  formProbe = form;
};

const tree = (component: React.ReactElement | null) => (
  <StoreProvider>
    <ProposalFormProvider>
      <FormProbe onForm={keepForm} />
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </ProposalFormProvider>
  </StoreProvider>
);

const wrapper = (component: React.ReactElement) => render(tree(component));

// The icon's test ID is on a wrapper around its button
const clickIcon = (testId: string, index: number) =>
  fireEvent.click(within(screen.getAllByTestId(testId)[index]).getByRole('button'));

// Mock proposal data
const mockProposal = {
  targets: [
    {
      id: '1',
      kind: 0,
      name: 'Target1',
      raStr: '12:00',
      decStr: '-45:00',
      vel: '1000',
      redshift: '0.01',
      velType: 'velocity'
    }
  ],
  targetObservation: [{ targetId: '1' }],
  calibrationStrategy: [] as unknown[]
};

vi.mock('@utils/storage/store', () => ({
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
      maxTargets: 1,
      maxObservations: 1
    }
  })
}));

describe('<TargetListSection />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    wrapper(<TargetListSection />);
    expect(screen.getByTestId('addTargetButton')).toBeInTheDocument();
  });

  it('switches tabs correctly', () => {
    wrapper(<TargetListSection />);
  });

  it('renders all FieldWrapper content', () => {
    wrapper(<TargetListSection />);

    expect(screen.getByText('Target1')).toBeInTheDocument();
    expect(screen.getByText('12:00')).toBeInTheDocument();
    expect(screen.getByText('-45:00')).toBeInTheDocument();
    expect(screen.getByText('0.01')).toBeInTheDocument();
  });

  describe('changing targets through the form', () => {
    // Valid coordinates, so the edit dialog's fields have no errors and it can be confirmed
    const target1 = {
      ...mockProposal.targets[0],
      raStr: '12:00:00.000',
      decStr: '-45:00:00.000',
      velType: VELOCITY_TYPE.VELOCITY
    };
    const target2 = { ...target1, id: '2', name: 'Target2' };
    const strategy = (observationIdRef: string) => ({
      observatoryDefined: true,
      id: `cal-${observationIdRef}`,
      observationIdRef,
      calibrators: null,
      notes: null
    });
    const original = { ...mockProposal };

    beforeEach(() => {
      Object.assign(mockProposal, {
        targets: [target1, target2],
        targetObservation: [
          { targetId: '1', observationId: 'o1', dataProductsSDPId: 'sdp1' },
          { targetId: '2', observationId: 'o2', dataProductsSDPId: 'sdp2' }
        ],
        calibrationStrategy: [strategy('o1'), strategy('o2')]
      });
    });

    afterEach(() => {
      Object.assign(mockProposal, original);
    });

    it('removes a deleted target with its links and calibration', async () => {
      wrapper(<TargetListSection />);

      clickIcon('trashIcon', 0);
      fireEvent.click(await screen.findByTestId('dialogConfirmationButton'));

      await waitFor(() => {
        expect(formProbe.getValues('targets').map((t) => t.id)).toEqual(['2']);
      });
      expect(formProbe.getValues('targetObservation')).toEqual([
        { targetId: '2', observationId: 'o2', dataProductsSDPId: 'sdp2' }
      ]);
      expect(formProbe.getValues('calibrationStrategy')).toEqual([strategy('o2')]);
    });

    it('applies only the fields changed in the edit dialog', async () => {
      wrapper(<TargetListSection />);

      clickIcon('editIcon', 0);
      const dialog = await screen.findByRole('dialog');
      const nameInput = within(within(dialog).getByTestId('name')).getByRole('textbox');
      fireEvent.change(nameInput, { target: { value: 'Renamed' } });
      fireEvent.click(within(dialog).getByTestId('dialogConfirmationButton'));

      await waitFor(() => {
        expect(formProbe.getValues('targets')[0].name).toBe('Renamed');
      });
      // The dialog is opened with the grid row, whose display columns are kept, as before; the
      // redshift is cleared for a velocity target
      expect(formProbe.getValues('targets')[0]).toEqual({
        ...target1,
        coord1: target1.raStr,
        coord2: target1.decStr,
        name: 'Renamed',
        redshift: ''
      });
      expect(formProbe.getValues('targets')[1]).toEqual(target2);
    });

    it('keeps the changes after leaving the page and coming back', async () => {
      const { rerender } = wrapper(<TargetListSection />);

      clickIcon('trashIcon', 1);
      fireEvent.click(await screen.findByTestId('dialogConfirmationButton'));
      await waitFor(() => expect(screen.queryByText('Target2')).not.toBeInTheDocument());

      rerender(tree(null));
      rerender(tree(<TargetListSection />));

      expect(screen.getByText('Target1')).toBeInTheDocument();
      expect(screen.queryByText('Target2')).not.toBeInTheDocument();
      expect(formProbe.getValues('targets').map((t) => t.id)).toEqual(['1']);
    });
  });
});
