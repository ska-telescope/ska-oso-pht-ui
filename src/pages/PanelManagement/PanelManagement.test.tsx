import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import {
  MockReviewerInternal,
  MockReviewersList
} from '@services/axios/get/getReviewerList/mockReviewerList';
import { PanelProposal } from '@utils/types/panelProposal.tsx';
import PanelManagement, {
  addProposalPanel,
  addReviewerPanel,
  deleteProposalPanel,
  deleteReviewerPanel,
  convertPanelReviewerToReviewerIdList,
  convertPanelProposalToProposalIdList
} from './PanelManagement';
import { Panel } from '@/utils/types/panel';
import MockProposalFrontendList from '@/services/axios/get/getProposalList/mockProposalFrontendList';
import Proposal from '@/utils/types/proposal';
import { REVIEWER_STATUS } from '@/utils/constants';
import { Reviewer } from '@/utils/types/reviewer';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';
import { PanelReviewer } from '@/utils/types/panelReviewer';

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

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('<PanelManagement />', () => {
  test('renders correctly', () => {
    wrapper(<PanelManagement />);
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
    addReviewerPanel(MockReviewerInternal[0], mockedPanels[0], setReviewerPanels);
    expect(setReviewerPanels).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          reviewerId: MockReviewerInternal[0].id.replace('-science', ''),
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
      reviewerId: MockReviewersList[0].id.replace('-science', ''),
      panelId: panel.id,
      assignedOn: new Date().toISOString(),
      status: REVIEWER_STATUS.PENDING
    },
    {
      reviewerId: MockReviewersList[1].id.replace('-science', ''),
      panelId: panel.id,
      assignedOn: new Date().toISOString(),
      status: REVIEWER_STATUS.PENDING
    },
    {
      reviewerId: MockReviewersList[2].id.replace('-science', ''),
      panelId: panel.id,
      assignedOn: new Date().toISOString(),
      status: REVIEWER_STATUS.PENDING
    }
  ];
  test('deletes a reviewer and calls setReviewerPanels with updated list', () => {
    const setReviewerPanels = vi.fn();
    const myPanel = panel;
    myPanel.sciReviewers = PanelReviewers;
    const rec = {
      id: 'c8f8f18a-3c70-4c39-8ed9-2d8d180d99a1',
      jobTitle: 'Prof.',
      givenName: 'Sofia',
      surname: 'Martinez',
      displayName: 'Sofia Martinez',
      mail: 'sofia.martinez@example.com',
      officeLocation: 'Main',
      subExpertise: 'Pulsar Timing',
      isScience: true,
      isTechnical: false
    };
    deleteReviewerPanel(rec, myPanel, setReviewerPanels);
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

describe('convertPanelReviewerToReviewerIdList', () => {
  test('converts a list of PanelReviewer to IdObject list', () => {
    const reviewers: PanelReviewer[] = [
      { reviewerId: 'reviewer1', panelId: 'panel1', status: 'PENDING' },
      { reviewerId: 'reviewer2', panelId: 'panel2', status: 'PENDING' }
    ];
    const result = convertPanelReviewerToReviewerIdList(reviewers);
    expect(result).toEqual([{ id: 'reviewer1' }, { id: 'reviewer2' }]);
  });

  test('returns an empty array when input is empty', () => {
    expect(convertPanelReviewerToReviewerIdList([])).toEqual([]);
  });
});

describe('convertPanelProposalToProposalIdList ', () => {
  test('converts a list of PanelProposal to IdObject list', () => {
    const reviewers: PanelProposal[] = [
      { proposalId: 'proposal1', panelId: 'panel1', assignedOn: '12-12-12' },
      { proposalId: 'proposal2', panelId: 'panel2', assignedOn: '12-12-12' }
    ];
    const result = convertPanelProposalToProposalIdList(reviewers);
    expect(result).toEqual([{ id: 'proposal1' }, { id: 'proposal2' }]);
  });

  test('returns an empty array when input is empty', () => {
    expect(convertPanelProposalToProposalIdList([])).toEqual([]);
  });
});
