import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@utils/storage/store';
import SrcDataPage from './SrcDataPage';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import { FormProvider, useForm } from 'react-hook-form';
import { ProposalType } from '@/models/proposals/proposal';

const wrapper = (component: React.ReactElement) => {
  const FormWrapper = () => {
    const methods = useForm<ProposalType>({
      defaultValues: { title: '', proposalType: null }
    });
    return (
      <StoreProvider>
        <FormProvider {...methods}>
          <ThemeA11yProvider>{component}</ThemeA11yProvider>
        </FormProvider>
      </StoreProvider>
    );
  };
  return render(<FormWrapper />);
};

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({
    osdCycleId: 'CYCLE-1',
    osdCyclePolicy: {
      maxTargets: 1,
      maxObservations: 1
    }
  })
}));

describe('<SrcDataPage />', () => {
  test('renders correctly', () => {
    wrapper(<SrcDataPage />);
  });
});
