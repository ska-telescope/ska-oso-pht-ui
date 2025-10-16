import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { MockReviewersList } from '@services/axios/get/getReviewerList/mockReviewerList';
import PanelManagement, {
  addProposalPanel,
  addReviewerPanel,
  deleteProposalPanel,
  deleteReviewerPanel
} from './PanelManagement';
import { Panel } from '@/utils/types/panel';
import MockProposalFrontendList from '@/services/axios/get/getProposalList/mockProposalFrontendList';
import Proposal from '@/utils/types/proposal';
import { REVIEWER_STATUS } from '@/utils/constants';
import { Reviewer } from '@/utils/types/reviewer';

const mockedPanels: Panel[] = [
  {
    id: 'P400',
    name: 'Stargazers',
    expiresOn: '2028-09-23T15:43:53.971548Z',
    proposals: [],
    sciReviewers: [],
    tecReviewers: []
  },
  {
    id: 'P500',
    name: 'Buttons',
    expiresOn: '2028-08-23T15:43:53.971548Z',
    proposals: [],
    sciReviewers: [],
    tecReviewers: []
  },
  {
    id: 'P600',
    name: 'Nashrakra',
    expiresOn: '2028-09-23T15:43:53.971548Z',
    proposals: [],
    sciReviewers: [],
    tecReviewers: []
  }
];

describe('<PanelManagement />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <PanelManagement />
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
    addReviewerPanel(MockReviewersList[0], mockedPanels[0], setReviewerPanels);
    expect(setReviewerPanels).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          reviewerId: MockReviewersList[0].id,
          panelId: mockedPanels[0].id,
          status: REVIEWER_STATUS.PENDING
        })
      ],
      []
    );
  });
});

describe('Deletes Reviewer', () => {
  const panel = mockedPanels[0];
  const PanelReviewers = [
    {
      reviewerId: MockReviewersList[0].id,
      panelId: panel.id,
      assignedOn: new Date().toISOString(),
      status: REVIEWER_STATUS.PENDING
    },
    {
      reviewerId: MockReviewersList[1].id,
      panelId: panel.id,
      assignedOn: new Date().toISOString(),
      status: REVIEWER_STATUS.PENDING
    },
    {
      reviewerId: MockReviewersList[2].id,
      panelId: panel.id,
      assignedOn: new Date().toISOString(),
      status: REVIEWER_STATUS.PENDING
    }
  ];
  test('deletes a reviewer and calls setReviewerPanels with updated list', () => {
    const setReviewerPanels = vi.fn();
    const myPanel = panel;
    myPanel.sciReviewers = PanelReviewers;
    deleteReviewerPanel(MockReviewersList[0], myPanel, setReviewerPanels);
    expect(setReviewerPanels).toHaveBeenCalledWith(
      [myPanel.sciReviewers[1], myPanel.sciReviewers[2]],
      []
    );
  });

  test('should handle empty panel reviewers list gracefully', () => {
    const setReviewerPanels = vi.fn();
    const emptyPanel = mockedPanels[0];
    emptyPanel.sciReviewers = [];
    deleteReviewerPanel(MockReviewersList[0], emptyPanel, setReviewerPanels);
    expect(setReviewerPanels).toHaveBeenCalledWith([], []);
  });

  test('should handle wrong reviewer id without deleting any reviewers', () => {
    const setReviewerPanels = vi.fn();
    const reviewerToDelete = { id: 'non-existent-id' } as Reviewer;
    const myPanel = panel;
    myPanel.sciReviewers = PanelReviewers;
    deleteReviewerPanel(reviewerToDelete, myPanel, setReviewerPanels);
    expect(setReviewerPanels).toHaveBeenCalledWith(
      [myPanel.sciReviewers[0], myPanel.sciReviewers[1], myPanel.sciReviewers[2]],
      []
    );
  });
});
