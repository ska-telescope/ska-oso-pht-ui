import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import GridReviewers, { filterReviewers } from './GridReviewers';
import MockReviewersBackendList from '@/services/axios/getReviewerList/mockReviewerList';

describe('<GridReviewers />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <GridReviewers />
      </StoreProvider>
    );
  });
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
