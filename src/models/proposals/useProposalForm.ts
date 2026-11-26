import React from 'react';
import { useForm } from 'react-hook-form';
import { ProposalType, getProposalResolver } from './proposal';
import { ObservationOsd } from './observations';

/** The form values of a new proposal. */
export const getProposalFormDefaults = (): ProposalType => ({
  // No proposal is open
  prslId: '',
  cycle: '',
  title: '',
  proposalType: { type: null, subTypes: [] },
  abstract: '',
  scienceCategory: null,
  investigators: [],
  targets: [],
  targetObservation: [],
  calibrationStrategy: [],
  sciencePDF: null,
  technicalPDF: null,
  dataProducts: [],
  observations: []
});

/**
 * The global proposal form. It starts empty: a proposal is opened by resetting the form (load,
 * create, clone or a new proposal) and closed by resetting it to getProposalFormDefaults().
 * Tests may pass initial values.
 */
export function useProposalForm(
  osd: ObservationOsd = {},
  initialValues: ProposalType = getProposalFormDefaults()
) {
  // The OSD loads after the form is created. The form takes the resolver it is given on each
  // render, so this one is rebuilt when the OSD changes.
  const resolver = React.useMemo(
    () => getProposalResolver({ low: osd.low, mid: osd.mid }),
    [osd.low, osd.mid]
  );
  return useForm<ProposalType>({
    mode: 'all',
    resolver,
    defaultValues: initialValues
  });
}
