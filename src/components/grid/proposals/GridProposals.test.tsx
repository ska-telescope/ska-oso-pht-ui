import { describe, test, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@utils/storage/store';
import GridProposals, { filterProposals } from './GridProposals';
import MockProposalFrontendList from '@/models/proposals/testing/mockProposalSummaries';
import MockProposalBackendList from '@/services/axios/get/getProposalList/mockProposalBackendList';
import { listReviewableProposals } from '@/services/api/proposals';
import { proposalSummariesFromPdm } from '@/models/proposals/proposalSummary';
import type { Proposal as ProposalPDM } from '@/generated/models/proposal';
import { IdObject } from '@/utils/types/idObject';
import { PROPOSAL_TYPE } from '@/utils/constants';

const mockedSelectedProposals: IdObject[] = [
  { id: MockProposalBackendList[0].prsl_id as string },
  { id: MockProposalBackendList[1].prsl_id as string }
];

vi.mock('@/services/api/proposals', () => ({ listReviewableProposals: vi.fn() }));

// Returns the given proposals from the ODA as the list call would, or an error for anything else
const mockReviewable = (data: unknown) =>
  vi
    .mocked(listReviewableProposals)
    .mockResolvedValue(
      Array.isArray(data)
        ? { data: proposalSummariesFromPdm(data as ProposalPDM[]) }
        : { error: String(data) }
    );

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<GridProposals /> data rendering', () => {
  test('renders correctly with mocking data', async () => {
    mockReviewable(MockProposalBackendList);
    wrapper(<GridProposals />);
    expect(await screen.findAllByTestId('dataGridProposals')).toBeDefined();
  });
  vi.clearAllMocks();
  test('renders correctly with data error', async () => {
    mockReviewable('Error');
    wrapper(<GridProposals />);
    expect(screen.queryByTestId('helpProposalsId')).toBeDefined();
  });
  vi.clearAllMocks();
  test('renders correctly with empty data', async () => {
    mockReviewable([]);
    wrapper(<GridProposals />);
    expect(await screen.findAllByTestId('dataGridProposals')).toBeDefined();
  });
  vi.clearAllMocks();
});

describe('<GridProposals /> forReview', () => {
  test('renders correctly, forReview true', async () => {
    mockReviewable(MockProposalBackendList);
    const { container } = wrapper(<GridProposals forReview />);
    await waitFor(() => {
      const authorsHeader = container.querySelector('[data-field="authors"]');
      expect(authorsHeader).toBeInTheDocument();
    });
  });
  vi.clearAllMocks();
  test('renders correctly, forReview false', async () => {
    mockReviewable(MockProposalBackendList);
    const { container } = wrapper(<GridProposals />);
    await waitFor(() => {
      const authorsHeader = container.querySelector('[data-field="authors"]');
      expect(authorsHeader).toBeNull();
    });
  });
  vi.clearAllMocks();
});

describe('<GridProposals /> science category and observing mode columns', () => {
  const svProposalBackend = MockProposalBackendList[1];

  test('is shown next to the science category when only some proposals have one', async () => {
    mockReviewable([svProposalBackend, MockProposalBackendList[2]]);
    const { container } = wrapper(<GridProposals />);
    await waitFor(() => {
      expect(container.querySelector('[data-field="observingMode"]')).toBeInTheDocument();
    });
    expect(container.querySelector('[data-field="scienceCategory"]')).toBeInTheDocument();
  });
  vi.clearAllMocks();

  test('replaces the science category column when no proposal has a science category', async () => {
    mockReviewable([svProposalBackend]);
    const { container } = wrapper(<GridProposals />);
    await waitFor(() => {
      expect(container.querySelector('[data-field="observingMode"]')).toBeInTheDocument();
    });
    expect(container.querySelector('[data-field="scienceCategory"]')).toBeNull();
  });
  vi.clearAllMocks();

  test('is not shown when every proposal has a science category', async () => {
    mockReviewable([MockProposalBackendList[2]]);
    const { container } = wrapper(<GridProposals />);
    await waitFor(() => {
      expect(container.querySelector('[data-field="scienceCategory"]')).toBeInTheDocument();
    });
    expect(container.querySelector('[data-field="observingMode"]')).toBeNull();
  });
  vi.clearAllMocks();
});

describe('<GridProposals /> showSelection', () => {
  test('renders correctly, showSelection true', async () => {
    mockReviewable(MockProposalBackendList);
    wrapper(<GridProposals showSelection />);
    const checkboxes = await screen.findAllByTestId('linkedTickBox');
    expect(checkboxes.length).toBeGreaterThan(0);
  });
  vi.clearAllMocks();
  test('renders correctly, showSelection false', async () => {
    mockReviewable(MockProposalBackendList);
    wrapper(<GridProposals />);
    const emptyCheckboxes = screen.queryAllByTestId('linkedTickBox');
    expect(emptyCheckboxes.length).toBe(0);
  });
  vi.clearAllMocks();
});

describe('<GridProposals /> with selected proposals', () => {
  test('renders correctly and checks only selected proposals', async () => {
    mockReviewable(MockProposalBackendList);
    wrapper(<GridProposals showSelection selectedProposals={mockedSelectedProposals} />);
    const checkboxes = await screen.findAllByRole('checkbox');
    checkboxes.forEach((checkbox) => {
      const proposalId = checkbox.getAttribute('data-id');
      const isSelected = mockedSelectedProposals.some((p) => p.id === proposalId);
      const isChecked = checkbox.getAttribute('aria-checked') === 'true';
      expect(isChecked).toBe(isSelected);
    });
  });
  vi.clearAllMocks();
});

describe('<GridProposals /> showSearch', () => {
  test('renders correctly, showSearch true', () => {
    mockReviewable(MockProposalBackendList);
    wrapper(<GridProposals showSearch />);
    expect(screen.queryByTestId('searchId')).toBeDefined();
  });
  test('renders correctly, showSearch false', () => {
    mockReviewable(MockProposalBackendList);
    wrapper(<GridProposals />);
    expect(screen.queryByTestId('searchId')).toBeNull();
  });
});

describe('<GridProposals /> showTitle', () => {
  test('renders correctly, showTitle true', () => {
    mockReviewable(MockProposalBackendList);
    wrapper(<GridProposals showTitle />);
    expect(screen.queryByTestId('pageTitle')).toBeDefined();
  });
  test('renders correctly, showTitle false', () => {
    mockReviewable(MockProposalBackendList);
    wrapper(<GridProposals />);
    expect(screen.queryByTestId('pageTitle')).toBeNull();
  });
});

describe('filterProposals', () => {
  test('filters by title', () => {
    const result = filterProposals(MockProposalFrontendList, 'In a galaxy far, far away', null, '');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('In a galaxy far, far away');
  });

  test('filters by proposal type', () => {
    const result = filterProposals(MockProposalFrontendList, '', null, PROPOSAL_TYPE.STANDARD);
    expect(result.map((proposal) => proposal.title)).toEqual([
      'In a galaxy far, far away',
      'Incomplete Proposal'
    ]);
  });

  test('filters by the science verification proposal type', () => {
    const result = filterProposals(
      MockProposalFrontendList,
      '',
      null,
      PROPOSAL_TYPE.SCIENCE_VERIFICATION
    );
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('The Milky Way View');
  });

  test('filters by science category', () => {
    const result = filterProposals(MockProposalFrontendList, '', '4', '');
    expect(result).toHaveLength(1);
    expect(result[0].proposalType).toBe('standard_proposal');
  });

  test('filters by multiple criteria', () => {
    const result = filterProposals(
      MockProposalFrontendList,
      'The Milky Way View',
      null,
      PROPOSAL_TYPE.SCIENCE_VERIFICATION
    );
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('The Milky Way View');
    expect(result[0].proposalType).toBe(PROPOSAL_TYPE.SCIENCE_VERIFICATION);
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
    expect(result[0].proposalType).toBe('standard_proposal');
    expect(result[0].scienceCategory).toBe('4');
  });
});
