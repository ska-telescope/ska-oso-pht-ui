import axios from 'axios';
import {
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA,
  OSO_SERVICES_PANEL_PATH
} from '../../../utils/constants';
import { MockPanelBackendList } from './mockPanelBackendList';
import { Panel, PanelBackend } from '@/utils/types/panel';
import { PanelProposal, PanelProposalBackend } from '@/utils/types/panelProposal';

/*********************************************************** filter *********************************************************/

const groupByPanelId = (data: PanelBackend[]) => {
  return data.reduce((grouped: { [key: string]: PanelBackend[] }, obj) => {
    if (!grouped[obj.panel_id]) {
      grouped[obj.panel_id] = [obj];
    } else {
      grouped[obj.panel_id].push(obj);
    }
    return grouped;
  }, {} as { [key: string]: PanelBackend[] });
};

const sortByLastUpdated = (array: PanelBackend[]): PanelBackend[] => {
  array.sort(function(a, b) {
    return (
      new Date(b.metadata?.last_modified_on as string)?.valueOf() -
      new Date(a.metadata?.last_modified_on as string)?.valueOf()
    );
  });
  return array;
};

export const getUniqueMostRecentPanels = (data: PanelBackend[]) => {
  const grouped = groupByPanelId(data);

  const newestPerGroup = Object.values(grouped).map((arr: PanelBackend[]) => {
    sortByLastUpdated(arr); // newest first
    return arr[0]; // pick newest from group
  });

  newestPerGroup.sort(
    (a, b) =>
      new Date(b.metadata?.last_modified_on!).valueOf() -
      new Date(a.metadata?.last_modified_on!).valueOf()
  ); // TODO sort also by assigned_on

  return newestPerGroup;
};

/*****************************************************************************************************************************/
/*********************************************************** mapping *********************************************************/

const getProposal = (proposal: PanelProposalBackend, panelId: string): PanelProposal => {
  return {
    panelId: panelId,
    proposalId: proposal.prsl_id,
    assignedOn: proposal.assigned_on as string
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
      reviewers: [] // TODO create reviewers backend type and mapping
    };
    output.push(rec);
  }
  return output;
}

/*****************************************************************************************************************************/

export function GetMockPanelList(): Panel[] {
  const uniqueResults =
    MockPanelBackendList.length > 1
      ? getUniqueMostRecentPanels(MockPanelBackendList)
      : MockPanelBackendList;
  return mappingList(uniqueResults);
}

async function GetPanelList(): Promise<Panel[] | string> {
  if (USE_LOCAL_DATA) {
    return GetMockPanelList();
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PANEL_PATH}?user_id=DefaultUser`;
    const result = await axios.get(`${SKA_OSO_SERVICES_URL}${URL_PATH}`);

    if (!result || !Array.isArray(result.data)) {
      return 'error.API_UNKNOWN_ERROR';
    }

    const uniqueResults =
      result.data?.length > 1 ? getUniqueMostRecentPanels(result.data) : result.data;
    return mappingList(uniqueResults);
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'error.API_UNKNOWN_ERROR';
  }
}

export default GetPanelList;
