import React from 'react';
import { Box } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { ProposalType } from '@/models/proposals/proposal';
import { PAGE_OBSERVATION_UPDATE } from '@/utils/constants';
import HelpShell from '@/components/layout/HelpShell/HelpShell';
import { useHelp } from '@/utils/help/useHelp';
import ObservationView from './ObservationView';

/**
 * An SV proposal's one observation, edited in place in the proposal form. Its observing mode is
 * set on the Details page. The observations page's Shell leaves the room for its footer.
 */
export default function ObservationInPlace() {
  const { setHelp } = useHelp();
  const proposalForm = useFormContext<ProposalType>();

  React.useEffect(() => {
    setHelp('observationId');
  }, []);

  return (
    <HelpShell page={PAGE_OBSERVATION_UPDATE}>
      <Box sx={{ pt: 2 }}>
        <ObservationView index={0} groupIds={[]} proposalForm={proposalForm} />
      </Box>
    </HelpShell>
  );
}
