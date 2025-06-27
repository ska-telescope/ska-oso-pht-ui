import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import axios from 'axios';
import GridProposals, { filterProposals } from './GridProposals';
import { PROPOSAL_STATUS } from '@/utils/constants';
import MockProposalFrontendList from '@/services/axios/getProposalList/mockProposalFrontendList';

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
    data: MockProposalFrontendList
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

describe('filterProposals', () => {
  test('filters by title', () => {
    const result = filterProposals(MockProposalFrontendList, 'In a galaxy far, far away', null, '');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('In a galaxy far, far away');
  });

  test('filters by proposal type', () => {
    const result = filterProposals(MockProposalFrontendList, '', null, 'standard_proposal');
    expect(result).toHaveLength(3);
    expect(result[0].proposalType).toBe(1);
    expect(result[1].proposalType).toBe(1);
    expect(result[2].proposalType).toBe(1);
  });

  test('filters by science category', () => {
    const result = filterProposals(MockProposalFrontendList, '', 4, '');
    expect(result).toHaveLength(1);
    expect(result[0].proposalType).toBe(1);
  });

  test('filters by multiple criteria', () => {
    const result = filterProposals(
      MockProposalFrontendList,
      'The Milky Way View',
      null,
      'standard_proposal'
    );
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('The Milky Way View');
    expect(result[0].proposalType).toBe(1);
    expect(result[0].scienceCategory).toBe(null);
  });

  test('filters by all criteria', () => {
    const result = filterProposals(
      MockProposalFrontendList,
      'Incomplete Proposal',
      4,
      'standard_proposal'
    );
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Incomplete Proposal');
    expect(result[0].proposalType).toBe(1);
    expect(result[0].scienceCategory).toBe(4);
  });
});
