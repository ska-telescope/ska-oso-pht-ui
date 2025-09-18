import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import GridMembers from './GridMembers';

describe('<GridMembers />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <GridMembers />
      </StoreProvider>
    );
  });
  test('renders correctly, rows, no action', () => {
    render(
      <StoreProvider>
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
      </StoreProvider>
    );
  });
  test('renders correctly, rows and action', () => {
    render(
      <StoreProvider>
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
      </StoreProvider>
    );
  });
});
