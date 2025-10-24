import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import GridMembers from './GridMembers';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('<GridMembers />', () => {
  test('renders correctly', () => {
    wrapper(<GridMembers />);
  });
  test('renders correctly, rows, no action', () => {
    wrapper(
      <GridMembers
        rows={[
          {
            id: '0',
            firstName: '',
            lastName: '',
            email: '',
            country: '',
            affiliation: '',
            phdThesis: true,
            status: '',
            pi: true
          }
        ]}
      />
    );
  });
  test('renders correctly, rows and action', () => {
    wrapper(
      <GridMembers
        action
        rows={[
          {
            id: '0',
            firstName: '',
            lastName: '',
            email: '',
            country: '',
            affiliation: '',
            phdThesis: true,
            status: '',
            pi: true
          }
        ]}
      />
    );
  });
});
