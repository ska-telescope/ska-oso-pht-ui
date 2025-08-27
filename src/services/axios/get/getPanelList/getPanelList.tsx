import {
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA,
  OSO_SERVICES_PANEL_PATH,
  DEFAULT_USER
} from '@utils/constants.ts';
import { Panel, PanelBackend } from '@utils/types/panel.tsx';
import { PanelProposal, PanelProposalBackend } from '@utils/types/panelProposal.tsx';
import { PanelReviewer, PanelReviewerBackend } from '@utils/types/panelReviewer.tsx';
import { getUniqueMostRecentItems } from '@utils/helpers.ts';
import useAxiosAuthClient from '../../axiosAuthClient/axiosAuthClient.tsx';
import { MockPanelBackendList } from './mockPanelBackendList.tsx';

/*****************************************************************************************************************************/
/*********************************************************** mapping *********************************************************/

const getProposal = (proposal: PanelProposalBackend, panelId: string): PanelProposal => {
  return {
    panelId: panelId,
    proposalId: proposal.prsl_id,
    assignedOn: proposal.assigned_on as string
  };
};

const getReviewer = (reviewer: PanelReviewerBackend, panelId: string): PanelReviewer => {
  return {
    panelId: panelId,
    reviewerId: reviewer.reviewer_id,
    assignedOn: reviewer.assigned_on as string,
    status: reviewer.status
  };
};

export function mappingList(inRec: PanelBackend[]): Panel[] {
  const output = [];
  for (let i = 0; i < inRec.length; i++) {
    const rec: Panel = {
      id: inRec[i].panel_id?.toString(),
      metadata: inRec[i].metadata, // TODO create metadata backend type and mapping + modify frontend type to be camelCase
      name: inRec[i].name,
      expiresOn: inRec[i].expires_on, // TODO check why PDM doesn't have expiry date
      proposals:
        inRec[i].proposals?.length > 0
          ? inRec[i].proposals.map(proposal => getProposal(proposal, inRec[i].panel_id))
          : [],
      sciReviewers:
        inRec[i].sci_reviewers?.length > 0
          ? inRec[i].sci_reviewers.map(reviewer => getReviewer(reviewer, inRec[i].panel_id))
          : [],
      tecReviewers:
        inRec[i].tech_reviewers?.length > 0
          ? inRec[i].tech_reviewers.map(reviewer => getReviewer(reviewer, inRec[i].panel_id))
          : []
    };
    output.push(rec);
  }
  return output;
}

/*****************************************************************************************************************************/

export function GetMockPanelList(mock = MockPanelBackendList): Panel[] {
  const uniqueResults = mock.length > 1 ? getUniqueMostRecentItems(mock, 'panel_id') : mock;
  return mappingList(uniqueResults);
}

async function GetPanelList(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  user_id = DEFAULT_USER
): Promise<Panel[] | string> {
  if (USE_LOCAL_DATA) {
    return GetMockPanelList();
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PANEL_PATH}/users/${user_id}/panels`;
    const result = await authAxiosClient.get(`${SKA_OSO_SERVICES_URL}${URL_PATH}`);

    if (!result || !Array.isArray(result.data)) {
      return 'error.API_UNKNOWN_ERROR';
    }

    const uniqueResults: PanelBackend[] =
      result.data?.length > 1 ? getUniqueMostRecentItems(result.data, 'panel_id') : result.data;
    return mappingList(uniqueResults);
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'error.API_UNKNOWN_ERROR';
  }
}

export default GetPanelList;
