import React from 'react';
import { FormProvider } from 'react-hook-form';
import { getProposalFormDefaults, useProposalForm } from '../useProposalForm';
import { ObservationOsd } from '../observations';
import { ProposalType } from '../proposal';

/**
 * The global proposal form, as PHT.tsx provides it, holding the given values over the defaults
 * of a new proposal. For unit tests that render a page without PHT.
 */
export default function TestProposalFormProvider({
  values,
  osd,
  children
}: {
  values?: Partial<ProposalType>;
  osd?: ObservationOsd;
  children: React.ReactNode;
}) {
  // The form takes its default values once, so they are only built once
  const [initialValues] = React.useState(() => ({ ...getProposalFormDefaults(), ...values }));
  const methods = useProposalForm(osd, initialValues);
  return <FormProvider {...methods}>{children}</FormProvider>;
}
