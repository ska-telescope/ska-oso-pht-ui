import {
  cypressToken,
  DEFAULT_USER,
  OSO_SERVICES_PROPOSAL_PATH,
  PROPOSAL_STATUS,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '@utils/constants.ts';
import Proposal, { ProposalBackend } from '@utils/types/proposal.tsx';
import { Metadata } from '@utils/types/metadata.tsx';
import useAxiosAuthClient from '../../axiosAuthClient/axiosAuthClient.tsx';
import MappingPutProposal from './putProposalMapping.tsx';
import { MockProposalFrontend } from './mockProposalFrontend.tsx';

export function mockPutProposal(proposal?: Proposal) {
  const mapped = MappingPutProposal(MockProposalFrontend, PROPOSAL_STATUS.DRAFT);

  const metadata: Metadata = {
    // A real PUT bumps the version on every save. Deriving it from the proposal
    // in hand - which the previous response's metadata was merged into - keeps
    // successive mock saves distinguishable even when two land inside the same
    // millisecond, which is all mergeProposalSaveMetadata has to order them by.
    version: (proposal?.version ?? 0) + 1,
    created_by: DEFAULT_USER,
    created_on: '2025-07-03T16:20:37.088Z',
    last_modified_by: DEFAULT_USER,
    last_modified_on: new Date().toISOString(),
    pdm_version: '18.2.0'
  };

  return {
    ...mapped,
    // Echo the id actually saved. mergeProposalSaveMetadata drops a response
    // whose prsl_id is not the proposal in hand, so returning the fixture's id
    // would leave the label inert for every other proposal.
    prsl_id: proposal?.id || mapped.prsl_id,
    // MappingPutProposal builds the outbound request body, which carries no
    // metadata - but the last-saved label is driven entirely by the response's.
    // Without this the label never appears under USE_LOCAL_DATA or cypressToken,
    // and the e2e suite cannot exercise or assert it.
    metadata
  };
}

async function PutProposal(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  proposal: Proposal,
  status?: string
): Promise<ProposalBackend | { error: string }> {
  if (USE_LOCAL_DATA || cypressToken) {
    return mockPutProposal(proposal);
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PROPOSAL_PATH}/${proposal.id}`;
    const convertedProposal = MappingPutProposal(proposal, status as string);

    const result = await authAxiosClient.put(
      `${SKA_OSO_SERVICES_URL}${URL_PATH}`,
      convertedProposal
    );
    return !result || !result?.data ? { error: 'error.API_UNKNOWN_ERROR' } : result.data;
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default PutProposal;
