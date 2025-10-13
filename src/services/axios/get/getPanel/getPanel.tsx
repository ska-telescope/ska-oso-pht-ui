import { SKA_OSO_SERVICES_URL, USE_LOCAL_DATA, OSO_SERVICES_PANEL_PATH } from '@utils/constants.ts';
import { Panel, PanelBackend } from '@utils/types/panel.tsx';
import { PanelProposal, PanelProposalBackend } from '@utils/types/panelProposal.tsx';
import { PanelReviewer, PanelReviewerBackend } from '@utils/types/panelReviewer.tsx';
import useAxiosAuthClient from '../../axiosAuthClient/axiosAuthClient.tsx';
import { MockPanelBackend } from './mockPanelBackend.tsx';

/*****************************************************************************************************************************/
/*********************************************************** mapping *********************************************************/

const getProposal = (proposal: PanelProposalBackend, panelId: string): PanelProposal => {
  return {
    panelId: panelId,
    proposalId: proposal.prsl_id,
    assignedOn: proposal.assigned_on as string
  };
};

const getReviewer = (reviewer: PanelReviewerBackend, panelId: string, reviewType: string): PanelReviewer => {
  return {
    reviewType: reviewType,
    panelId: panelId,
    reviewerId: reviewer.reviewer_id,
    assignedOn: reviewer.assigned_on as string,
    status: reviewer.status
  };
};

export function mapping(inRec: PanelBackend): Panel {
  console.log('rec ', inRec);
  const rec: Panel = {
    id: inRec.panel_id?.toString(),
    metadata: inRec.metadata, // TODO create metadata backend type and mapping + modify frontend type to be camelCase
    name: inRec.name,
    expiresOn: inRec.expires_on, // TODO check why PDM doesn't have expiry date
    proposals:
      inRec.proposals?.length > 0
        ? inRec.proposals.map(proposal => getProposal(proposal, inRec.panel_id))
        : [],
    sciReviewers:
      inRec.sci_reviewers?.length > 0
        ? inRec.sci_reviewers.map(reviewer => getReviewer(reviewer, inRec.panel_id))
        : [],
    tecReviewers:
      inRec.tech_reviewers?.length > 0
        ? inRec.tech_reviewers.map(reviewer => getReviewer(reviewer, inRec.panel_id))
        : []
  };
  return rec;
}

/*****************************************************************************************************************************/

export function GetMockPanel(mock = MockPanelBackend): Panel {
  return mapping(mock);
}

async function GetPanel(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  id: string
): Promise<Panel | string> {
  if (USE_LOCAL_DATA) {
    return GetMockPanel();
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PANEL_PATH}/${id}`;
    const result = await authAxiosClient.get(`${SKA_OSO_SERVICES_URL}${URL_PATH}`);

    if (!result.data) {
      return 'error.API_UNKNOWN_ERROR';
    }
    return mapping(result.data);
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'error.API_UNKNOWN_ERROR';
  }
}

export default GetPanel;
