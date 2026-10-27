import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StoreProvider } from '@utils/storage/store';
import Shell from './Shell';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import { getProposalSchema, ProposalType } from '@/models/proposals/proposal';

const wrapper = (component: React.ReactElement) => {
  const FormWrapper = () => {
    const methods = useForm<ProposalType>({
      mode: 'all',
      resolver: zodResolver(getProposalSchema()),
      defaultValues: { title: '' }
    });
    return (
      <StoreProvider>
        <ThemeA11yProvider>
          <FormProvider {...methods}>{component}</FormProvider>
        </ThemeA11yProvider>
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

describe('<Shell />', () => {
  test('renders correctly', () => {
    wrapper(<Shell page={0} />);
  });
});
