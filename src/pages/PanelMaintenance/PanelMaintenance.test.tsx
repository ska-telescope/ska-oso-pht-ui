import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import PanelMaintenance, {
  addProposalPanel,
  addReviewerPanel,
  deleteProposalPanel,
  deleteReviewerPanel
} from './PanelMaintenance';
import { Panel } from '@/utils/types/panel';
import MockProposalFrontendList from '@/services/axios/getProposalList/mockProposalFrontendList';
import Proposal from '@/utils/types/proposal';
import MockReviewersBackendList from '@/services/axios/getReviewerList/mockReviewerList';
import { REVIEWER_STATUS } from '@/utils/constants';
import Reviewer from '@/utils/types/reviewer';

const mockedPanels: Panel[] = [
  {
    id: 'P400',
    name: 'Stargazers',
    expiresOn: '2028-09-23T15:43:53.971548Z',
    proposals: [],
    reviewers: []
  },
  {
    id: 'P500',
    name: 'Buttons',
    expiresOn: '2028-08-23T15:43:53.971548Z',
    proposals: [],
    reviewers: []
  },
  {
    id: 'P600',
    name: 'Nashrakra',
    expiresOn: '2028-09-23T15:43:53.971548Z',
    proposals: [],
    reviewers: []
  }
];

describe('<PanelMaintenance />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <PanelMaintenance />
      </StoreProvider>
    );
  });
});

describe('Adds Proposal', () => {
  test('adds a proposal and calls setProposalPanels with updated list', () => {
    const setProposalPanels = vi.fn();
    addProposalPanel(MockProposalFrontendList[0], mockedPanels[0], setProposalPanels);
    expect(setProposalPanels).toHaveBeenCalledWith([
      expect.objectContaining({
        proposalId: MockProposalFrontendList[0].id,
        panelId: mockedPanels[0].id
      })
    ]);
  });

  describe('Deletes Proposal', () => {
    const panel = mockedPanels[0];
    const PanelProposals = [
      {
        proposalId: MockProposalFrontendList[0].id,
        panelId: panel.id
      },
      {
        proposalId: MockProposalFrontendList[1].id,
        panelId: panel.id
      },
      {
        proposalId: MockProposalFrontendList[2].id,
        panelId: panel.id
      }
    ];
    test('deletes a proposal and calls setProposalPanels with updated list', () => {
      const setProposalPanels = vi.fn();
      const myPanel = panel;
      myPanel.proposals = PanelProposals;
      deleteProposalPanel(MockProposalFrontendList[0], myPanel, setProposalPanels);
      expect(setProposalPanels).toHaveBeenCalledWith([myPanel.proposals[1], myPanel.proposals[2]]);
    });

    test('should handle empty panel proposals list gracefully', () => {
      const setProposalPanels = vi.fn();
      const emptyPanel = mockedPanels[0];
      emptyPanel.proposals = [];
      deleteProposalPanel(MockProposalFrontendList[0], emptyPanel, setProposalPanels);
      expect(setProposalPanels).toHaveBeenCalledWith([]);
    });

    test('should handle wrong proposal id without deleting any proposals', () => {
      const setProposalPanels = vi.fn();
      const proposalToDelete = { id: 'non-existent-id' } as Proposal;
      const myPanel = panel;
      myPanel.proposals = PanelProposals;
      deleteProposalPanel(proposalToDelete, myPanel, setProposalPanels);
      expect(setProposalPanels).toHaveBeenCalledWith([
        myPanel.proposals[0],
        myPanel.proposals[1],
        myPanel.proposals[2]
      ]);
    });
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
