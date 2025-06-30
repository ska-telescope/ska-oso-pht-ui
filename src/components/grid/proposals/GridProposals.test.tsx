import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import axios from 'axios';
import GridProposals, {
  addProposalPanel,
  deleteProposalPanel,
  filterProposals,
  getProposalType,
  isProposalSelected
} from './GridProposals';
import MockProposalFrontendList from '@/services/axios/getProposalList/mockProposalFrontendList';
import { Panel } from '@/utils/types/panel';
import { PanelProposal } from '@/utils/types/panelProposal';
import Proposal from '@/utils/types/proposal';

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

const handleProposalsChange = (proposalsList: PanelProposal[]) => {
  // Update the current panel's proposals with the new list
  const prevPanel = mockedPanels[0]; // Assuming we are working with the first panel for this example
  return {
    ...prevPanel,
    proposals: proposalsList
  };
};

describe('<GridProposals />', () => {
  test('renders correctly with no mocking', () => {
    render(
      <StoreProvider>
        <GridProposals currentPanel={null} onChange={item => handleProposalsChange(item)} />
      </StoreProvider>
    );
  });
});
test('renders correctly', async () => {
  vi.spyOn(axios, 'get').mockResolvedValue({
    data: 'Error'
  });
  render(
    <StoreProvider>
      <GridProposals
        currentPanel={mockedPanels[0]}
        onChange={item => handleProposalsChange(item)}
      />
    </StoreProvider>
  );
});
vi.clearAllMocks();
test('renders correctly, forReview', () => {
  vi.spyOn(axios, 'get').mockResolvedValue({
    data: MockProposalFrontendList
  });
  render(
    <StoreProvider>
      <GridProposals currentPanel={null} onChange={item => handleProposalsChange(item)} />
    </StoreProvider>
  );

  vi.spyOn(axios, 'get').mockResolvedValue({
    data: []
  });
  render(
    <StoreProvider>
      <GridProposals
        forReview
        currentPanel={mockedPanels[0]}
        onChange={item => handleProposalsChange(item)}
      />
    </StoreProvider>
  );
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
    const result = filterProposals(MockProposalFrontendList, '', 4, '');
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
    expect(result[0].scienceCategory).toBe(null);
  });

  test('filters by all criteria', () => {
    const result = filterProposals(
      MockProposalFrontendList,
      'Incomplete Proposal',
      4,
      'standard_proposal'
    );
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Incomplete Proposal');
    expect(result[0].proposalType).toBe(1);
    expect(result[0].scienceCategory).toBe(4);
  });
});

describe('Adds Proposal', () => {
  test('adds a proposal and calls setProposalPanels with updated list', () => {
    const setProposalPanels = vi.fn();
    addProposalPanel(MockProposalFrontendList[0], mockedPanels[0], setProposalPanels);
    expect(setProposalPanels).toHaveBeenCalledWith([
      expect.objectContaining({
        proposalId: MockProposalFrontendList[0].id,
        panelId: mockedPanels[0].id,
        assignedOn: expect.any(String)
      })
    ]);
  });

  test('checks if proposal is not selected correctly', () => {
    const panel = { ...mockedPanels[0] };
    const selected = isProposalSelected(MockProposalFrontendList[0].id, panel);
    expect(selected).toBe(false);
  });

  test('checks if proposal is selected correctly', () => {
    // Simulate adding a proposal to a panel
    const setProposalPanels = vi.fn();
    const panel = { ...mockedPanels[0] };
    addProposalPanel(MockProposalFrontendList[0], panel, setProposalPanels);
    // Get the updated proposals list
    const updatedProposals = setProposalPanels.mock.calls[0][0];
    // Simulate the panel after update
    const updatedPanel = {
      ...panel,
      proposals: updatedProposals
    };
    const selected = isProposalSelected(MockProposalFrontendList[0].id, updatedPanel);
    expect(selected).toBe(true);
  });

  describe('Deletes Reviewer', () => {
    const panel = mockedPanels[0];
    const PanelProposals = [
      {
        proposalId: MockProposalFrontendList[0].id,
        panelId: panel.id,
        assignedOn: new Date().toISOString()
      },
      {
        proposalId: MockProposalFrontendList[1].id,
        panelId: panel.id,
        assignedOn: new Date().toISOString()
      },
      {
        proposalId: MockProposalFrontendList[2].id,
        panelId: panel.id,
        assignedOn: new Date().toISOString()
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
