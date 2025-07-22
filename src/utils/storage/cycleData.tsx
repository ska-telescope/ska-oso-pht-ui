import Proposal from 'utils/types/proposal';

/*************************************************************************************
 * SESSION STORAGE
 *
 * This is data that is stored in the browser for the current session, which means
 * that when the browser is closed, all the information is lost
 *
 ************************************************************************************/

/*********************************************************************************/

export const storeProposalCopy = (response: Proposal) => {
  sessionStorage.setItem('skao_proposal_copy', JSON.stringify(response));
};

export const fetchProposalCopy = () => {
  return JSON.parse(sessionStorage.getItem('skao_proposal_copy'));
};
