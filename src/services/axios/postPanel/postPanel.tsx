import axios from 'axios';
import {
  CYCLE,
  OSO_SERVICES_PANEL_PATH,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '../../../utils/constants';
import { Panel, PanelBackend } from '@/utils/types/panel';
import { helpers } from '@/utils/helpers';

export function mappingPostPanel(panel: Panel): PanelBackend {
  const transformedPanel: PanelBackend = {
    panel_id: panel.id,
    cycle: panel.cycle ? panel.cycle : CYCLE, // hardcoded for now
    name: panel.name,
    expires_on: panel.expiresOn,
    metadata: panel.metadata,
    proposals: panel.proposals.map(proposal => ({
      prsl_id: proposal.proposalId,
      assigned_on: proposal.assignedOn ? proposal.assignedOn : new Date().toISOString()
    })),
    reviewers: panel.reviewers.map(reviewer => ({
      reviewer_id: reviewer.reviewerId,
      assigned_on: reviewer.assignedOn ? reviewer.assignedOn : new Date().toISOString(),
      status: reviewer.status
    }))
  };
  // trim undefined properties
  helpers.transform.trimObject(transformedPanel);
  return transformedPanel;
}

export function postMockPanel(): string {
  return 'PANEL-ID-001';
}

async function PostPanel(panel: Panel): Promise<string | { error: string }> {
  if (USE_LOCAL_DATA) {
    return postMockPanel();
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PANEL_PATH}/`;
    const convertedPanel = mappingPostPanel(panel);

    const result = await axios.post(`${SKA_OSO_SERVICES_URL}${URL_PATH}`, convertedPanel);

    if (!result) {
      return { error: 'error.API_UNKNOWN_ERROR' };
    }
    return result.data as string;
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default PostPanel;
