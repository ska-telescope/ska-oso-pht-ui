import { describe, test, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import axios from 'axios';
import GridProposals, { filterProposals, getProposalType } from './GridProposals';
import MockProposalFrontendList from '@/services/axios/getProposalList/mockProposalFrontendList';
import MockProposalBackendList from '@/services/axios/getProposalList/mockProposalBackendList';

describe('<GridProposals /> data rendering', () => {
  test('renders correctly with no mocking', () => {
    render(
      <StoreProvider>
        <GridProposals />
      </StoreProvider>
    );
    const proposalGrid = screen.queryByTestId('dataGridProposals');
    expect(proposalGrid).toBeNull();
    expect(screen.queryByTestId('helpProposalsId')).toBeDefined();
  });
  test('renders correctly with mocking data', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: MockProposalBackendList
    });
    render(
      <StoreProvider>
        <GridProposals />
      </StoreProvider>
    );
    expect(await screen.findAllByTestId('dataGridProposals')).toBeDefined();
  });
  vi.clearAllMocks();
  test('renders correctly with data error', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: 'Error'
    });
    render(
      <StoreProvider>
        <GridProposals />
      </StoreProvider>
    );
    const proposalGrid = screen.queryByTestId('dataGridProposals');
    expect(proposalGrid).toBeNull();
    expect(screen.queryByTestId('helpProposalsId')).toBeDefined();
  });
  vi.clearAllMocks();
  test('renders correctly with empty data', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: []
    });
    render(
      <StoreProvider>
        <GridProposals />
      </StoreProvider>
    );
    const proposalGrid = screen.queryByTestId('dataGridProposals');
    expect(proposalGrid).toBeNull();
    expect(screen.queryByTestId('helpProposalsId')).toBeDefined();
  });
  vi.clearAllMocks();
});

describe('<GridProposals /> forReview', () => {
  test('renders correctly, forReview true', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: MockProposalBackendList
    });
    const { container } = render(
      <StoreProvider>
        <GridProposals forReview />
      </StoreProvider>
    );
    await waitFor(() => {
      const authorsHeader = container.querySelector('[data-field="authors"]');
      expect(authorsHeader).toBeInTheDocument();
    });
  });
  vi.clearAllMocks();
  test('renders correctly, forReview false', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: MockProposalBackendList
    });
    const { container } = render(
      <StoreProvider>
        <GridProposals />
      </StoreProvider>
    );
    await waitFor(() => {
      const authorsHeader = container.querySelector('[data-field="authors"]');
      expect(authorsHeader).toBeNull();
    });
  });
  vi.clearAllMocks();
});

describe('<GridProposals /> showSelection', () => {
  test('renders correctly, showSelection true', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: MockProposalBackendList
    });
    render(
      <StoreProvider>
        <GridProposals showSelection />
      </StoreProvider>
    );
    const checkboxes = await screen.findAllByTestId('linkedTickBox');
    expect(checkboxes.length).toBeGreaterThan(0);
  });
  vi.clearAllMocks();
  test('renders correctly, showSelection false', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: MockProposalBackendList
    });
    render(
      <StoreProvider>
        <GridProposals />
      </StoreProvider>
    );
    const emptyCheckboxes = screen.queryAllByTestId('linkedTickBox');
    expect(emptyCheckboxes.length).toBe(0);
  });
  vi.clearAllMocks();
});

describe('<GridProposals /> showActions', () => {
  test('renders correctly, showActions true', () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: MockProposalBackendList
    });
    render(
      <StoreProvider>
        <GridProposals showActions />
      </StoreProvider>
    );
    // TODO check if actions are rendered
  });
  vi.clearAllMocks();
  test('renders correctly, showActions false', () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: MockProposalBackendList
    });
    render(
      <StoreProvider>
        <GridProposals />
      </StoreProvider>
    );
    // TODO check if actions are not rendered
  });
});

describe('<GridProposals /> showSearch', () => {
  test('renders correctly, showSearch true', () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: MockProposalBackendList
    });
    render(
      <StoreProvider>
        <GridProposals showSearch />
      </StoreProvider>
    );
    expect(screen.queryByTestId('searchId')).toBeDefined();
  });
  test('renders correctly, showSearch false', () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: MockProposalBackendList
    });
    render(
      <StoreProvider>
        <GridProposals />
      </StoreProvider>
    );
    expect(screen.queryByTestId('searchId')).toBeNull();
  });
});

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
