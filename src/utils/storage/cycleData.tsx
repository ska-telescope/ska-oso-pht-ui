import CycleData from 'utils/types/cycleData';
import Proposal from 'utils/types/proposal';

/*************************************************************************************
 * SESSION STORAGE
 *
 * This is data that is stored in the browser for the current session, which means
 * that when the browser is closed, all the information is lost
 *
 ************************************************************************************/

export const storeCycleData = (response: CycleData[]) => {
  sessionStorage.setItem('skao_cycle_data', JSON.stringify(response));
};

export const fetchCycleData = () => {
  const data = JSON.parse(sessionStorage.getItem('skao_cycle_data'));
  return data[0];
};

/*********************************************************************************/

export const storeProposalCopy = (response: Proposal) => {
  sessionStorage.setItem('skao_proposal_copy', JSON.stringify(response));
};

export const fetchProposalCopy = () => {
  return JSON.parse(sessionStorage.getItem('skao_proposal_copy'));
};
