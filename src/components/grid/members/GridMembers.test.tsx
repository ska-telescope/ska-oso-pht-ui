import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import GridMembers from './GridMembers';

describe('<GridMembers />', () => {
  test('renders correctly', () => {
    render(<GridMembers />);
  });
  test('renders correctly, rows, no action', () => {
    render(
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
    render(
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
