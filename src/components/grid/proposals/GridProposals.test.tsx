import { describe, test, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import axios from 'axios';
import GridProposals, { filterProposals, getProposalType } from './GridProposals';
import MockProposalFrontendList from '@/services/axios/get/getProposalList/mockProposalFrontendList';
import MockProposalBackendList from '@/services/axios/get/getProposalList/mockProposalBackendList';
import { IdObject } from '@/utils/types/idObject';

const mockedSelectedProposals: IdObject[] = [
  { id: MockProposalBackendList[0].prsl_id },
  { id: MockProposalBackendList[1].prsl_id }
];

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<GridProposals /> data rendering', () => {
  test('renders correctly with mocking data', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: MockProposalBackendList
    });
    wrapper(<GridProposals />);
    expect(await screen.findAllByTestId('dataGridProposals')).toBeDefined();
  });
  vi.clearAllMocks();
  test('renders correctly with data error', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: 'Error'
    });
    wrapper(<GridProposals />);
    expect(screen.queryByTestId('helpProposalsId')).toBeDefined();
  });
  vi.clearAllMocks();
  test('renders correctly with empty data', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: []
    });
    wrapper(<GridProposals />);
    expect(await screen.findAllByTestId('dataGridProposals')).toBeDefined();
  });
  vi.clearAllMocks();
});

describe('<GridProposals /> forReview', () => {
  test('renders correctly, forReview true', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: MockProposalBackendList
    });
    const { container } = wrapper(<GridProposals forReview />);
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
    const { container } = wrapper(<GridProposals />);
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
    wrapper(<GridProposals showSelection />);
    const checkboxes = await screen.findAllByTestId('linkedTickBox');
    expect(checkboxes.length).toBeGreaterThan(0);
  });
  vi.clearAllMocks();
  test('renders correctly, showSelection false', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: MockProposalBackendList
    });
    wrapper(<GridProposals />);
    const emptyCheckboxes = screen.queryAllByTestId('linkedTickBox');
    expect(emptyCheckboxes.length).toBe(0);
  });
  vi.clearAllMocks();
});

describe('<GridProposals /> with selected proposals', () => {
  test('renders correctly and checks only selected proposals', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: MockProposalBackendList
    });
    wrapper(<GridProposals showSelection selectedProposals={mockedSelectedProposals} />);
    const checkboxes = await screen.findAllByRole('checkbox');
    checkboxes.forEach(checkbox => {
      const proposalId = checkbox.getAttribute('data-id');
      const isSelected = mockedSelectedProposals.some(p => p.id === proposalId);
      const isChecked = checkbox.getAttribute('aria-checked') === 'true';
      expect(isChecked).toBe(isSelected);
    });
  });
  vi.clearAllMocks();
});

describe('<GridProposals /> showActions', () => {
  test('renders correctly, showActions true', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: MockProposalBackendList
    });
    const { container } = wrapper(<GridProposals showActions />);
    await waitFor(() => {
      const authorsHeader = container.querySelector('[data-field="actions"]');
      expect(authorsHeader).toBeInTheDocument();
    });
  });
  vi.clearAllMocks();
  test('renders correctly, showActions false', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: MockProposalBackendList
    });
    const { container } = wrapper(<GridProposals />);
    await waitFor(() => {
      const authorsHeader = container.querySelector('[data-field="actions"]');
      expect(authorsHeader).toBeNull();
    });
  });
});

describe('<GridProposals /> showSearch', () => {
  test('renders correctly, showSearch true', () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: MockProposalBackendList
    });
    wrapper(<GridProposals showSearch />);
    expect(screen.queryByTestId('searchId')).toBeDefined();
  });
  test('renders correctly, showSearch false', () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: MockProposalBackendList
    });
    wrapper(<GridProposals />);
    expect(screen.queryByTestId('searchId')).toBeNull();
  });
});

describe('<GridProposals /> showTitle', () => {
  test('renders correctly, showTitle true', () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: MockProposalBackendList
    });
    wrapper(<GridProposals showTitle />);
    expect(screen.queryByTestId('pageTitle')).toBeDefined();
  });
  test('renders correctly, showTitle false', () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: MockProposalBackendList
    });
    wrapper(<GridProposals />);
    expect(screen.queryByTestId('pageTitle')).toBeNull();
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
    const result = filterProposals(MockProposalFrontendList, '', '4', '');
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
    expect(result[0].scienceCategory).toBe('');
  });

  test('filters by all criteria', () => {
    const result = filterProposals(
      MockProposalFrontendList,
      'Incomplete Proposal',
      '4',
      'standard_proposal'
    );
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Incomplete Proposal');
    expect(result[0].proposalType).toBe(1);
    expect(result[0].scienceCategory).toBe('4');
  });
});
