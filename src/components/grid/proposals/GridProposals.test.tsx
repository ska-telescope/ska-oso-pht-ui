import { describe, test, expect } from 'vitest';
// import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
// import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
// import axios from 'axios';
import { /*GridProposals, */ /*filterProposals,*/ getProposalType } from './GridProposals';
// import MockProposalFrontendList from '@/services/axios/getProposalList/mockProposalFrontendList';

describe('<GridProposals />', () => {
  /*
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
*/

  describe('Get proposal type', () => {
    test('retrieves type correctly', () => {
      const type = getProposalType(1);
      expect(type).toBe('standard_proposal');
    });

    test('returns an empty string when no match', () => {
      const type = getProposalType(999);
      expect(type).toBe('');
    });
  });

  /*

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
  */
});
