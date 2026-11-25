import { useFormContext, UseFormReturn } from 'react-hook-form';
import { storageObject } from '@utils/storage/store';
import { Proposal } from '@utils/types/proposal.tsx';
import { countWords } from '@utils/helpers.ts';
import {
  PROPOSAL_STATUS,
  STATUS_ARRAY_PAGES_PROPOSAL,
  STATUS_ARRAY_PAGES_SV
} from '@utils/constants.ts';
import { useProposalOda } from '@/models/proposals/useProposalOda';
import { ProposalType } from '@/models/proposals/proposal';
import { useNotify } from '@/utils/notify/useNotify';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import phtTranslations from '../../../public/locales/en/pht.json';
import { useLastSaved } from './LastSavedContext';

type Save = () => Promise<boolean>;

// Every caller (Save button, timer, navigation) shares this queue. One save runs at a time, so an
// older snapshot can never land after, and overwrite, a newer one. At most one save waits: a newer
// save replaces it, as its snapshot holds everything the waiting one would have sent
let running = false;
let waiting: { save: Save; begin: (save: Save) => void; result: Promise<boolean> } | null = null;

const runSave = (save: Save): Promise<boolean> => {
  running = true;
  const result = save();
  // Whether this save succeeds or fails, start the one waiting behind it
  const next = () => {
    running = false;
    const queued = waiting;
    waiting = null;
    queued?.begin(queued.save);
  };
  result.then(next, next);
  return result;
};

// Resolves with the result of the save that ran: this one, or a newer one that replaced it
const queueSave = (save: Save): Promise<boolean> => {
  if (!running) {
    return runSave(save);
  }
  if (waiting) {
    waiting.save = save;
    return waiting.result;
  }
  let begin: (save: Save) => void = () => {};
  const result = new Promise<boolean>((resolve, reject) => {
    begin = (queued) => runSave(queued).then(resolve, reject);
  });
  waiting = { save, begin, result };
  return result;
};

/** Saves the proposal being edited as a draft. A failed save shows its error; a successful one
 * records when it was saved. */
export function useSaveDraft() {
  const { application } = storageObject.useStore();
  const { isSV } = useOSDAccessors();
  const { saveToOda } = useProposalOda();
  const form = useFormContext<ProposalType>() as UseFormReturn<ProposalType> | null;
  const { notifyError } = useNotify();
  const { recordSave } = useLastSaved();

  // TODO: Get the proposal from the new form context
  const proposal = application.content2 as Proposal;

  // Saving is offered on the proposal pages, once there is a proposal
  const isSavePage = (pageNo: number) =>
    proposal.id !== null &&
    (isSV ? STATUS_ARRAY_PAGES_SV : STATUS_ARRAY_PAGES_PROPOSAL).includes(pageNo);

  const isSaveBlocked = () =>
    !proposal.id ||
    proposal.title?.trim()?.length === 0 ||
    countWords(proposal.title ?? '') > Number(phtTranslations.title.maxWord) ||
    countWords(proposal.abstract ?? '') > Number(phtTranslations.abstract.maxWord);

  // Resolves to whether the proposal was saved, once the save ahead of it has finished
  const saveDraft = (): Promise<boolean> => {
    if (isSaveBlocked()) {
      return Promise.resolve(false);
    }
    // Read the form now: by the time this save runs, the form may have moved on (e.g. leaving the
    // editor resets it)
    const values = form?.getValues();
    return queueSave(async () => {
      const response = await saveToOda(proposal, PROPOSAL_STATUS.DRAFT, values);
      if (!response || 'error' in response) {
        notifyError(response?.error ?? 'An unknown error occurred');
        return false;
      }
      // The backend's time for the save, or now if the response does not say
      recordSave(proposal.id, response.metadata?.last_modified_on ?? new Date().toISOString());
      return true;
    });
  };

  return { saveDraft, isSavePage, isSaveBlocked };
}
