import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import ProposalUrlLoader from './ProposalUrlLoader';

const mocks = vi.hoisted(() => ({
  getAccess: vi.fn(),
  loadFromOda: vi.fn(),
  updateAppContent2: vi.fn(),
  updateAppContent4: vi.fn()
}));

vi.mock('@azure/msal-react', () => ({
  useMsal: () => ({ accounts: [{ localAccountId: 'user-1' }] })
}));

vi.mock('@/utils/storage/store', () => ({
  storageObject: {
    useStore: () => ({
      application: { content2: {} },
      updateAppContent2: mocks.updateAppContent2,
      updateAppContent4: mocks.updateAppContent4
    })
  }
}));

vi.mock('@/services/axios/axiosAuthClient/axiosAuthClient', () => ({
  default: () => ({ axiosClient: {} })
}));

vi.mock('@/services/axios/get/getProposalAccess/proposal/getProposalAccessForProposal', () => ({
  default: mocks.getAccess
}));

vi.mock('./useProposalOda', () => ({
  useProposalOda: () => ({ loadFromOda: mocks.loadFromOda })
}));

describe('ProposalUrlLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('loads and renders a proposal after confirming update access', async () => {
    mocks.getAccess.mockResolvedValue([
      { prslId: 'proposal-1', userId: 'user-1', permissions: ['update'], role: 'Co-Investigator' }
    ]);
    mocks.loadFromOda.mockResolvedValue({ id: 'proposal-1' });

    render(
      <ProposalUrlLoader proposalId="proposal-1">
        <div data-testid="editor">Editor</div>
      </ProposalUrlLoader>
    );

    expect(await screen.findByTestId('editor')).toBeInTheDocument();
    expect(mocks.loadFromOda).toHaveBeenCalledWith('proposal-1');
    expect(mocks.updateAppContent2).toHaveBeenCalledWith({ id: 'proposal-1' });
  });

  test('does not load or render a proposal without update access', async () => {
    mocks.getAccess.mockResolvedValue([
      { prslId: 'proposal-1', userId: 'user-1', permissions: ['view'], role: 'Co-Investigator' }
    ]);

    render(
      <ProposalUrlLoader proposalId="proposal-1">
        <div data-testid="editor">Editor</div>
      </ProposalUrlLoader>
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'You do not have edit access to this proposal.'
    );
    expect(screen.queryByTestId('editor')).not.toBeInTheDocument();
    expect(mocks.loadFromOda).not.toHaveBeenCalled();
  });
});
