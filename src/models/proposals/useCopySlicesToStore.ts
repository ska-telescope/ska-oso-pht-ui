import React from 'react';
import { useWatch, UseFormReturn } from 'react-hook-form';
import { storageObject } from '@utils/storage/store';
import Proposal from '@utils/types/proposal';
import { ProposalType, STORE_COPIED_SLICES } from './proposal';

const pickSlices = (values: Partial<ProposalType> | Proposal) =>
  Object.fromEntries(STORE_COPIED_SLICES.map((key) => [key, values[key]])) as ProposalType;

/**
 * Keeps the legacy store's copy of every form-owned slice up to date for code that still reads
 * them from there (page status, the observation summary, the sensitivity modal, clone, and the
 * pages not yet migrated). It is the one place the form's values reach the store: pages write
 * only to the form. The copy only goes from the form to the store, and also corrects the store
 * when a legacy write puts an older copy back.
 *
 * Call it straight after useProposalForm, so a re-seed on proposal switch has already happened.
 * Only one form may copy into the store: two would keep overwriting each other. A second one
 * reports an error and copies nothing.
 */
// The hook instance currently copying into the store
let copyOwner: symbol | null = null;

export function useCopySlicesToStore(
  form: Pick<UseFormReturn<ProposalType>, 'control' | 'getValues'>
) {
  const { application, updateAppContent2 } = storageObject.useStore();
  const watched = useWatch({ control: form.control, name: [...STORE_COPIED_SLICES] });
  const proposal = application.content2 as Proposal;
  const ownerId = React.useRef(Symbol('useCopySlicesToStore'));

  React.useEffect(() => {
    if (copyOwner) {
      console.error('useCopySlicesToStore: another form already copies into the store');
      return;
    }
    copyOwner = ownerId.current;
    return () => {
      if (copyOwner === ownerId.current) {
        copyOwner = null;
      }
    };
  }, []);

  React.useEffect(() => {
    if (copyOwner !== ownerId.current) {
      return;
    }
    // Nothing to copy into until a proposal is open (the store is cleared between proposals). A
    // new proposal is open before it has an ID, while its title and type are being entered.
    if (!proposal || !('id' in proposal)) {
      return;
    }
    // Read the form now rather than the watched values, which can still be the previous
    // proposal's when the form was re-seeded in this commit
    const slices = pickSlices(form.getValues());
    if (JSON.stringify(pickSlices(proposal)) === JSON.stringify(slices)) {
      return;
    }
    // The store freezes what it is given, and the form must stay mutable
    updateAppContent2({
      ...proposal,
      ...structuredClone(slices),
      ...(proposal.scienceCategory !== slices.scienceCategory && { scienceSubCategory: [1] })
    });
  }, [...watched, proposal]);
}
