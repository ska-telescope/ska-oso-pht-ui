import { describe, test, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import GridReviewers, {
  addReviewerPanel,
  deleteReviewerPanel,
  filterReviewers
} from './GridReviewers';
import MockReviewersBackendList from '@/services/axios/getReviewerList/mockReviewerList';
import { REVIEWER_STATUS } from '@/utils/constants';
import { Panel } from '@/utils/types/panel';
import Reviewer from '@/utils/types/reviewer';

const mockedPanels: Panel[] = [
  {
    id: 'P400',
    name: 'Stargazers',
    createdOn: '2022-09-23T15:43:53.971548Z',
    expiresOn: '2028-09-23T15:43:53.971548Z',
    proposals: [],
    reviewers: []
  },
  {
    id: 'P500',
    name: 'Buttons',
    createdOn: '2022-09-23T15:43:53.971548Z',
    expiresOn: '2028-08-23T15:43:53.971548Z',
    proposals: [],
    reviewers: []
  },
  {
    id: 'P600',
    name: 'Nashrakra',
    createdOn: '2022-09-23T15:43:53.971548Z',
    expiresOn: '2028-09-23T15:43:53.971548Z',
    proposals: [],
    reviewers: []
  }
];

const handleChange = () => {
  // Mock function to handle row change
};

describe('<GridReviewers />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <GridReviewers currentPanel={mockedPanels[0]} onChange={handleChange} />
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

describe('Adds Reviewer', () => {
  test('adds a reviewer and calls setReviewerPanels with updated list', () => {
    const setReviewerPanels = vi.fn();
    addReviewerPanel(MockReviewersBackendList[0], mockedPanels[0], setReviewerPanels);
    expect(setReviewerPanels).toHaveBeenCalledWith([
      expect.objectContaining({
        reviewerId: MockReviewersBackendList[0].id,
        panelId: mockedPanels[0].id,
        status: REVIEWER_STATUS.PENDING
      })
    ]);
  });
});

describe('Deletes Reviewer', () => {
  const panel = mockedPanels[0];
  const PanelReviewers = [
    {
      reviewerId: MockReviewersBackendList[0].id,
      panelId: panel.id,
      assignedOn: new Date().toISOString(),
      status: REVIEWER_STATUS.PENDING
    },
    {
      reviewerId: MockReviewersBackendList[1].id,
      panelId: panel.id,
      assignedOn: new Date().toISOString(),
      status: REVIEWER_STATUS.PENDING
    },
    {
      reviewerId: MockReviewersBackendList[2].id,
      panelId: panel.id,
      assignedOn: new Date().toISOString(),
      status: REVIEWER_STATUS.PENDING
    }
  ];
  test('deletes a reviewer and calls setReviewerPanels with updated list', () => {
    const setReviewerPanels = vi.fn();
    const myPanel = panel;
    myPanel.reviewers = PanelReviewers;
    deleteReviewerPanel(MockReviewersBackendList[0], myPanel, setReviewerPanels);
    expect(setReviewerPanels).toHaveBeenCalledWith([myPanel.reviewers[1], myPanel.reviewers[2]]);
  });

  test('should handle empty panel reviewers list gracefully', () => {
    const setReviewerPanels = vi.fn();
    const emptyPanel = mockedPanels[0];
    emptyPanel.reviewers = [];
    deleteReviewerPanel(MockReviewersBackendList[0], emptyPanel, setReviewerPanels);
    expect(setReviewerPanels).toHaveBeenCalledWith([]);
  });

  test('should handle wrong reviewer id without deleting any reviewers', () => {
    const setReviewerPanels = vi.fn();
    const reviewerToDelete = { id: 'non-existent-id' } as Reviewer;
    const myPanel = panel;
    myPanel.reviewers = PanelReviewers;
    deleteReviewerPanel(reviewerToDelete, myPanel, setReviewerPanels);
    expect(setReviewerPanels).toHaveBeenCalledWith([
      myPanel.reviewers[0],
      myPanel.reviewers[1],
      myPanel.reviewers[2]
    ]);
  });
});
