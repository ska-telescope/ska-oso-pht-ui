import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import axios from 'axios';
import GridProposals from './GridProposals';
import { PROPOSAL_STATUS } from '@/utils/constants';

describe('<GridProposals />', () => {
  const proposalsMock = [
    {
      id: 1,
      proposalType: 2,
      title: 'Title',
      team: [],
      scienceCategory: 1,
      status: PROPOSAL_STATUS.DRAFT
    },
    {
      id: 2,
      proposalType: 2,
      title: 'Title',
      team: ['authors'],
      scienceCategory: 1,
      status: PROPOSAL_STATUS.SUBMITTED
    }
  ];

  test('renders correctly with no mocking', () => {
    render(
      <StoreProvider>
        <GridProposals />
      </StoreProvider>
    );
  });
  test('renders correctly', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: 'Error'
    });
    render(
      <StoreProvider>
        <GridProposals />
      </StoreProvider>
    );
  });
  vi.clearAllMocks();
  test('renders correctly, forReview', () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: proposalsMock
    });
    render(
      <StoreProvider>
        <GridProposals />
      </StoreProvider>
    );

    vi.spyOn(axios, 'get').mockResolvedValue({
      data: []
    });
    render(
      <StoreProvider>
        <GridProposals forReview />
      </StoreProvider>
    );
  });
});
