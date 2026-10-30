import React from 'react';
import { FormProvider } from 'react-hook-form';
import { storageObject } from '@utils/storage/store';
import Proposal from '@utils/types/proposal';
import { useProposalForm } from './useProposalForm';
import { useCopySlicesToStore } from './useCopySlicesToStore';

/**
 * The global proposal form seeded from the legacy store, as PHT.tsx provides it. For tests and
 * stories that render a page without PHT.
 */
export default function ProposalFormProvider({ children }: { children: React.ReactNode }) {
  const { application } = storageObject.useStore();
  const methods = useProposalForm(application.content2 as Proposal);
  useCopySlicesToStore(methods);
  return <FormProvider {...methods}>{children}</FormProvider>;
}
