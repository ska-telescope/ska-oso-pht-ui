import axios from 'axios';
import {
  AXIOS_CONFIG,
  OSO_SERVICES_PANEL_PATH,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA
} from '../../../utils/constants';
import { Panel, PanelBackend } from '@/utils/types/panel';
import { helpers } from '@/utils/helpers';

function mappingPostPanel(panel: Panel): PanelBackend {
  const transformedPanel: PanelBackend = {
    panel_id: panel.id,
    cycle: 'cycle-001', // hardcoded for now
    name: panel.name,
    proposals: panel.proposals.map(proposal => ({
      prsl_id: proposal.proposalId,
      assigned_on: proposal.assignedOn
    })),
    reviewers: [] // TODO map reviewers
  };
  // trim undefined properties
  helpers.transform.trimObject(transformedPanel);
  return transformedPanel;
}

async function PostPanel(panel: Panel) {
  if (USE_LOCAL_DATA) {
    return 'PANEL-ID-001';
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PANEL_PATH}/`;
    const convertedPanel = mappingPostPanel(panel);

    const result = await axios.post(
      `${SKA_OSO_SERVICES_URL}${URL_PATH}`,
      convertedPanel,
      AXIOS_CONFIG
    );
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default PostPanel;
