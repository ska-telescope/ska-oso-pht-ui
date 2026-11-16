import React from 'react';
import { useMsal } from '@azure/msal-react';
import Proposal from '@/utils/types/proposal';
import { storageObject } from '@/utils/storage/store';
import { useProposalOda } from './useProposalOda';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import GetProposalAccessForProposal from '@/services/axios/get/getProposalAccess/proposal/getProposalAccessForProposal';
import { accessUpdate } from '@/utils/aaa/aaaUtils';

type ProposalUrlLoaderProps = React.PropsWithChildren<{ proposalId: string }>;

type LoadState = {
  proposalId: string;
  status: 'loading' | 'ready' | 'error';
  message?: string;
};

export default function ProposalUrlLoader({ proposalId, children }: ProposalUrlLoaderProps) {
  const { accounts } = useMsal();
  const accountId = accounts[0]?.localAccountId ?? '';
  const { application, updateAppContent2, updateAppContent4 } = storageObject.useStore();
  const { axiosClient } = useAxiosAuthClient();
  const { loadFromOda } = useProposalOda();
  const proposal = application.content2 as Proposal;
  const latestRef = React.useRef({
    proposal,
    axiosClient,
    loadFromOda,
    updateAppContent2,
    updateAppContent4
  });
  const [loadState, setLoadState] = React.useState<LoadState>({ proposalId, status: 'loading' });

  React.useEffect(() => {
    latestRef.current = {
      proposal,
      axiosClient,
      loadFromOda,
      updateAppContent2,
      updateAppContent4
    };
  });

  React.useEffect(() => {
    let active = true;

    const clearCurrentProposal = () => {
      latestRef.current.updateAppContent2({});
      latestRef.current.updateAppContent4([]);
    };

    const load = async () => {
      if (!accountId) {
        clearCurrentProposal();
        setLoadState({
          proposalId,
          status: 'error',
          message: 'Sign in with an account that has edit access to this proposal.'
        });
        return;
      }

      if (latestRef.current.proposal?.id !== proposalId) {
        clearCurrentProposal();
      }

      const accessResponse = await GetProposalAccessForProposal(
        latestRef.current.axiosClient,
        proposalId
      );
      if (!active) return;
      if (typeof accessResponse === 'string') {
        clearCurrentProposal();
        setLoadState({ proposalId, status: 'error', message: accessResponse });
        return;
      }

      const userAccess = accessResponse.filter((access) => access.userId === accountId);
      if (!accessUpdate(userAccess, proposalId)) {
        clearCurrentProposal();
        setLoadState({
          proposalId,
          status: 'error',
          message: 'You do not have edit access to this proposal.'
        });
        return;
      }

      latestRef.current.updateAppContent4(accessResponse);
      if (latestRef.current.proposal?.id === proposalId) {
        setLoadState({ proposalId, status: 'ready' });
        return;
      }

      const loadedProposal = await latestRef.current.loadFromOda(proposalId);
      if (!active) return;
      if (typeof loadedProposal === 'string' || loadedProposal.id !== proposalId) {
        setLoadState({
          proposalId,
          status: 'error',
          message:
            typeof loadedProposal === 'string'
              ? loadedProposal
              : 'The proposal could not be loaded.'
        });
        return;
      }

      latestRef.current.updateAppContent2(loadedProposal);
      setLoadState({ proposalId, status: 'ready' });
    };

    void load().catch((error: unknown) => {
      if (!active) return;
      clearCurrentProposal();
      setLoadState({
        proposalId,
        status: 'error',
        message: error instanceof Error ? error.message : 'The proposal could not be loaded.'
      });
    });

    return () => {
      active = false;
    };
  }, [accountId, proposalId]);

  if (loadState.proposalId !== proposalId || loadState.status === 'loading') {
    return <div role="status">Loading proposal...</div>;
  }
  if (loadState.status === 'error') {
    return <div role="alert">{loadState.message}</div>;
  }
  return children;
}
