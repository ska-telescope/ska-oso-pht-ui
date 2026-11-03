import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@utils/storage/store';
import TeamPage from './TeamPage';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import { FormProvider, useForm } from 'react-hook-form';
import { ProposalType } from '@/models/proposals/proposal';
import Investigator from '@/utils/types/investigator';
import { storageObject } from '@utils/storage/store';
import { PAGE_TEAM, STATUS_ERROR, STATUS_OK } from '@/utils/constants';
import { waitFor } from '@testing-library/react';
import { MockUserFrontendList } from '@services/axios/get/getUserByEmail/mockUserFrontend';

const wrapper = (component: React.ReactElement, investigators: Investigator[] = []) => {
  const FormWrapper = () => {
    const methods = useForm<ProposalType>({
      defaultValues: {
        title: '',
        proposalType: null,
        observingMode: null,
        abstract: '',
        scienceCategory: null,
        investigators
      }
    });
    return (
      <StoreProvider>
        <FormProvider {...methods}>
          <ThemeA11yProvider>
            {component}
            <ProposalPageStatus />
          </ThemeA11yProvider>
        </FormProvider>
      </StoreProvider>
    );
  };
  return render(<FormWrapper />);
};

const ProposalPageStatus = () => {
  const { application } = storageObject.useStore();
  return <output data-testid="proposalPageStatus">{JSON.stringify(application.content1)}</output>;
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

describe('<TeamPage />', () => {
  test('renders correctly', async () => {
    wrapper(<TeamPage />);
    await waitFor(() => {
      const status = JSON.parse(screen.getByTestId('proposalPageStatus').textContent ?? '[]');
      expect(status[PAGE_TEAM]).toBe(STATUS_ERROR);
    });
  });

  test('renders investigators and marks the page complete from form state', async () => {
    const investigator = MockUserFrontendList[0];
    wrapper(<TeamPage />, [investigator]);

    expect(screen.getByText(investigator.firstName)).toBeInTheDocument();
    await waitFor(() => {
      const status = JSON.parse(screen.getByTestId('proposalPageStatus').textContent ?? '[]');
      expect(status[PAGE_TEAM]).toBe(STATUS_OK);
    });
  });
});
