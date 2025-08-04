import axios from 'axios';
import {
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA,
  OSO_SERVICES_PANEL_PATH
} from '../../../utils/constants';
import { MockPanelBackendList } from './mockPanelBackendList';
import { Panel, PanelBackend } from '@/utils/types/panel';
import { PanelProposal, PanelProposalBackend } from '@/utils/types/panelProposal';
import { PanelReviewer, PanelReviewerBackend } from '@/utils/types/panelReviewer';
import { getUniqueMostRecentItems } from '@/utils/helpers';

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
      reviewers:
        inRec[i].reviewers?.length > 0
          ? inRec[i].reviewers.map(reviewer => getReviewer(reviewer, inRec[i].panel_id))
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

async function GetPanelList(user_id = 'DefaultUser'): Promise<Panel[] | string> {
  if (USE_LOCAL_DATA) {
    return GetMockPanelList();
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PANEL_PATH}/list/${user_id}`;
    const result = await axios.get(`${SKA_OSO_SERVICES_URL}${URL_PATH}`);

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
