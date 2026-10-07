import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
import '@testing-library/jest-dom';
import GridMembers from './GridMembers';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
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
