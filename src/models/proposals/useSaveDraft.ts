import { isLoggedIn } from '@ska-telescope/ska-login-page';
import { storageObject } from '@utils/storage/store';
import { Proposal } from '@utils/types/proposal.tsx';
import { countWords } from '@utils/helpers.ts';
import {
  PROPOSAL_STATUS,
  STATUS_ARRAY_PAGES_PROPOSAL,
  STATUS_ARRAY_PAGES_SV
} from '@utils/constants.ts';
import { useProposalOda } from './useProposalOda';
import { useNotify } from '@/utils/notify/useNotify';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import phtTranslations from '../../../public/locales/en/pht.json';

/** Saves the proposal being edited as a draft. A failed save shows its error. */
export function useSaveDraft() {
  const { application } = storageObject.useStore();
  const { isSV } = useOSDAccessors();
  const { saveToOda } = useProposalOda();
  const { notifyError } = useNotify();

  // TODO: Get the proposal from the new form context
  const proposal = application.content2 as Proposal;
  const loggedIn = isLoggedIn();

  // Saving is offered on the proposal pages, once there is a proposal
  const isSavePage = (pageNo: number) =>
    loggedIn &&
    proposal.id !== null &&
    (isSV ? STATUS_ARRAY_PAGES_SV : STATUS_ARRAY_PAGES_PROPOSAL).includes(pageNo);

  const isSaveBlocked = () =>
    !loggedIn ||
    !proposal.id ||
    proposal.title?.trim()?.length === 0 ||
    countWords(proposal.title ?? '') > Number(phtTranslations.title.maxWord) ||
    countWords(proposal.abstract ?? '') > Number(phtTranslations.abstract.maxWord);

  // Resolves to whether the proposal was saved
  const saveDraft = async (): Promise<boolean> => {
    if (isSaveBlocked()) {
      return false;
    }
    const response = await saveToOda(proposal, PROPOSAL_STATUS.DRAFT);
    if (!response || 'error' in response) {
      notifyError(response?.error ?? 'An unknown error occurred');
      return false;
    }
    return true;
  };

  return { saveDraft, isSavePage, isSaveBlocked };
}
