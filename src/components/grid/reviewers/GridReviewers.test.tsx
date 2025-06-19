import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import GridReviewers, { filterReviewers } from './GridReviewers';
import MockReviewersBackendList from '@/services/axios/getReviewerList/mockReviewerList';

const mockedPanels = [
  { panelId: 'P400', name: 'Stargazers', cycle: '2023-2024', proposals: [], reviewers: [] },
  { panelId: 'P500', name: 'Buttons', cycle: '2023-2024', proposals: [], reviewers: [] },
  { panelId: 'P600', name: 'Nashrakra', cycle: '2023-2024', proposals: [], reviewers: [] }
];

describe('<GridReviewers />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <GridReviewers currentPanel={mockedPanels[0]} />
      </StoreProvider>
    );
  });
});

describe('filterReviewers', () => {
  test('filters by name', () => {
    const result = filterReviewers(MockReviewersBackendList, 'Amara', '', '');
    expect(result).to.have.lengthOf(1);
    expect(result[0].givenName).to.equal('Amara');
  });

  test('filters by subExpertise', () => {
    const result = filterReviewers(MockReviewersBackendList, '', 'Pulsar Timing', '');
    expect(result).to.have.lengthOf(2);
    expect(result[0].subExpertise).to.equal('Pulsar Timing');
  });

  test('filters by officeLocation', () => {
    const result = filterReviewers(MockReviewersBackendList, '', '', 'Main');
    expect(result).to.have.lengthOf(4);
    expect(result[0].officeLocation).to.equal('Main');
  });

  test('filters by multiple criteria', () => {
    const result = filterReviewers(MockReviewersBackendList, 'liam', 'Galaxy Evolution', 'Annex');
    expect(result).to.have.lengthOf(1);
    expect(result[0].surname).to.equal("O'Connor");
  });

  test('returns empty array if no match', () => {
    const result = filterReviewers(MockReviewersBackendList, 'john', '', '');
    expect(result).to.have.lengthOf(0);
  });
});
