import React from 'react';
import { FormProvider } from 'react-hook-form';
import { getProposalFormValues, ProposalSeed, useProposalForm } from '../useProposalForm';
import { ObservationOsd } from '../observations';
import { ProposalType } from '../proposal';

/**
 * The global proposal form, as PHT.tsx provides it, holding the given proposal. For unit tests
 * that render a page without PHT.
 *
 * The proposal is given in the legacy shape (`proposal`), in the form's shape (`values`), or both,
 * with `values` taking precedence.
 */
// TODO(T9): Take only form values once the fixtures are in the form's shape
export default function TestProposalFormProvider({
  proposal,
  values,
  osd,
  children
}: {
  proposal?: ProposalSeed;
  values?: Partial<ProposalType>;
  osd?: ObservationOsd;
  children: React.ReactNode;
}) {
  // The form takes its default values once, so they are only built once
  const [initialValues] = React.useState(() => ({
    ...getProposalFormValues(proposal),
    ...values
  }));
  const methods = useProposalForm(osd, initialValues);
  return <FormProvider {...methods}>{children}</FormProvider>;
}
