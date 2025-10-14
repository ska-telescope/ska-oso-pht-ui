import useAxiosAuthClient from '../../axiosAuthClient/axiosAuthClient';
import { Panel, PanelBackend } from '@/utils/types/panel';
import { helpers } from '@/utils/helpers';
import { OSO_SERVICES_PANEL_PATH, SKA_OSO_SERVICES_URL, USE_LOCAL_DATA } from '@/utils/constants';

export function mappingPutPanel(panel: Panel, cycleId: string): PanelBackend {
  const transformedPanel: PanelBackend = {
    panel_id: panel.id,
    cycle: panel.cycle ? panel.cycle : cycleId,
    name: panel.name,
    expires_on: panel.expiresOn,
    // metadata: panel.metadata,
    proposals: panel.proposals.map(proposal => ({
      prsl_id: proposal.proposalId,
      assigned_on: proposal.assignedOn ? proposal.assignedOn : new Date().toISOString()
    })),
    sci_reviewers: panel.sciReviewers.map(reviewer => ({
      reviewer_id: reviewer.reviewerId,
      assigned_on: reviewer.assignedOn ? reviewer.assignedOn : new Date().toISOString(),
      status: reviewer.status
    })),
    tech_reviewers: panel.tecReviewers.map(reviewer => ({
      reviewer_id: reviewer.reviewerId,
      assigned_on: reviewer.assignedOn ? reviewer.assignedOn : new Date().toISOString(),
      status: reviewer.status
    }))
  };
  // trim undefined properties
  helpers.transform.trimObject(transformedPanel);
  return transformedPanel;
}

export function putMockPanel(): string {
  return 'PANEL-ID-001';
}

async function PutPanel(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  panel: Panel,
  cycleId: string
): Promise<string | { error: string }> {
  if (USE_LOCAL_DATA) {
    return putMockPanel();
  }

  try {
    const result = await authAxiosClient.put(
      `${SKA_OSO_SERVICES_URL}${OSO_SERVICES_PANEL_PATH}/${panel.id}`,
      mappingPutPanel(panel, cycleId)
    );

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

export default PutPanel;
