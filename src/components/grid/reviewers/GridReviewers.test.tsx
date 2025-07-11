import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import axios from 'axios';
import GridReviewers, { filterReviewers } from './GridReviewers';
import MockReviewersBackendList from '@/services/axios/getReviewerList/mockReviewerList';

describe('<GridReviewers /> data rendering', () => {
  test('renders correctly with no mocking', () => {
    render(
      <StoreProvider>
        <GridReviewers />
      </StoreProvider>
    );
    const reviewerGrid = screen.queryByTestId('dataGridReviewers');
    expect(reviewerGrid).toBeNull();
    expect(screen.queryByTestId('helpPanelId')).toBeDefined();
  });
  test('renders correctly with mocking data', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: MockReviewersBackendList
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
    const reviewerGrid = screen.queryByTestId('dataGridReviewers');
    expect(reviewerGrid).toBeNull();
    expect(screen.queryByTestId('helpPanelId')).toBeDefined();
  });
  vi.clearAllMocks();
  test('renders correctly with empty data', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: []
    });
    render(
      <StoreProvider>
        <GridReviewers />
      </StoreProvider>
    );
    const reviewerGrid = screen.queryByTestId('dataGridReviewers');
    expect(reviewerGrid).toBeNull();
    expect(screen.queryByTestId('helpPanelId')).toBeDefined();
  });
  vi.clearAllMocks();
});

describe('filterReviewers', () => {
  test('filters by name', () => {
    const result = filterReviewers(MockReviewersBackendList, 'Amara', '', '');
    expect(result).toHaveLength(1);
    expect(result[0].givenName).toBe('Amara');
  });

  test('filters by subExpertise', () => {
    const result = filterReviewers(MockReviewersBackendList, '', 'Pulsar Timing', '');
    expect(result).toHaveLength(2);
    expect(result[0].subExpertise).toBe('Pulsar Timing');
  });

  test('filters by officeLocation', () => {
    const result = filterReviewers(MockReviewersBackendList, '', '', 'Main');
    expect(result).toHaveLength(4);
    expect(result[0].officeLocation).toBe('Main');
  });

  test('filters by multiple criteria', () => {
    const result = filterReviewers(MockReviewersBackendList, 'liam', 'Galaxy Evolution', 'Annex');
    expect(result).toHaveLength(1);
    expect(result[0].surname).toBe("O'Connor");
  });

  test('returns empty array if no match', () => {
    const result = filterReviewers(MockReviewersBackendList, 'john', '', '');
    expect(result).toHaveLength(0);
  });
});
