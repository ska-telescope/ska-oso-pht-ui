import React from 'react';
import { useFormContext } from 'react-hook-form';
import { storageObject } from '@utils/storage/store';
import { Box } from '@mui/material';
import { EMPTY_STATUS, PAGE_TITLE_ADD, PROPOSAL_TYPE, TYPE_CONTINUUM } from '@utils/constants.ts';
import Shell from '../../../components/layout/Shell/Shell';
import TitleEntry from '../../entry/TitleEntry/TitleEntry';
import Proposal, { NEW_PROPOSAL } from '../../../utils/types/proposal';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { newDataProductsForMode, newObservationForMode } from '@/utils/autoLinking/AutoLinking';
import { ProposalType } from '@/models/proposals/proposal';
import { getProposalFormValues } from '@/models/proposals/useProposalForm';

const PAGE = PAGE_TITLE_ADD;
const PAGE_INNER = 0;
const PAGE_FOOTER = -1;

export default function AddProposal() {
  const { updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const { isSV } = useOSDAccessors();
  const { reset } = useFormContext<ProposalType>();

  // SV proposals have a single observation whose type is the observing mode, so they start with
  // one in the default mode, which the user can change on the Details page.
  const defaultObservation = () => {
    const observation = newObservationForMode(TYPE_CONTINUUM);
    return { observations: [observation], dataProductSDP: newDataProductsForMode(observation) };
  };

  // SV cycles have no type picker, so a new SV proposal gets its type straight away. The cycle
  // is always selected on the Landing page before this page opens.
  React.useEffect(() => {
    const proposalType = isSV ? PROPOSAL_TYPE.SCIENCE_VERIFICATION : undefined;
    reset(getProposalFormValues({ ...NEW_PROPOSAL, id: undefined, proposalType }));
    updateAppContent1(EMPTY_STATUS);
    updateAppContent2({
      ...NEW_PROPOSAL,
      proposalType,
      ...(proposalType === PROPOSAL_TYPE.SCIENCE_VERIFICATION && defaultObservation())
    });
  }, []);

  return (
    <Box
      sx={{
        pt: 2
      }}
    >
      <Shell page={PAGE} footerPage={PAGE_FOOTER} helpDisabled>
        <TitleEntry page={PAGE_INNER} />
      </Shell>
    </Box>
  );
}
