import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import axios from 'axios';
import { MockReviewersList } from '@services/axios/get/getReviewerList/mockReviewerList';
import GridReviewers, { filterReviewers } from './GridReviewers';
import { IdObject } from '@/utils/types/idObject';

const mockedSelectedReviewers: IdObject[] = [
  { id: MockReviewersList[0].id },
  { id: MockReviewersList[1].id }
];

describe('<GridReviewers /> data rendering', () => {
  test('renders correctly with mocking data', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: MockReviewersList
    });
    render(
      <StoreProvider>
        <GridReviewers />
      </StoreProvider>
    );
    expect(await screen.findAllByTestId('dataGridReviewers')).toBeDefined();
  });
  vi.clearAllMocks();
  test('renders correctly with data error', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: 'Error'
    });
    render(
      <StoreProvider>
        <GridReviewers />
      </StoreProvider>
    );
    expect(screen.queryByTestId('helpPanelId')).toBeDefined();
  });
  vi.clearAllMocks();
});

describe('<GridReviewers /> showSelection', () => {
  test('renders correctly, showSelection true', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: MockReviewersList
    });
    render(
      <StoreProvider>
        <GridReviewers showSelection />
      </StoreProvider>
    );
  });
  vi.clearAllMocks();
  test('renders correctly, showSelection false', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: MockReviewersList
    });
    render(
      <StoreProvider>
        <GridReviewers />
      </StoreProvider>
    );
    const emptyCheckboxes = screen.queryAllByTestId('triStateTestId');
    expect(emptyCheckboxes.length).toBe(0);
  });
  vi.clearAllMocks();
});

describe('<GridReviewers /> with selected reviewers', () => {
  test('renders correctly and checks only selected reviewers', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: MockReviewersList
    });
    render(
      <StoreProvider>
        <GridReviewers showSelection selectedReviewers={mockedSelectedReviewers} />
      </StoreProvider>
    );
    const checkboxes = await screen.findAllByRole('checkbox');
    checkboxes.forEach(checkbox => {
      const reviewerId = checkbox.getAttribute('data-id');
      const isSelected = mockedSelectedReviewers.some(r => r.id === reviewerId);
      const isChecked = checkbox.getAttribute('aria-checked') === 'true';
      expect(isChecked).toBe(isSelected);
    });
  });
  vi.clearAllMocks();
});

describe('<GridReviewers /> showSearch', () => {
  test('renders correctly, showSearch true', () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: MockReviewersList
    });
    render(
      <StoreProvider>
        <GridReviewers showSearch />
      </StoreProvider>
    );
    expect(screen.queryByTestId('searchId')).toBeDefined();
  });
  test('renders correctly, showSearch false', () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: MockReviewersList
    });
    render(
      <StoreProvider>
        <GridReviewers />
      </StoreProvider>
    );
    expect(screen.queryByTestId('searchId')).toBeNull();
  });
});

describe('<GridReviewers /> showTitle', () => {
  test('renders correctly, showTitle true', () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: MockReviewersList
    });
    render(
      <StoreProvider>
        <GridReviewers showTitle />
      </StoreProvider>
    );
    expect(screen.queryByTestId('pageTitle')).toBeDefined();
  });
  test('renders correctly, showTitle false', () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: MockReviewersList
    });
    render(
      <StoreProvider>
        <GridReviewers />
      </StoreProvider>
    );
    expect(screen.queryByTestId('pageTitle')).toBeNull();
  });
});

describe('filterReviewers', () => {
  test('filters by name', () => {
    const result = filterReviewers(MockReviewersList, 'Amara', '', '');
    expect(result).toHaveLength(1);
    expect(result[0].givenName).toBe('Amara');
  });

  test('filters by subExpertise', () => {
    const result = filterReviewers(MockReviewersList, '', 'Pulsar Timing', '');
    expect(result).toHaveLength(2);
    expect(result[0].subExpertise).toBe('Pulsar Timing');
  });

  test('filters by officeLocation', () => {
    const result = filterReviewers(MockReviewersList, '', '', 'Main');
    expect(result).toHaveLength(4);
    expect(result[0].officeLocation).toBe('Main');
  });

  test('filters by multiple criteria', () => {
    const result = filterReviewers(MockReviewersList, 'liam', 'Galaxy Evolution', 'Annex');
    expect(result).toHaveLength(1);
    expect(result[0].surname).toBe("O'Connor");
  });

  test('returns empty array if no match', () => {
    const result = filterReviewers(MockReviewersList, 'john', '', '');
    expect(result).toHaveLength(0);
  });
});
